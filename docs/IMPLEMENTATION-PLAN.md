# Implementation Plan — Architecture Improvements

> Companion to [ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md).
> Written so that each task can be executed **independently** by an AI coding
> assistant (Copilot, Claude Sonnet, …) or a junior developer, in order.

## How to use this plan (read this first, every session)

- **One task = one branch = one PR.** Do not bundle tasks. Do not start the next
  task in the same PR "while you're at it".
- **Scope discipline**: only touch the files listed in the task. If you believe
  another file must change, stop and say so instead of changing it.
- Every task ends with the same **global verification**:
  ```bash
  pnpm build        # runs astro check + astro build — must pass
  pnpm lint         # must pass
  pnpm test         # must pass (exists after task 1.1)
  ```
  plus the task's own acceptance criteria.
- **House rules** (from CLAUDE.md, non-negotiable): English identifiers/comments,
  `===`/`!==` only, always `{}` after `if/for/while`, `type Props = {}` +
  `defineProps<Props>()`, boolean prop shorthand, `useTemplateRef` for DOM refs,
  new PB migration files only (never edit existing ones), propose commits and wait
  for approval.
- Manual smoke test for UI tasks: `pnpm db` (terminal 1) + `pnpm dev` (terminal 2),
  then exercise the affected screens.

## Dependency graph

```
Phase 0 (checks)            — independent, do first
Phase 1 (test harness)      — independent
Phase 2 (src/lib core)      — blocks phases 3, 4, 5
Phase 3 (dedupe composables)— blocks phase 6 partially
Phase 4 (security/robustness)
Phase 5 (modals unification)
Phase 6 (Go backend)        — independent of 2–5
Phase 7 (CI, docs, hygiene) — last
```

---

## Phase 0 — Verifications & decisions (human + AI, no code changes)

### 0.1 ✅ RESOLVED — custom PocketBase binary confirmed in production

Verified 2026-07-14 (owner confirmation + `jota-one/infra` inspection):
`infra/.github/workflows/deploy-pb-db.yaml` builds the binary from `pb/` sources
when `go.mod` is present, and `infra/bin/pb_install` never overwrites a
source-built binary (it reports version `(untracked)`, which the script skips).
`.pbversion` drift from go.mod is harmless — it only drives rollback-to-upstream.

**Remaining follow-up** (small doc task): update `pb/README.md` "Recommandation"
section, which still presents the repo-side Go build step as pending — describe
the actual infra-side mechanism instead. Fold this into task 6.3.

### 0.2 Decide static vs SSR (D2)

A full proposal exists: [INFRA-STATIC-MODE.md](./INFRA-STATIC-MODE.md). Key facts:
the infra already models the target (`serve: pb-static` in `schemas/apps.json`,
`Caddyfile.j2`, `ops/services.py`); three small backward-compatible infra patches
are needed (`pb_watch_check` restart-target, empty-`.entrypoint` guard, node-unit
decommission) plus the `apps.yaml` switch. Get the proposal validated by the infra
owner. If approved, enable task 7.4 and follow the sequencing in
INFRA-STATIC-MODE.md §5 (infra patches first — they are inert; then app release +
`apps.yaml` switch in one maintenance window).

### 0.3 Verify `.env` contains only PUBLIC_ values

`.env` is committed. Confirm it only holds `PUBLIC_PB_BASE_URI`-style values.
Any secret → move to `.env.local` and rotate it.

---

## Phase 1 — Test harness (do early: later tasks add tests)

### 1.1 Set up vitest properly

**Files**: `vitest.config.ts` (new), `package.json`.

1. Create `vitest.config.ts`:
   ```ts
   import { defineConfig } from 'vitest/config'
   import { fileURLToPath } from 'node:url'

   export default defineConfig({
     test: {
       include: ['src/**/*.test.ts'],
       environment: 'node',
     },
     resolve: {
       alias: {
         '@admin': fileURLToPath(new URL('./src/admin', import.meta.url)),
         '@lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
       },
     },
   })
   ```
2. Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

**Acceptance**: `pnpm test` runs and the existing `strings.test.ts` passes.

### 1.2 Tests for `computeQuizScore`

**Files**: `src/helpers/quizScore.test.ts` (new).

Cover: all-known fast run ≈ 100; all-unknown → low; skipped penalty; zero total;
zero duration; `scoreColorClass` boundaries. Read the implementation first; assert
current behavior (characterization tests).

**Acceptance**: ≥ 8 assertions, `pnpm test` green.

### 1.3 Extract & test quiz deck logic

**Files**: `src/admin/helpers/quizDeck.ts` (new),
`src/admin/helpers/quizDeck.test.ts` (new), `src/admin/composables/useQuizSession.ts`.

1. Move out of `useQuizSession.ts` into pure functions in `quizDeck.ts`:
   - `shuffle<T>(arr: T[]): T[]` (lines 31–37)
   - `partitionResumedItems(quizItems, attempts)` — the set arithmetic of
     `resumeSession` (lines 162–184) returning `{ unattempted, skippedOnly }`
   - `computeSkipInsertIndex(deck, currentIndex)` — the skipped-zone scan of
     `logAttempt` (lines 259–272) returning the insertion index
2. `useQuizSession.ts` imports and uses them; behavior identical.
3. Tests: skip inserts never before an unanswered card; resume excludes
   definitively-answered items; a skip-then-known item is not in `skippedOnly`.

**Acceptance**: quiz play + resume works in manual smoke test; tests green.

---

## Phase 2 — Shared core layer `src/lib/` (foundation for everything)

### 2.1 Single PocketBase client

**Files**: `src/lib/pb.ts` (new).

```ts
import PocketBase from 'pocketbase'
import config from '@config'

export const pb = new PocketBase(config.apiBaseUrl)
pb.autoCancellation(false)

export const fileUrl = (record: { [k: string]: any }, filename: string) => {
  if (!filename) {
    return ''
  }
  return pb.files.getURL(record, filename)
}
```

Add alias `@lib/*` → `./src/lib/*` in `tsconfig.json` `paths`.

**Note on `autoCancellation(false)`**: today only `useQuizSession` disables it, but
auto-cancellation keys on request signature and the app frequently issues parallel
identical-shape list requests (Search.vue `Promise.all`); disabling globally matches
current de-facto behavior and avoids a class of "cancelled request" bugs.

**Acceptance**: file exists, builds. Not yet consumed (next tasks).

### 2.2 Migrate ALL `new PocketBase(...)` call sites to the shared client

**Files**: every file listed by `grep -rln "new PocketBase" src` (28 files).

Mechanical, per file:
1. Delete `import PocketBase from 'pocketbase'` and the `const pb = new PocketBase(...)` line
   (and the now-unused `config` import if it has no other use).
2. Add `import { pb } from '@lib/pb'`.
3. In `useAuth.ts` keep exporting `pb` for backward compatibility, but it must be
   the imported shared instance, not a locally created one.
4. Remove `pb.autoCancellation(false)` from `useQuizSession.ts` (now global).

**Do NOT** change any query logic in this task.

**Acceptance**: `grep -rn "new PocketBase" src` returns **only** `src/lib/pb.ts`.
Manual smoke: login, admin list signs, public lexique, search, quiz start.

### 2.3 Move `createSlug` to `src/lib/slug.ts`

**Files**: `src/lib/slug.ts` (new), `src/admin/helpers/strings.ts`,
`src/admin/helpers/strings.test.ts`, `scripts/migrate-slugs.js`, plus all importers
of `@admin/helpers/strings` (`grep -rln "helpers/strings" src scripts`).

1. Move the `createSlug` implementation verbatim to `src/lib/slug.ts`.
2. `src/admin/helpers/strings.ts` becomes `export { createSlug } from '@lib/slug'`
   (keeps old imports working), or update all importers to `@lib/slug` and delete
   the old file — prefer the latter if ≤ 10 files.
3. `scripts/migrate-slugs.js`: delete the hand-copied `createSlug`, import from
   `../src/lib/slug.ts` (rename script to `.mjs`/use `node --experimental-strip-types`
   if needed — verify the script still runs with `node scripts/migrate-slugs.js --help`
   or a dry-run guard; if TS import from a JS script is painful, convert the script
   to TypeScript executed via `pnpm vitest run` is NOT acceptable — use `tsx` or
   keep a `.mjs` copy generated by hand ONLY as last resort and say so in the PR).
4. Move the test file to `src/lib/slug.test.ts`.

**Acceptance**: `grep -rn "normalize('NFKD')" src scripts` → exactly one hit
(`src/lib/slug.ts`). Tests green.

### 2.4 Fix the naive slug in the public lexique composable (bug fix)

**Files**: `src/components/lexique/composables/useSigns.ts`.

Line 44 builds a slug with `payload.name.toLowerCase().replace(/\s+/g, '-')` —
accented names produce slugs the Go hook rejects. This whole `setFormData`/add/
update/delete block is dead code on the public site (Phase 3 removes it), but if
Phase 3 is delayed: replace the naive expression with `createSlug(payload.name)`
from `@lib/slug`.

**Acceptance**: no local slug string-munging left in the file.

### 2.5 Shared sign option lists & level converters

**Files**: `src/lib/signOptions.ts` (new), `src/admin/composables/useSigns.ts`,
`src/components/lexique/composables/useSigns.ts`.

Move `learningSourceOptions`, `primaryLanguageOptions`, `verificationStatusOptions`,
`translateNumericLevel`, `getNumericLevel` into `src/lib/signOptions.ts` (exported
consts/functions). Both composables import from there; delete local copies.

**Acceptance**: `grep -rn "Dictionnaire" src` → one hit (`src/lib/signOptions.ts`).

---

## Phase 3 — Deduplicate public composables (depends on Phase 2)

### 3.1 Public lexique `useSigns` becomes read-only

**Files**: `src/components/lexique/composables/useSigns.ts`, its consumers
(`grep -rln "composables/useSigns" src/components/lexique`).

1. Delete `setFormData`, `addSign`, `updateSign`, `deleteSign` and related imports.
2. Keep only `loadSigns(category)`, `loadSign(id)`, converters re-exported from
   `@lib/signOptions`.
3. Verify no consumer used the deleted functions (`grep -rn "addSign\|updateSign\|deleteSign" src/components`).

**Acceptance**: public lexique browsing works; file < 60 lines.

### 3.2 Public culture `usePersons` becomes read-only

Same recipe as 3.1 for `src/components/culture/composables/usePersons.ts`
(keep `loadPersons`, `loadPerson`, `getIllustrationUrl` — the latter now delegates
to `fileUrl` from `@lib/pb`).

### 3.3 Public `useGeneralCulture`: share formatting

**Files**: `src/lib/dates.ts` (new),
`src/components/culture-generale/composables/useGeneralCulture.ts`,
`src/admin/composables/useGeneralCulture.ts`.

Move `formatDate`, `formatDateRange`, `isPeriod` to `src/lib/dates.ts` (+ a small
`dates.test.ts`: partial dates `2020`, `2020-05`, `2020-05-17`). Public composable
keeps only read operations; admin keeps CRUD.

**Acceptance**: general-culture public page renders dates identically; tests green.

---

## Phase 4 — Auth & robustness (depends on Phase 2)

### 4.1 Single source of truth for auth state

**Files**: `src/admin/composables/useAuth.ts`, `src/components/AuthGuard.astro`.

1. In `useAuth.ts`: derive everything from `pb.authStore`:
   - `isAuthenticated = computed(() => authValid.value)` where `authValid` is a
     `ref(pb.authStore.isValid)` updated inside `pb.authStore.onChange`.
   - Keep writing `sessionStorage.userJwt` **only** because `AuthGuard.astro` reads
     it pre-hydration — but write it from the single `onChange` handler, not from
     `login`/`logout`/`refreshAuth` individually. On `onChange` with invalid store,
     clear it.
   - Better: have `AuthGuard.astro`'s inline script read the PB key directly:
     ```js
     let ok = false
     try {
       const raw = localStorage.getItem('pocketbase_auth')
       ok = !!(raw && JSON.parse(raw).token)
     } catch (e) { ok = false }
     ```
     then delete the `userJwt` mirror entirely. Choose this variant; keep
     `impersonatorJwt` in sessionStorage (it is intentionally tab-scoped? No —
     impersonation should survive reloads; move it to `useLocalStorage`).
2. Type the user: add `TUser` in `src/types/user.ts` (id, email, name, expand.roles)
   and replace `ref<any>({})` with `ref<TUser | null>(null)`; adjust `roles`
   computed for null.

**Acceptance**: login, reload, close/reopen tab (stays logged in), logout (bounced),
impersonate + exit all work. `grep -n "userJwt" src -r` → no hits (or only
impersonation-related if variant 1 was chosen — state which in the PR).

### 4.2 Stop refreshing auth on every admin navigation

**Files**: `src/admin/router/index.ts`, `src/components/Admin.vue`.

1. Remove `await refreshAuth()` from `router.beforeEach`; guard only checks
   `isAuthenticated`/`isAdmin`.
2. Call `refreshAuth()` once in `Admin.vue` `onMounted` (before mounting can rely
   on roles, show a minimal loading state until it resolves).

**Acceptance**: navigating between admin pages triggers no `auth-refresh` request
(check devtools Network); deep-linking into `/admin/signs` still guards correctly.

### 4.3 Safe PocketBase filters everywhere

**Files**: every file from
`grep -rn 'filter: `' src` (~25 sites; the analysis §3.7 lists the user-input ones).

Rule: any filter containing an interpolated variable becomes
```ts
filter: pb.filter('name ~ {:q} || Category.tag ~ {:q}', { q })
```
Static filters (`'Parent = null'`) stay as-is. The `itemIds.map(...).join(' || ')`
in `useQuizSession.ts:227` becomes
`pb.filter(itemIds.map((_, i) => `id = {:id${i}}`).join(' || '), Object.fromEntries(itemIds.map((id, i) => [`id${i}`, id])))`
— or simpler and preferred: keep ids joined but validate them with
`/^[a-z0-9]+$/i` first (PB record ids are alphanumeric).

**Acceptance**: searching `d"art` in global search and in each admin picker returns
results (or empty) without console errors. `grep -rn 'filter: `' src` shows only
static strings or `pb.filter(` calls.

### 4.4 Consistent error handling in admin writes

**Files**: all `src/admin/components/*Modal.vue` with a `save()`/`confirm()` that
awaits a PB call without try/catch (audit with
`grep -Ln "showPbError" src/admin/components/*Modal.vue` then inspect).

For each: wrap the write in try/catch/finally, call `showPbError(err)` from
`usePbErrorToast`, ensure `saving.value = false` in `finally`, ensure `<PbErrorToast />`
is present in the template. Use `SignAddModal.vue` as the reference pattern.

**Acceptance**: with PB stopped (`pnpm db` killed), every admin save shows a toast
and the button spinner resets. (Phase 5 will shrink this surface; do 4.4 only for
modals not yet unified, or do Phase 5 first if resequencing — say so in the PR.)

### 4.5 Cap unbounded admin search

**Files**: `src/admin/composables/useSigns.ts` (lines 84–94).

Replace the search-branch `getFullList` with `getList(1, 200, …)` and set
`totalSigns.value = result.totalItems` in both branches. If > 200 matches, UI
already encourages refining the search.

**Acceptance**: search still returns results; no behavior change for < 200 matches.

---

## Phase 5 — Modal unification (one task per entity; depends on Phase 2)

Reference pattern for every task in this phase (mirrors the house rule):

```
XxxAddModal.vue + XxxEditModal.vue  →  XxxModal.vue
  type Props = { recordId?: string }        // undefined = create mode
  header: recordId ? 'Modifier …' : 'Ajouter …'
  watch(visible): recordId ? load record into form : reset to empty form
  save(): recordId ? updateXxx(recordId, payload) : addXxx(payload)
  always: try/catch + showPbError + finally saving=false + <PbErrorToast />
  emits: saved
```

Consumers (the list views) currently hold two `visible` refs and render two modals;
they collapse to one modal + one `editedId: string | undefined` ref.

| Task | Entity | Files to merge | Consumer view |
|---|---|---|---|
| 5.1 | Sign | `SignAddModal.vue`, `SignEditModal.vue` | `views/Signs.vue` |
| 5.2 | Person | `PersonAddModal.vue`, `PersonEditModal.vue` | `views/Persons.vue` |
| 5.3 | HandConfiguration | `HandConfigurationAddModal/EditModal` | `views/HandConfigurations.vue` |
| 5.4 | LexicalField | `LexicalFieldAddModal/EditModal` | `views/LexicalFields.vue` |
| 5.5 | FrenchExpression | `FrenchExpressionAddModal/EditModal` | `views/FrenchExpressions.vue` |
| 5.6 | PiDeafExpression | `PiDeafExpressionAddModal/EditModal` | `views/PiDeafExpressions.vue` |
| 5.7 | GeneralCulture | `GeneralCultureAddModal/EditModal` | `views/GeneralCulture.vue` |
| 5.8 | User | `UserAddModal.vue`, `UserEditModal.vue` | `views/Users.vue` |

Rules for the implementer:
- Do 5.1 first and get it reviewed — it sets the template for 5.2–5.8.
- Diff the Add/Edit pair **before** merging; if they diverge in behavior beyond the
  pattern above (e.g. Edit loads expands, User has password-only-on-create), keep
  both behaviors inside the single modal behind `recordId` checks. List every
  divergence you found in the PR description.
- Delete the two old files in the same PR; `grep -rn "AddModal\|EditModal"` for the
  entity must return nothing.

**Acceptance per task**: create + edit + validation-error + cancel all work for the
entity; old files deleted; net LOC negative.

---

## Phase 6 — Go backend hardening (independent)

### 6.1 Bound ffmpeg concurrency

**Files**: `pb/hooks.go`.

1. Package-level `var videoOptimizeSlots = make(chan struct{}, 1)`.
2. In each goroutine: acquire before `optimizeVideoRecord`, release after
   (`videoOptimizeSlots <- struct{}{}` / `defer func() { <-videoOptimizeSlots }()`).
3. Rebuild: `pnpm build:db`.

**Acceptance**: `pnpm build:db` succeeds; uploading 3 signs quickly → logs show
sequential "🎬 Optimizing video" lines.

### 6.2 Unique index on slug columns (D4)

**Files**: `pb/pb_migrations/{timestamp}_add_slug_unique_indexes.js` (new — never
edit existing migrations).

Add unique indexes on `sign.slug` and `person.slug` via a new migration (follow the
pattern of the latest `*_updated_sign.js` migration for updating collection
`indexes`). Before writing it, check for existing duplicates:
`sqlite3 pb/pb_data/data.db "SELECT slug, COUNT(*) c FROM sign GROUP BY slug HAVING c>1;"`
(same for `person`). If duplicates exist, run `scripts/migrate-slugs.js` first
(after backup: `cp -r pb/pb_data pb/pb_data.backup.$(date +%Y%m%d)`).

**Acceptance**: migration applies cleanly on a copy of prod data; creating a
duplicate slug via API returns a 400.

### 6.3 Align `pb/README.md` with reality (ffmpeg settings + deploy mechanism)

**Files**: `pb/README.md`.

1. The "Notes d'exploitation" section documents x264/crf 23/veryfast/aac; the code
   uses x265/crf 24/slow/no-audio (`pb/hooks.go:125-136`). Update the doc to match
   the code.
2. The "Recommandation" section still proposes adding a Go build step to this
   repo's workflow. Reality: `infra/deploy-pb-db.yaml` builds from sources when
   `go.mod` exists, and `pb_install` skips `(untracked)` source-built binaries.
   Rewrite the section to describe this actual mechanism (see task 0.1).

---

## Phase 7 — CI, tooling, docs (last)

### 7.1 CI: align Node version, add lint+test gates

**Files**: `.github/workflows/deploy.yaml`, `package.json`.

1. `node-version: 20` → `22`.
2. In the `build` job, before `Build app`:
   ```yaml
   - name: Lint
     run: pnpm lint
   - name: Test
     run: pnpm test
   ```

**Acceptance**: workflow green on a test push to a branch (use `workflow_dispatch`
or wait for the next release).

### 7.2 Configure oxlint to encode house rules

**Files**: `.oxlintrc.json`.

```json
{
  "rules": {
    "eqeqeq": "error",
    "curly": "error",
    "typescript/no-explicit-any": "warn",
    "no-console": "off"
  }
}
```
Run `pnpm lint`; fix any `error`-level findings it surfaces (expect `==` hits);
`any` stays a warning (cleanup is incremental).

**Acceptance**: `pnpm lint` passes with 0 errors.

### 7.3 Real README + architecture doc

**Files**: `README.md`, `docs/ARCHITECTURE.md` (new).

1. Replace starter README: project purpose, stack summary, dev setup
   (`pnpm install`, `pnpm db`, `pnpm dev`), build (`pnpm build`, `pnpm build:db`),
   test/lint, pointer to `pb/README.md` and `docs/`.
2. `docs/ARCHITECTURE.md`: one page describing the deliberate multi-SPA islands
   pattern (5 Vue apps, full page loads between sections, PB API rules =
   the security boundary, `src/lib/` = shared core). State explicitly:
   "Do not merge the SPAs into one router."

### 7.4 (Only if D2 approved) Static build + PocketBase-only serving

Read [INFRA-STATIC-MODE.md](./INFRA-STATIC-MODE.md) first — infra-side patches and
cutover sequencing live there. This task is the lexlsf side, shipped as **one
release** (sub-tasks a–d in one PR to `main`, coordinated with the `apps.yaml`
switch).

**a) Astro config** — `astro.config.mjs`, `package.json`:
1. Remove `adapter: node(...)`, the prod `server` block, and the prod
   `ssr.noExternal` block (obsolete without SSR). Static output is the default
   without an adapter.
2. Remove `@astrojs/node` from dependencies.
3. Remove `export const prerender = false` from every page.

**b) Route rework for static output** (dynamic params don't exist at runtime in
static mode):
1. The five SPA catch-alls (`admin/[...slug]`, `lexique/[...slug]`,
   `culture/[...slug]`, `culture-generale/[...slug]`, `revisions/[...slug]`) need
   `getStaticPaths` returning the bare root (`[{ params: { slug: undefined } }]`)
   so each emits one `index.html` shell; sub-routes are handled by vue-router +
   the server fallback (see c). Components already read the path client-side —
   no component change.
2. The three `outils/*/[slug].astro` detail pages currently pass
   `Astro.params.slug` as a prop. Convert each to the SPA pattern: rename to
   `[...slug].astro` emitting one shell, and make the detail component read the
   slug from `window.location.pathname` (last segment) instead of a prop. Keep the
   `index.astro` list pages as-is.

**c) SPA fallback in the Go binary** — `pb/main.go`:
Replace `apis.Static(os.DirFS("./pb_public"), false)` with the nearest-parent-
index fallback handler specified in INFRA-STATIC-MODE.md §4.2 (deep links like
`/admin/signs` or `/lexique/sign/bonjour` must serve the nearest SPA shell;
extension-bearing paths keep strict 404). `pnpm build:db` must pass.

**d) Local verification before merging**:
`pnpm build && pnpm db`, then on `http://127.0.0.1:8090` (PocketBase alone, no
`pnpm dev`): homepage, login, `/admin/signs` deep link (reload on it),
`/lexique/sign/<slug>` deep link, one outils detail page, `/api/health`, `/_/`.

**Acceptance**: full manual smoke test of every section served by PocketBase
alone, locally; then the cutover checklist of INFRA-STATIC-MODE.md §5 in prod.

### 7.5 Cleanup: dead code & noise

**Files**: `src/helpers/backend.ts` (delete — unused), any `.DS_Store` in git
(`git rm --cached` + already gitignored), `src/videos/*.mp4` (check: are
`bonjour.mp4`/`manger.mp4` referenced? `grep -rn "videos/" src` — if unused,
delete; they inflate the repo).

**Acceptance**: `pnpm build` green; `grep -rn "fetchEndpoint" src` → nothing.

---

## Suggested execution order (flat list)

0.2 → 0.3 → 1.1 → 1.2 → 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 3.1 → 3.2 → 3.3 →
4.1 → 4.2 → 4.3 → 4.5 → 5.1 (review!) → 5.2 … 5.8 → 4.4 (whatever modals remain) →
1.3 → 6.1 → 6.2 → 6.3 → 7.1 → 7.2 → 7.3 → 7.5 → (7.4 if approved)

Estimated net effect: ≈ −1,500 LOC, one shared core layer, tested quiz/slug/score
logic, injection-proof filters, single auth source of truth, bounded server load.

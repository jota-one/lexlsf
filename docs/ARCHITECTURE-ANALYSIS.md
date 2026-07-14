# Architecture Analysis — lexlsf (ls-flex.com)

> Date: 2026-07-14 · Analyzed branch: `develop`
> Companion document: [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md)

## 1. Context

lexlsf is an LSF (French Sign Language) learning platform: public lexicon (signs by
category), deaf culture (persons/organisms), general culture timeline, tools (lexical
fields, expressions), quiz/revision system, and a full admin back-office.

**Stack**: Astro 6 (Node adapter, SSR) + 5 independent Vue 3 SPAs mounted as
`client:only` islands (admin, lexique, culture, culture-generale, revisions) +
PrimeVue/DaisyUI/Tailwind 4 + a **custom Go PocketBase binary** (video optimization
via ffmpeg, slug hooks, impersonation route). Deployed on jota-one infra via GitHub
Actions.

**Overall verdict**: the project is functional and the domain modeling is sound
(types namespaces, PB migrations discipline, roles/visibility model). The main
weaknesses are *systematic duplication* (the same code pasted 2–16×), *no shared
core layer* (public code imports from `@admin`), *client-only rendering that makes
the SSR adapter pointless*, *inconsistent auth/error handling*, and *near-zero test
coverage*. None of these are hard to fix; most are mechanical.

## 2. Scorecard

| Area | Grade | Summary |
|---|---|---|
| Domain modeling / types | B+ | Good namespaced types, but `any` leaks everywhere in components |
| Code duplication | D | Composables, modals, slug logic, option lists duplicated wholesale |
| Rendering architecture | C− | SSR adapter + 100% `client:only` + `prerender=false` = worst of both worlds |
| Auth & security | C+ | Server-side rules OK; client auth state split across 2 storages; filter injection |
| Error handling | C | Toast system exists but applied to ~half the admin modals; public side silent |
| Backend (Go) | B | Clean hooks, but unbounded ffmpeg concurrency + deploy-pipeline doubt |
| CI/CD | B− | Solid infra-side Go build & bundle system; minor: race-prone run matching, Node version mismatch |
| Tests | D− | 1 test file (`strings.test.ts`), no vitest config, pure logic untested |
| Docs / hygiene | C | README is the untouched Astro starter template; ROADMAP.md is excellent |

## 3. Findings

Severity: 🔴 critical · 🟠 important · 🟡 moderate · 🔵 nice-to-have

### 3.1 ✅ Deployment: custom Go binary — VERIFIED, works as designed

Initially flagged as critical (this repo's CI never builds the Go binary and
`.pbversion` v0.31.0 ≠ go.mod v0.36.4). Verified against the `jota-one/infra` repo
and confirmed by the owner (2026-07-14): **the custom binary IS what runs in prod.**

How it actually works (documented here because it is non-obvious from this repo):

- `infra/.github/workflows/deploy-pb-db.yaml` detects `pb/go.mod`, installs the Go
  version pinned there, builds the binary from sources
  (`GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build …`) and ships it in the "pb"
  bundle. The build happens **infra-side**, which is why this repo's workflow has
  no Go step.
- `infra/bin/pb_install` cannot clobber it: a source-built PocketBase reports
  version `(untracked)`, and the script explicitly skips untracked binaries
  (`if [ "$current_version" == "v(untracked)" ] … exit 0`). `.pbversion` therefore
  only matters for rollback-to-upstream, so its drift from go.mod is harmless.

Residual (🔵, optional): `pb/README.md`'s "Recommandation" section still describes
adding a Go build step to *this* repo's workflow as if it were pending — update it
to describe the mechanism above so future readers (and AI assistants) don't
re-raise this false alarm.

### 3.2 🟠 Rendering: SSR adapter with zero SSR

Every single page sets `export const prerender = false` and mounts its component
with `client:only`. The Node server therefore renders empty HTML shells at request
time, for no benefit (no SEO — content is behind login anyway — no faster first
paint, no data preloading). Meanwhile the custom PocketBase binary *already* serves
`pb_public` statically (`pb/main.go:58`).

Two coherent options:

- **(A) Go fully static** — `output: 'static'`, drop `@astrojs/node`, let PocketBase
  serve the built site. One process in prod instead of two, one deploy artifact,
  fewer failure modes (the `EADDRINUSE`-class incidents disappear). Client-side
  auth-gating is unchanged (it's already client-side).
- (B) Actually use SSR — middleware auth guard, server data fetching. Much more
  work, and the multi-SPA design fights it.

**Recommendation: (A).** The site is an authenticated app, not a content site.
This requires an infra check (does `deploy-pb-app.yaml` expect a Node service?)
before execution — see Plan task 0.2.

### 3.3 🟠 No shared core layer; public code imports from `@admin`

`src/components/**` (public site) imports `@admin/composables/useAuth`,
`@admin/helpers/strings`, etc. (10+ files). "Admin" is a feature, not a foundation.
Anything shared belongs in a `src/lib/` layer: PocketBase client, auth composable,
slug helper, formatting helpers, option lists.

### 3.4 🟠 28 separate `new PocketBase(...)` instances

Every composable and several components create their own client
(`grep -rn "new PocketBase" src` → 28 hits). It *happens* to work because the SDK's
default `LocalAuthStore` shares the token via `localStorage`, but:

- it's implicit coupling that nobody chose;
- per-instance settings diverge (`pb.autoCancellation(false)` only in
  `useQuizSession.ts:41`);
- there is no single place to attach error handling, retries, or logging.

Fix: one exported singleton in `src/lib/pb.ts`.

### 3.5 🟠 Wholesale duplicated composables (with drift bugs)

- `src/components/lexique/composables/useSigns.ts` is a stale copy of
  `src/admin/composables/useSigns.ts`. The copy still exposes
  `addSign/updateSign/deleteSign` (dead code on the public site) and contains a
  **naive slug generator** (`name.toLowerCase().replace(/\s+/g, '-')`, line 44) that
  produces accented slugs — which the Go hook regex `^[a-z0-9-]+$` **rejects**. Any
  code path reaching it fails on accented names.
- Same pattern: `culture/composables/usePersons.ts`,
  `culture-generale/composables/useGeneralCulture.ts` vs their admin twins
  (the public general-culture one re-implements `formatDate`).
- Option lists (`learningSourceOptions`, `primaryLanguageOptions`,
  `verificationStatusOptions`) and level translation (`translateNumericLevel`)
  are pasted in both `useSigns` copies.

Fix: public composables become thin *read-only* modules over a shared core; option
lists and converters move to `src/lib/`.

### 3.6 🟠 8 Add/Edit modal pairs = ~16 near-identical files

`SignAddModal`/`SignEditModal`, `PersonAddModal`/`PersonEditModal`, and 6 more pairs
differ only in: header text, empty-vs-loaded initial form, `add` vs `update` call.
The project's own convention (workspace CLAUDE.md, "Component design") mandates a
single form component with a nullable record prop. Each pair collapses into one
`XxxModal.vue` with an optional `recordId` prop (≈ −1,000 LOC, and bug fixes stop
needing to be made twice — e.g. today `SignEditModal.save()` has **no try/catch and
no error toast** while `SignAddModal.save()` has both).

### 3.7 🟠 Filter injection: user input interpolated into PocketBase filters

~25 call sites build filters with template strings. Only `admin/useSigns.ts:85`
escapes quotes (and only quotes). User-typed search text flows in directly in
`Search.vue:64-73`, `SignPicker.vue:106`, `PersonPicker.vue:92`,
`PersonMultiPicker.vue:94`, `LexicalFieldPicker.vue:92`.

Impact is bounded by PB API rules (reads are role-gated), but a `"` in a search
crashes the query, and filter manipulation could bypass *intra-collection*
constraints. The SDK ships the fix:
`pb.filter('name ~ {:q}', { q })`. Mechanical, low-risk change.

### 3.8 🟡 Auth state split across three places

- PB SDK persists the token in `localStorage` (`pocketbase_auth`, default store).
- `useAuth` mirrors it into `sessionStorage` (`userJwt` via `useSessionStorage`).
- `AuthGuard.astro` checks only `sessionStorage.userJwt`.

Concrete bug: close tab → reopen → `localStorage` token still valid but
`sessionStorage` empty → guard bounces a logged-in user to `/`. Inverse drift is
also possible (stale `userJwt` after token cleared elsewhere).
Single source of truth: `pb.authStore` (with `pb.authStore.onChange` +
`isValid`). Keep `AuthGuard` client-side (acceptable since real protection = PB API
rules) but make it read the same source. Also note `user = ref<any>` — define a
`TUser` type.

### 3.9 🟡 Admin router calls `refreshAuth()` on every navigation

`src/admin/router/index.ts:40-53` — one extra HTTP round-trip per route change.
Refresh once at SPA mount; the guard should only check local state.

### 3.10 🟡 Error handling inconsistent

`usePbErrorToast` exists and is good, but only ~14 of the admin components use it;
several `save()` handlers await PB calls with no catch (spinner sticks on error).
Public composables have no error handling at all (blank sections on failure).
Standardize: every user-triggered PB write goes through try/catch + toast; every
public read has a defined error state.

### 3.11 🟡 Go: unbounded concurrent ffmpeg runs

`pb/hooks.go:20-37` — each sign create/update spawns a goroutine running ffmpeg with
`-preset slow`. A bulk import (the admin has one!) of N videos = N parallel ffmpeg
processes on the server. Add a buffered-channel semaphore (capacity 1–2).
Bonus inconsistencies: `pb/README.md` documents x264/`crf 23`/`veryfast` + audio,
code does x265/`crf 24`/`slow`/`-an`; macOS Homebrew fallback paths live in prod
code (harmless, but worth a comment).

### 3.12 🟡 Slug logic exists in 4 places

1. `src/admin/helpers/strings.ts` (`createSlug` — the good one, tested)
2. `src/components/lexique/composables/useSigns.ts:44` (naive, buggy — see 3.5)
3. `scripts/migrate-slugs.js` (hand-copied duplicate of #1)
4. `pb/hooks.go` (format validation + uniqueness — this one is *correct* layering)

Client-side: one implementation in `src/lib/slug.ts`, imported everywhere including
the script. Server-side validation stays. Also consider a **unique index** on
`slug` columns in PB schema as a hard backstop (hook-level uniqueness has a
read-then-write race).

### 3.13 🟡 Tests: 1 file, no config

`vitest` is installed; only `strings.test.ts` exists; no `vitest.config.ts`; no
`test` script in `package.json`; CI never runs tests. Pure, high-value candidates:
`createSlug`, `computeQuizScore`, quiz deck logic (shuffle/skip-requeue/resume
partitioning in `useQuizSession`), `formatDate`. The deck logic is genuinely subtle
(skip zone insertion, `resumeSession` set arithmetic) and is exactly where
regressions will hurt.

### 3.14 🟡 CI/CD robustness

- `deploy.yaml` matches the triggered infra run by *name* with `sleep 5` +
  `gh run list -L 10` — race-prone (concurrent deploys, slow API). `gh workflow run`
  + `gh run list --workflow ... --json` filtering by `run-external-id` is already
  half-implemented; finish it or poll until found instead of sleeping once.
- CI uses Node 20; `package.json` volta pins 22.19. Align to 22.
- `pnpm build` runs `astro check` (good) but no lint/test gates.

### 3.15 🔵 Misc

- `src/helpers/backend.ts` (`fetchEndpoint`) is **dead code** — delete.
- `README.md` is the untouched Astro starter — replace with a real overview
  (stack, dev setup, `pnpm db`, deploy pointer to `pb/README.md`).
- `.oxlintrc.json` is `{}` — encode the house style (eqeqeq, curly, no-explicit-any
  as warning) so weaker models get automated guardrails.
- `PersonForm.vue` is 820 lines — split into tab/section child components.
- `admin/useSigns.loadSigns` with a query does `getFullList` (unbounded); cap it.
- File-URL building duplicated (`getIllustrationUrl`, `getFileUrl` …) — the SDK has
  `pb.files.getURL(record, filename)`; wrap once in `src/lib/`.
- `.env` is committed. It should contain only `PUBLIC_*` values — verify no secret
  ever lands there (secrets belong in `.env.local`, which is gitignored).
- `docs/`-worthy: the multi-SPA islands pattern (5 routers, full page reloads
  between sections) is a *deliberate and reasonable* architecture — document it so
  future contributors (human or AI) don't "fix" it into one mega-SPA.

## 4. What is already good (keep as-is)

- **Migrations discipline**: append-only JS migrations, views for counts, roles
  data migrations. Matches the house rules.
- **Role/visibility model**: PB rules as the real security boundary, roles expanded
  client-side only for UX gating. Correct layering.
- **Custom Go binary approach**: hooks in Go instead of fragile JSVM for
  ffmpeg/slug/impersonation is the right call; impersonation endpoint does proper
  server-side admin verification.
- **ROADMAP.md**: exemplary changelog/planning hygiene.
- **Type namespaces** (`TSign.TRecord` / `TSign.TForm`): good pattern, just
  under-enforced.
- **Multi-SPA islands**: reasonable for a site with such distinct sections; the
  problem is the duplication *between* them, not the split itself.

## 5. Decisions required before implementation

| # | Decision | Recommendation |
|---|---|---|
| D1 | ~~Verify prod PocketBase binary~~ | ✅ Resolved 2026-07-14 — custom binary confirmed in prod (see 3.1) |
| D2 | Static output vs keep SSR (3.2) | Static (A); needs infra confirmation |
| D3 | Modal unification style (3.6) | One `XxxModal` per entity with nullable `recordId`; **no** generic mega-abstraction |
| D4 | Unique index on `slug` fields (3.12) | Yes, via new migration |

The implementation plan sequences everything else without waiting on D1/D2.

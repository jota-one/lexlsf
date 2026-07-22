# Architecture

## Multi-SPA islands — a deliberate pattern

The site is **not** one big SPA. It is an Astro site hosting **five independent
Vue mini-apps** (islands), one per section:

| Section | Astro entry | Vue app root |
|---|---|---|
| Admin | `src/pages/admin/[...slug].astro` | `src/components/Admin.vue` (vue-router) |
| Lexique | `src/pages/lexique/[...slug].astro` | `src/components/lexique/` |
| Culture | `src/pages/culture/[...slug].astro` | `src/components/culture/` |
| Culture générale | `src/pages/culture-generale/[...slug].astro` | `src/components/culture-generale/` |
| Révisions (quiz) | `src/pages/revisions/[...slug].astro` | `src/components/Revisions.vue` |

Navigating between sections is a **full page load**; navigating inside a
section is client-side. Each app stays small, loads only its own code, and can
be reasoned about independently.

**Do not merge the SPAs into one router.** The split is intentional.

## Security boundary

The security boundary is **PocketBase API rules** (collection `listRule`,
`viewRule`, …), not the frontend. Client-side guards (`AuthGuard.astro`, the
admin router guard) are UX only — they prevent flashes of unauthorized UI, not
access. Every collection must have correct API rules.

Auth state lives in **`pb.authStore`** (persisted by the PocketBase SDK under
the `pocketbase_auth` localStorage key). Pre-hydration scripts read that key
directly; Vue code derives everything from `useAuth()`.

## Shared core: `src/lib/`

Cross-app code lives in `src/lib/` (alias `@lib/*`):

- `pb.ts` — the **single** PocketBase client instance (+ `fileUrl`, `idFilter`).
  Never call `new PocketBase(...)` anywhere else.
- `slug.ts` — `createSlug`, the only slug generator (also imported by
  `scripts/migrate-slugs.js`; format validated server-side in `pb/hooks.go`).
- `signOptions.ts` — shared option lists and level converters.
- `dates.ts` — partial-date formatting (`2020`, `2020-05`, `2020-05-17`).

Rules of thumb:

- Public composables are **read-only**; admin composables own CRUD.
- Any PocketBase filter containing a variable goes through `pb.filter()` (or
  `idFilter` for id lists).
- Admin add/edit modals are unified: one `XxxModal.vue` per entity with an
  optional record-id prop (`undefined` = create mode).

## Backend

`pb/` contains a custom PocketBase binary (Go): video optimization hooks
(ffmpeg, bounded to one concurrent job) and slug validation/uniqueness. See
[pb/README.md](../pb/README.md) for build and deployment details.

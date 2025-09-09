<!-- Copied/created by AI assistant. Keep concise and actionable. -->
# Copilot / AI Agent instructions — lexlsf (Astro + Vue + PocketBase)

This file collects the minimal, actionable knowledge an AI coding agent needs to be productive in this repository.

1) Big picture
- This is an Astro site (root) that embeds a small Vue single-page admin app under `src/admin` (router base: `import.meta.env.BASE_URL + 'admin/'`).
- Data and backend are PocketBase (local binary & `pb/` folder). The public build output is placed under `pb/pb_public` via `astro.config.mjs`.

2) Key areas to read before editing
- Frontend admin: `src/admin/` — router (`src/admin/router/index.ts`), views (e.g. `src/admin/views/HandMovements.vue`), components (`src/admin/components/*`) and composables (`src/admin/composables/*`).
- Site pages: `src/pages/*` (Astro pages) — uses PocketBase directly for public pages.
- Runtime config: `src/config/index.ts` — exposes `apiBaseUrl` from `import.meta.env.PUBLIC_PB_BASE_URI`.
- PocketBase artifacts and migrations: `pb/` (migrations in `pb/pb_migrations`) and `pb/pb_public` for built output.
- Build config: `astro.config.mjs` (integrations, Vite plugins, outDir)

3) Runtime / environment and commands
- Package manager: pnpm (use `pnpm install` if dependencies are missing).
- Typical commands (run from repo root):
  - `pnpm dev` — starts Astro dev server (default port 4321).
  - `pnpm build` — runs `astro check && astro build` and outputs to `pb/pb_public`.
  - `pnpm preview` — preview the built site.
  - `pnpm db` — convenience script that runs PocketBase binary from `./pb/pocketbase serve` on local machine (used by admin/local dev).

4) Environment variables
- The code expects PUBLIC_PB_BASE_URI in the environment (see `src/config/index.ts`).
  - Example: set PUBLIC_PB_BASE_URI to `http://localhost:8090` when running pocketbase locally.
  - Admin composables create PocketBase clients with `new PocketBase(config.apiBaseUrl)`.

5) Patterns & conventions (project-specific)
- Admin uses Vue 3 single-file components with `<script setup lang="ts">` and composables for data access. Follow existing composable shapes (returns refs, loading flags, and load/save functions). Example: `src/admin/composables/useHandMovements.ts`.
- Data access: composables use PocketBase client directly (no global store). Look for `pb.collection('...').getFullList(...)` patterns.
- Routes: admin router base is configured in `src/admin/router/index.ts`. When adding views, register them there.
- File URLs: public file URLs are constructed with `
  `${config.apiBaseUrl}/api/files/<collection>/<id>/<filename>`
  ` (see `src/admin/views/HandConfigurations.vue`).
- UI: PrimeVue components are used across `src/admin` (DataTable, Button, Dialog). Keep markup consistent with existing views.

6) PocketBase / DB work
- Migrations live in `pb/pb_migrations/` — review JS migration files to understand schema changes.
- To run the local PocketBase server for integration testing, use `pnpm db` (it runs the locally included binary if present) or run the binary yourself in `pb/`.

7) Where to make changes for common tasks
- Adding a new admin resource: add composable in `src/admin/composables/`, create `src/admin/views/<Name>.vue`, register route in `src/admin/router/index.ts`, and add modals/components to `src/admin/components/` following existing patterns.
- File serving / links: update `src/config/index.ts` or set `PUBLIC_PB_BASE_URI` instead of hardcoding URLs.

8) Tests and linters
- Lint: `pnpm lint` runs eslint across the project (see `package.json`).
- There are no automated unit tests in this repo by default — prefer small integration checks (run dev and use the admin UI) and validate PocketBase collections.

9) Examples to reference
- Admin composable example: `src/admin/composables/useHandMovements.ts` (creates pb client from `config`, returns refs and loader fn).
- Admin view example: `src/admin/views/HandMovements.vue` (DataTable + Add modal pattern).
- Router example: `src/admin/router/index.ts` (history uses `import.meta.env.BASE_URL + 'admin/'`).

10) Safety and performance
- Avoid bundling server-only binaries into client code. PocketBase is a server component under `pb/` and should be invoked from server/dev scripts only.

11) Editing/PR guidance for agents
- Keep changes scoped: update composable + view + route together for new resources.
- Preserve existing `script setup` + TypeScript style.
- When adding runtime config, use `src/config/index.ts` and public env vars (prefix PUBLIC_ for client exposure).

If any section is unclear or you want explicit examples (e.g., add-new-resource step-by-step), tell me which area to expand.

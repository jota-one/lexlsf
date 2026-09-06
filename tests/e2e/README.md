# End-to-end tests (Playwright)

Browser tests that drive the real admin SPA against a running PocketBase.

## Prerequisites

- PocketBase running locally: `pnpm db` (serves on `http://127.0.0.1:8090`)
- Playwright's Chromium: `pnpm exec playwright install chromium` (once)

The project's Astro dev server is reused if already running (whatever port it
picked) and started otherwise. Astro 7 daemonizes `astro dev`, so `run.sh`
manages it and detects its URL via `astro dev status` — Playwright's own
`webServer` cannot drive a daemonized process.

## Running

```bash
pnpm test:e2e            # run everything
pnpm test:e2e:ui         # Playwright UI mode
pnpm test:e2e --grep import
```

`tests/e2e/run.sh` sources `tests/e2e/.env` (copy it from `.env.example`) and
checks PocketBase is reachable before starting.

## How auth works

The `users` collection has an open create rule and an assignable `roles`
relation, so the admin test account is **provisioned on the fly** through the
public API on first run (`ensureAdminAuth`) — no seeded credentials needed. Its
session is injected into `localStorage` before each page loads, matching the
app's own PocketBase authStore.

## Data & cleanup

Tests run against your local dev database. Each spec creates its own lexical
field (slug prefixed `e2e-`) and deletes it — with its terms, by cascade — in a
`finally` block. The `e2e-admin@test.local` account is intentionally kept and
reused across runs.

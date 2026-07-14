# Proposal — Serving lexlsf without the Astro Node server (`serve: pb-static`)

> Date: 2026-07-14 · Companion to [ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md) §3.2 (D2)
> Audience: infra owner (jota-one/infra) + lexlsf maintainers.
> Sources inspected: `infra/apps.yaml`, `schemas/apps.json`, `templates/Caddyfile.j2`,
> `templates/systemd/*.j2`, `ops/services.py`, `ops/caddy.py`, `bin/pb_deploy`,
> `bin/pb_install`, `bin/pb_watch_check`, `bin/gh_deploy`,
> `.github/workflows/deploy-pb-db.yaml`, `.github/workflows/deploy-pb-app.yaml`.

## TL;DR

The infra **already models this case**: `serve: pb-static` exists in
`schemas/apps.json`, in `Caddyfile.j2` (everything reverse-proxied to the PB port)
and in `ops/services.py` (PB service + watcher provisioned, **no** node service).
It has just never been used by a git-deployed app (only the commented-out
`mtg.jota.one` entry).

What's actually missing is small — two scripts assume "app bundle ⇒ node service
exists", plus unit decommissioning. Three backward-compatible patches infra-side,
one `apps.yaml` edit, and a coordinated release. No new `serve` mode, no new
workflow, no contract change for the five `pb-api-and-node` apps.

## 1. How the current pipeline works (for reference)

```
lexlsf push on main
 ├─► infra/deploy-pb-db.yaml   → ".pb" bundle: Go build from pb/ sources →
 │                                pocketbase, pb_migrations, pb_assets, .pbversion
 │                                (NO pb_public — it is gitignored in the repo)
 └─► infra/deploy-pb-app.yaml  → ".app" bundle: pb_public (built site) + .entrypoint

 gh_deploy writes .gitref → systemd .path unit fires → pb_watch_check:
   gitref "*.app" → systemctl restart node-<domain>   (ExecStart chain: pb_deploy → node_install → node entrypoint)
   gitref "*.pb"  → systemctl restart pb-<domain>     (ExecStart chain: pb_deploy → pb_install → pocketbase serve)

 pb_deploy (run by the service's ExecStart) unpacks the tarball and switches the
 symlinks (pocketbase, pb_migrations, pb_public, …) to the new ref dir.
 pb_install skips source-built binaries (version "(untracked)").
```

Two properties matter for this proposal:

- **The static site travels in the `.app` bundle** (because `pb_public` is
  gitignored, the `.pb` bundle never contains it). So even without a node server,
  the `.app` deployment path must keep existing — only its *restart target* is
  wrong for a node-less app.
- **Unpacking happens inside the service restart** (`pb_deploy` is the first link
  of every `ExecStart` chain). An `.app` bundle therefore *requires* restarting
  *some* service, otherwise the tarball is never extracted.

## 2. Target state for lexlsf

```
Caddy ──(everything)──► pocketbase :8092
                          ├── /api/*, /_/*  → PB API/admin
                          └── /*            → static files from pb_public
                                              (custom SPA fallback, see §4.2)
```

- One systemd service instead of two; the `EADDRINUSE`/stale-node failure class
  disappears.
- The custom Go binary already serves `pb_public` (`pb/main.go:58`); it only needs
  a smarter fallback for SPA deep links (§4.2).

## 3. Infra changes (jota-one/infra) — all backward-compatible

### 3.1 `bin/pb_watch_check` — pick the restart target by unit existence

Today an `.app` gitref unconditionally restarts `node-<domain>`. For a `pb-static`
app that unit doesn't exist — and the bundle would never be unpacked. Patch:

```bash
deploy_type=$(cut -d . -f 2 "$GITREF_FILE")

if [ "$deploy_type" == "app" ] && [ -f "/etc/systemd/system/node$SERVICE_NAME_SUFFIX" ]; then
  log "Restarting node$SERVICE_NAME_SUFFIX"
  systemctl restart "node$SERVICE_NAME_SUFFIX"
else
  log "Restarting pb$SERVICE_NAME_SUFFIX"
  systemctl restart "pb$SERVICE_NAME_SUFFIX"
fi
```

Behavior for existing `pb-api-and-node` apps: **identical** (their node unit file
exists). For node-less apps: the `.app` bundle gets unpacked by the PB service's
`pb_deploy` and PB picks up the new `pb_public` symlink.

### 3.2 `deploy-pb-app.yaml` — don't write an empty `.entrypoint`

`prepare bundle` currently always writes `.entrypoint`, and the yq extraction
defaults to `""` when the instance has no `node` block. `pb_deploy` would then
create a broken `entrypoint → ""` symlink. Guard it:

```yaml
if [ -n "${{ matrix.instance.node_entrypoint }}" ]; then
  echo "${{ matrix.instance.node_entrypoint }}" > "$pb_path/.entrypoint"
fi
```

No effect on apps that have an entrypoint.

### 3.3 `ops/services.py` — decommission node units that are no longer declared

`setup_services` creates units but never removes them; switching an app away from
`pb-api-and-node` would leave a stale (and now crash-looping or orphaned)
`node-<domain>.service`. Add, symmetric to the creation block:

```python
if app["serve"] not in ("pb-api-and-node", "node"):
    server.shell(
        name=f"Decommission {app['node_service_name']} if present",
        commands=[
            f"if [ -f /etc/systemd/system/{app['node_service_name']} ]; then"
            f" systemctl disable --now {app['node_service_name']} || true;"
            f" rm -f /etc/systemd/system/{app['node_service_name']};"
            f" systemctl daemon-reload;"
            f" fi"
        ],
        _sudo=True,
    )
```

Idempotent, no-op for every current app. (Alternative: one manual `systemctl
disable --now` on the host — but the code version keeps `apps.yaml` as the single
source of truth, which is the whole point of the infra-as-code setup.)

### 3.4 `apps.yaml` — the actual switch (do last, see §5)

```yaml
- domain: lexlsf.jota.one
  additional-domains: [ls-flex.com, www.ls-flex.com]
  host-on: jota-apps-2-infomaniak
  git:
    repository: https://github.com/jota-one/lexlsf
    branch: main
  serve: pb-static          # was: pb-api-and-node
  preinstalled-binaries: [ffmpeg]
  pb:
    port: 8092
  # node: block removed (port 8192 freed)
```

Schema already validates this (`pb-static` requires only `pb`). `Caddyfile.j2`
already renders it (`reverse_proxy :8092` for everything — note the `/gitref`
handle keeps working since it's gated on `git`, not on `serve`).

### What deliberately does NOT change

- `deploy-pb-db.yaml` / `.pb` bundle contract — untouched.
- `deploy-pb-app.yaml` flow — lexlsf keeps calling it; it remains the vehicle for
  `pb_public`. (A future consolidation could merge the built site into the `.pb`
  bundle via an optional artifact input on `deploy-pb-db.yaml`, dropping one
  workflow call — out of scope, not needed.)
- The five `pb-api-and-node` apps (utastro, billingdjinn ×3, blablind) — zero
  behavioral change from patches 3.1–3.3.
- Volta/node runtime provisioning on the host — still needed by other apps.

## 4. lexlsf-side changes (prerequisite, same release)

Summarized here; detailed as task 7.4 in [IMPLEMENTATION-PLAN.md](./IMPLEMENTATION-PLAN.md).

### 4.1 Static build

Remove `adapter: node(...)`, the prod `server`/`ssr.noExternal` blocks, all
`export const prerender = false`. Dynamic routes must become catch-alls compatible
with static output (see plan task 7.4: the `outils/*/[slug].astro` pages switch to
the same catch-all + client-side-slug pattern the five SPAs already use).

### 4.2 SPA fallback in the custom binary (required)

`pb/main.go` currently uses `apis.Static(os.DirFS("./pb_public"), false)` — no
fallback. Static Astro output only materializes `/admin/index.html`,
`/lexique/index.html`, etc., so deep links (`/admin/signs`,
`/lexique/sign/bonjour`) would 404. PB's built-in `indexFallback=true` is not
enough either (it falls back to the *root* `index.html`, which is the homepage
shell, not the right SPA shell). Replace with a nearest-parent-index fallback:

```go
publicFS := os.DirFS("./pb_public")

se.Router.GET("/{path...}", func(e *core.RequestEvent) error {
    p := strings.Trim(e.Request.PathValue("path"), "/")
    if p != "" && !fileExists(publicFS, p) && path.Ext(p) == "" {
        // Walk up the path towards the root, serving the nearest index.html:
        // /lexique/sign/bonjour → /lexique/sign/ → /lexique/ (hit) → /
        for candidate := p; ; candidate = path.Dir(candidate) {
            if candidate == "." || candidate == "/" {
                break
            }
            if fileExists(publicFS, path.Join(candidate, "index.html")) {
                e.Request.SetPathValue("path", path.Join(candidate, "index.html"))
                break
            }
        }
    }
    return apis.Static(publicFS, true)(e)
})
```

(`fileExists` = `fs.Stat` + `!IsDir`. Requests with a file extension keep strict
404 semantics so missing assets stay visible.)

## 5. Sequencing & rollback

The cutover has an unavoidable coupling: an SSR build needs the node service, a
static build needs the Caddy/apps.yaml switch. Neither combination of
old-build/new-config works. Plan a short maintenance window (site is
login-gated, low traffic):

1. **Infra PR** — patches 3.1 + 3.2 + 3.3. Deploy (pyinfra run + workflow merge).
   Strictly a no-op for everything currently running. Can ship days ahead.
2. **lexlsf release** — static build + `main.go` fallback in one release to
   `main`. Both bundles (`.pb` with new binary, `.app` with static site) deploy.
   During the gap the site serves a broken shell — expected, window open.
3. **`apps.yaml` switch** (3.4) + pyinfra run: Caddyfile regenerated (all traffic
   → :8092), node unit decommissioned by 3.3. Window closed.
4. Smoke test: homepage, login, `/admin/signs` deep link, `/lexique/sign/<slug>`
   deep link, an `/api/…` call, PB admin `/_/`, video upload (ffmpeg hook), quiz.

**Rollback**: revert the `apps.yaml` entry (`pb-api-and-node` + `node:` block) +
pyinfra run (node unit re-created by `setup_services`), then revert the lexlsf
release commit and push — SSR build redeploys through the unchanged pipeline.
Patches 3.1–3.3 don't need reverting; they are inert for node-full apps.

## 6. Effort estimate

| Piece | Size |
|---|---|
| 3.1 `pb_watch_check` | ~6 lines |
| 3.2 `.entrypoint` guard | ~3 lines |
| 3.3 node decommission | ~12 lines |
| 3.4 `apps.yaml` | 1 entry edited |
| lexlsf static build (plan 7.4) | the real work — ~1 day incl. route rework + tests |
| `main.go` fallback | ~25 lines + manual test |

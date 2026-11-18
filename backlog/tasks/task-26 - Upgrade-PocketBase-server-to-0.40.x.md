---
id: TASK-26
title: Upgrade PocketBase server to 0.40.x
status: Done
assignee: []
created_date: '2026-11-18T06:58:00Z'
updated_date: '2026-11-18T09:06:00Z'
labels:
  - dependencies
  - à-valider
dependencies: []
type: chore
ordinal: 26000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
PocketBase server 0.40.6 est sorti ; ce projet est en 0.39.11.

| Instance | Branche | Déclaré |
| --- | --- | --- |
| lexlsf.jota.one | main | `v0.39.11` |

Déclaré dans : `pb/go.mod`

## Évaluation

**Difficulté 2/5 · Risque 2/5**

Aucun hook JSVM ni code Go personnalisé touchant JSON/OAuth2 : rien ne casse directement. L'upgrade exige surtout de passer Go à 1.27+ (encoding/json/v2) et apporte des correctifs de sécurité et anti-OOM sur les miniatures.

## Changements cassants pour ce projet

- pb/go.mod déclare go 1.25.0, à monter à 1.27.0+ pour la bascule encoding/json/v2 requise par PocketBase 0.40.0
- pb_migrations/*.js stockent des données JSON (category, lexical_field, …) : vérifier après upgrade qu'aucune clé dupliquée ne casse le parsing (corrigé en 0.40.3)

## Sécurité

Go 1.27.2 corrige un DoS net/http pouvant affecter PocketBase, SQLite passe en mode "defensive", et v0.40.6 ajoute une limite anti-OOM sur la génération de miniatures ainsi que des vérifs anti-escape du filesystem fileblob.

## Étapes

- Monter go.mod : go 1.27.0+ et pocketbase v0.40.6, puis go mod tidy
- Relancer tous les pb_migrations en local et vérifier les collections à champs JSON (category, lexical_field, lexical_term, …)
- Tester localement avant prod comme recommandé par les release notes (bascule encoding/json/v2 non garantie 100% rétrocompatible)
- Vérifier hooks.go (optimizeVideoRecord) : aucune API utilisée n'est affectée, juste confirmer le build Go 1.27
- Si CORS ou OAuth2 configurés en prod, revérifier après upgrade (wildcard subdomain checks renforcés en 0.40.5)

## Sources

-

_Évalué par Claude (sonnet) le 2026-11-18._

Release notes : https://github.com/pocketbase/pocketbase/releases
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La version déclarée est sur la ligne cible du titre
- [x] #2 Chaque changement cassant listé est traité ou écarté
- [ ] #3 L'upgrade passe sur une instance de review avant la prod
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bumped to PocketBase v0.40.6 with `go 1.27.4` in pb/go.mod (above the 1.27.3 minimum the release notes recommend for the security fixes). The infra workflow reads the Go version from go.mod, so the production build follows without an infra change.

Breaking changes checked:
- encoding/json/v2: all 78 migrations applied on a fresh DB with 0.39.11 and 0.40.6 give the same SQLite schema; collection definitions differ only by empty lists now stored as [] instead of null, and random secrets. On a copy of the local DB, every record of every collection (JSON fields included) reads back, and the API output is byte-identical between 0.39.11 and 0.40.6.
- No system migration in 0.40; the local DB schema is unchanged and integrity_check is ok.
- Commands now exit non-zero on error: the systemd unit chains pb_deploy && pb_install && pocketbase serve, and pb_install skips the custom build ((untracked) version), so nothing changes there.
- No OAuth2 or CORS configuration to recheck; no encoding/json or ResetBootstrapState in the Go code.

Smoke-tested locally: H.264 upload re-encoded to HEVC 720x540, impersonation answers 401/403/200. disintegration/imaging is still a dependency. No review instance exists (a push to main deploys to production), so AC #3 is covered by the local checks; the full e2e suite passes.
<!-- SECTION:NOTES:END -->

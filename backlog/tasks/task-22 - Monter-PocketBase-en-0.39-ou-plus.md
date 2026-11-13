---
id: TASK-22
title: Monter PocketBase en 0.39 ou plus
status: In Progress
assignee: []
created_date: '2026-11-13T08:25:00Z'
updated_date: '2026-11-13T17:10:00Z'
labels:
  - admin
  - securite
  - à-valider
dependencies: []
references:
  - pb/go.mod
  - pb/hooks.go
priority: high
type: enhancement
ordinal: 22000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Deux alertes de sécurité visent la version de PocketBase en production (0.36.4) : un plantage possible du serveur (corrigé en 0.39.7), et un détournement de compte via la connexion OAuth2 (corrigé en 0.37.4 ; le site n'utilise probablement que l'email, à confirmer).

La montée traverse plusieurs versions mineures, qui peuvent changer le comportement des hooks et des migrations. Elle se teste donc à part, sur une copie de la base.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 PocketBase est en 0.39.7 ou plus, en local comme en production
- [x] #2 Les migrations s'appliquent sans erreur sur une copie de la base de prod
- [x] #3 L'optimisation des vidéos à l'upload et l'impersonation fonctionnent toujours
- [ ] #4 Les alertes Dependabot sur PocketBase sont fermées
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: the production binary is built from pb/go.mod by jota-one/infra (deploy-pb-db.yaml), with the custom hooks in pb/hooks.go and pb/impersonate.go plus the JSVM hooks in pb/pb_hooks. Dependabot PRs #104 (0.39.7) and #98 (0.40.6) are open for this. Read the PocketBase changelog from 0.37 to the target for breaking changes in the Go API, JSVM and migrations. Check the custom binary builds, all migrations apply on a copy of the prod DB, video optimisation and impersonation still work, then the admin and quiz flows. github.com/disintegration/imaging (TIFF crash, no fix available) comes with PocketBase: check whether a newer PocketBase drops it.

Upgraded to v0.39.11 (last 0.39; v0.40 needs Go 1.27 and switches to encoding/json/v2, kept for later). Checked locally on a copy of the dev DB: the v0.38.1 system migration normalize_indexes applies cleanly (same indexes, row counts and integrity), an H.264 upload is re-encoded to HEVC 720x540, impersonation answers 401/403/200 and the token logs in as the target. disintegration/imaging is still a PocketBase dependency in 0.39 and 0.40, so its alert stays open (no fix upstream). Production backup of 2026-11-13 restored locally: migrations apply cleanly on a copy (same indexes and index definitions, same row counts on 10 collections, integrity ok), and the app runs on it with 0.39.11 (lexicon, quiz history chart, impersonation from the admin, hand configuration and quiz create/edit/delete).
<!-- SECTION:NOTES:END -->

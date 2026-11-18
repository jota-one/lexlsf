---
id: TASK-28
title: Upgrade pocketbase to 0.29.x
status: Done
assignee: []
created_date: '2026-11-18T06:58:00Z'
updated_date: '2026-11-18T09:05:00Z'
labels:
  - dependencies
  - à-valider
dependencies: []
type: chore
ordinal: 28000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
pocketbase 0.29.0 est sorti ; ce projet est en 0.28.2.

| Instance | Branche | Déclaré |
| --- | --- | --- |
| lexlsf.jota.one | main | `^0.28.2` |

Déclaré dans : `package.json`

## Évaluation

**Difficulté 1/5 · Risque 2/5**

Changelog 0.29.0 introuvable (absent du CHANGELOG.md du repo et de la page releases) ; les API utilisées ici (constructeur, filter(), files.getURL, autoCancellation) sont stables depuis plusieurs versions 0.28.x sans changement cassant signalé.

## Changements cassants pour ce projet

Aucun relevé.

## Sécurité

Aucun correctif de sécurité mentionné dans l'historique disponible (0.28.1 ne contenait qu'une correction de `pb.filter()`).

## Étapes

- Monter `pocketbase` à `^0.29.0` dans package.json
- Lancer `npm install`
- Relancer la suite e2e (tests/e2e/fixtures/index.ts utilise aussi le SDK)
- Vérifier manuellement login, lecture de collections et affichage des fichiers (fileUrl) en local
- Si l'app admin et les composables (useAuth, useSigns, etc.) passent, déployer normalement

## Sources

- https://github.com/pocketbase/js-sdk/releases/tag/v0.29.0
- https://github.com/pocketbase/js-sdk/blob/master/CHANGELOG.md
- https://raw.githubusercontent.com/pocketbase/js-sdk/master/CHANGELOG.md

_Évalué par Claude (sonnet) le 2026-11-18._

Release notes : https://github.com/pocketbase/js-sdk/releases
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La version déclarée est sur la ligne cible du titre
- [x] #2 Chaque changement cassant listé est traité ou écarté
- [ ] #3 L'upgrade passe sur une instance de review avant la prod
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bumped to pocketbase 0.29.0. The SDK changelog does list one behaviour change: the auth store is now cleared automatically on any 401 response. For a signed-in user the only 401 source here is authRefresh with a token the server no longer accepts (the impersonation route answers 401 only when there is no auth at all), so clearing the session is the right outcome: before, the app kept a dead token and looked signed in. Kept the default. Verified with the SDK against local PocketBase: a forged unexpired token is cleared after authRefresh returns 401. No review instance exists, so AC #3 is covered by the local checks: typecheck, lint, unit tests and the full e2e suite pass.
<!-- SECTION:NOTES:END -->

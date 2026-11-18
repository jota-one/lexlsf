---
id: TASK-27
title: Upgrade oxfmt to 0.79.x
status: Done
assignee: []
created_date: '2026-11-18T06:58:00Z'
updated_date: '2026-11-18T09:05:00Z'
labels:
  - dependencies
  - à-valider
dependencies: []
type: chore
ordinal: 27000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
oxfmt 0.79.0 est sorti ; ce projet est en 0.78.0.

| Instance | Branche | Déclaré |
| --- | --- | --- |
| lexlsf.jota.one | main | `^0.78.0` |

Déclaré dans : `package.json`

## Évaluation

**Difficulté 1/5 · Risque 2/5**

Aucune breaking change : patch de bugs (semicolons sur handlers Vue, v-for, types TS, CSS) + Prettier 3.10.1 en interne. Mise à jour sans risque, bénéfique pour le formatage Vue.

## Changements cassants pour ce projet

Aucun relevé.

## Sécurité

Aucun correctif de sécurité relevé.

## Étapes

- Bumper oxfmt à ^0.79.0 dans package.json
- pnpm install
- Lancer pnpm format (ou le script format) sur tout le repo pour voir si des fichiers Vue/TS changent (notamment handlers d'événements et v-for)
- Relire le diff de formatage généré avant de committer
- Vérifier que .oxfmtrc.jsonc est toujours valide (pas de changement de schéma)

## Sources

- https://github.com/oxc-project/oxc/releases/tag/oxfmt_v0.79.0

_Évalué par Claude (sonnet) le 2026-11-18._

Release notes : https://github.com/oxc-project/oxc/releases
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La version déclarée est sur la ligne cible du titre
- [x] #2 Chaque changement cassant listé est traité ou écarté
- [ ] #3 L'upgrade passe sur une instance de review avant la prod
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Bumped to oxfmt 0.79.0. `oxfmt --check` flags exactly the same 49 files under 0.78.0 and 0.79.0, so the upgrade changes no formatting; those files were already unformatted before and are left as they are. .oxfmtrc.jsonc still loads. No review instance exists (a push to main deploys to production), so AC #3 is covered by the local checks: typecheck, lint, unit tests and the full e2e suite pass.
<!-- SECTION:NOTES:END -->

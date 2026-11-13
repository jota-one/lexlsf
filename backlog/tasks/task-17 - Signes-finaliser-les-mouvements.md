---
id: TASK-17
title: 'Signes : finaliser les mouvements'
status: To Do
assignee: []
created_date: '2026-11-13T07:49:00Z'
labels:
  - signes
dependencies: []
references:
  - src/admin/components/HandMovementForm.vue
  - src/admin/composables/useHandMovements.ts
type: feature
ordinal: 17000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Les mouvements de la main droite et de la main gauche se saisissent déjà dans l'admin, mais ne sont ni enregistrés ni affichés. La page publique d'un signe montre encore « Mouvement main ... (bientôt disponible) ».
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Les mouvements saisis sont enregistrés avec le signe
- [ ] #2 La page publique du signe affiche les mouvements à la place des « bientôt disponible »
- [ ] #3 Sans configuration de main gauche, aucun mouvement de main gauche n'est enregistré ni affiché
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: the admin UI is in place (HandMovementForm inside SignForm) and the forms initialise movements for both hands. Missing: persistence in PocketBase (field and migration if needed, serialise movements in useSigns.setFormData), then the public rendering in place of the placeholders. Left hand: no left configuration means nothing stored or shown. Also decide the fate of the hand_movements collection and its composable: dynamic options, or delete.
<!-- SECTION:NOTES:END -->

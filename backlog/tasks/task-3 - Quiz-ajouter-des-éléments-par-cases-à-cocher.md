---
id: TASK-3
title: 'Quiz : ajouter des éléments par cases à cocher'
status: Done
assignee: []
created_date: '2026-11-13T07:49:00Z'
updated_date: '2026-11-13T17:37:00Z'
labels:
  - quiz
  - admin
  - geetha
dependencies: []
references:
  - src/admin/views/QuizEdit.vue
  - src/admin/components/QuizItemSearch.vue
priority: medium
type: enhancement
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Demande de Geetha (13.11.2026), déjà notée dans l'ancienne roadmap.

Dans l'onglet « Éléments du quiz », la recherche passe en haut de la page, au-dessus des éléments déjà ajoutés. Les résultats se cochent, et un bouton ajoute la sélection d'un coup, à la place du « + » par ligne et du « ajouter tous ».
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La recherche est en haut de l'onglet, les éléments du quiz en dessous
- [x] #2 Les résultats se cochent un par un, avec un moyen de tout cocher
- [x] #3 Un bouton ajoute tous les éléments cochés au quiz
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
QuizItemSearch now emits a single 'add' event with the ticked items; the per-row '+' and 'Ajouter tous' are gone. Ticks are dropped for results that leave the list (new search, item added).
<!-- SECTION:NOTES:END -->

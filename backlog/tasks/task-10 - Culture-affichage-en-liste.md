---
id: TASK-10
title: 'Culture : affichage en liste'
status: Done
assignee: []
created_date: '2026-11-13T07:49:00Z'
updated_date: '2026-11-13T17:35:00Z'
labels:
  - culture
dependencies: []
type: enhancement
ordinal: 10000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
En plus de la galerie actuelle, un mode « liste » affiche les personnes de façon beaucoup plus compacte, sans photo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 On peut passer de la galerie à la liste et inversement
- [x] #2 La liste montre les personnes sans photo, sur peu de hauteur
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Toggle above the persons of a category; the choice is kept per browser (localStorage culture-persons-view). Also fixed the empty message, which said 'Aucun signe trouvé'.
<!-- SECTION:NOTES:END -->

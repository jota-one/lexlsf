---
id: TASK-4
title: 'Quiz : filtrer les éléments par catégorie et par rôle'
status: To Do
assignee: []
created_date: '2026-11-13T07:49:00Z'
labels:
  - quiz
  - admin
  - geetha
dependencies:
  - TASK-3
references:
  - src/admin/components/QuizItemSearch.vue
  - src/admin/composables/useQuizItemSearch.ts
priority: medium
type: enhancement
ordinal: 4000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Demande de Geetha (13.11.2026) : dans la recherche des éléments à ajouter à un quiz, on filtre par catégorie et par rôle du signe (étudiant notamment). Le filtre « Niveau de difficulté » disparaît.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 On peut filtrer les éléments à ajouter par une ou plusieurs catégories
- [ ] #2 On peut filtrer les signes par rôle, par exemple ceux du rôle étudiant
- [ ] #3 Le filtre « Niveau de difficulté » a disparu
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: signs carry a Roles relation (admin, student, visitor).
<!-- SECTION:NOTES:END -->

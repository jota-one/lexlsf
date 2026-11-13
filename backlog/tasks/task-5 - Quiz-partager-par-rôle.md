---
id: TASK-5
title: 'Quiz : partager par rôle'
status: To Do
assignee: []
created_date: '2026-11-13T07:49:00Z'
labels:
  - quiz
  - admin
  - geetha
dependencies: []
references:
  - src/admin/components/QuizShareModal.vue
  - pb/pb_migrations/1772890980_updated_quiz_sharing.js
priority: medium
type: feature
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Demande de Geetha (13.11.2026) : partager un quiz avec un rôle (tous les étudiants, tous les admins) plutôt que personne par personne. Un étudiant inscrit après le partage voit le quiz sans qu'on y retouche.

À voir : garder le partage individuel en plus, ou le remplacer, et ce que deviennent les partages existants.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 La fenêtre de partage propose les rôles étudiant et admin
- [ ] #2 Un utilisateur du rôle choisi voit le quiz et peut le lancer, y compris s'il a été créé après le partage
- [ ] #3 Un utilisateur hors du rôle ne le voit pas
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: sharing goes through quiz.shared_with_users; the access rules of quiz, quiz_item and the quiz_counts view only look at that field.
<!-- SECTION:NOTES:END -->

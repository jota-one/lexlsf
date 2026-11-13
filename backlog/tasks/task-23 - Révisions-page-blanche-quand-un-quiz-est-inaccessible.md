---
id: TASK-23
title: 'Révisions : page blanche quand un quiz est inaccessible'
status: To Do
assignee: []
created_date: '2026-11-13T17:10:00Z'
labels:
  - revisions
  - quiz
  - à-valider
dependencies: []
priority: medium
type: bug
ordinal: 23000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Quand on ouvre un quiz qu'on ne peut pas voir (quiz d'une autre personne, non partagé, ou supprimé), la page des révisions redirige vers une adresse qui n'existe pas et reste blanche. On devrait revenir à la liste des quiz, avec un message qui explique pourquoi.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Ouvrir un quiz inaccessible ramène à la liste des révisions
- [ ] #2 Un message explique que le quiz n'est pas disponible
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: QuizPlayer.vue onMounted catch calls router.replace('/revisions'), but the revisions router already has base 'revisions/', so the user lands on /revisions/revisions, which matches no route. Use router.replace('/') instead. Found on 2026-11-13 while opening a quiz of another user.
<!-- SECTION:NOTES:END -->

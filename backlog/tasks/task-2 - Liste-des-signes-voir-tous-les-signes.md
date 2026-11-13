---
id: TASK-2
title: 'Liste des signes : voir tous les signes'
status: To Do
assignee: []
created_date: '2026-11-13T07:49:00Z'
labels:
  - signes
  - admin
  - geetha
dependencies: []
references:
  - src/admin/composables/useSigns.ts
  - src/admin/views/Signs.vue
priority: high
type: bug
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Demande de Geetha (13.11.2026) : la liste des signes de l'admin n'en montre que 100, alors qu'il y en a plus de 800. Les autres sont inatteignables.

La liste se pagine, et un filtre « avec vidéo / sans vidéo » permet de retrouver les signes à compléter. Dans chaque ligne, le crayon passe à gauche du terme ; la poubelle reste tout à droite.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tous les signes sont accessibles depuis la liste, page par page
- [ ] #2 La recherche porte sur tous les signes, pas seulement sur une page
- [ ] #3 Un filtre affiche les signes avec vidéo, sans vidéo, ou tous
- [ ] #4 Le crayon d'édition est à gauche du terme, la poubelle reste dans la dernière colonne
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: useSigns.loadSigns fetches a single page, getList(1, 100), or 200 with a search query.
<!-- SECTION:NOTES:END -->

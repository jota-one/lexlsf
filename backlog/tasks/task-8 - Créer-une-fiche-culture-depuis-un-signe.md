---
id: TASK-8
title: Créer une fiche culture depuis un signe
status: To Do
assignee: []
created_date: '2026-11-13T07:49:00Z'
labels:
  - culture
  - signes
  - admin
  - geetha
dependencies: []
references:
  - src/admin/components/SignForm.vue
  - src/admin/components/PersonForm.vue
priority: medium
type: feature
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Demande de Geetha (13.11.2026) : quand elle crée le signe d'une personne ou d'un organisme, elle veut que cette personne existe aussi dans la Culture, sans tout ressaisir.

Dans le formulaire d'un signe, une case « Personne / organisme » crée la fiche culture correspondante, liée au signe. La fiche se retrouve ensuite dans la liste des personnes et organismes existants, où on la complète.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Le formulaire d'un signe a une case « Personne / organisme »
- [ ] #2 Cochée, elle crée une fiche culture au nom du signe, liée à ce signe
- [ ] #3 La fiche apparaît dans la liste des personnes et organismes de l'admin
- [ ] #4 Cocher la case sur un signe qui a déjà sa fiche n'en crée pas une deuxième
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: person.Sign already links a culture card to its sign.
<!-- SECTION:NOTES:END -->

---
id: TASK-29
title: Les tests e2e ne peuvent plus créer leur compte admin
status: To Do
assignee: []
created_date: '2026-11-18T08:57:00Z'
labels:
  - tests
  - à-valider
dependencies: []
references:
  - tests/e2e/fixtures/index.ts
type: bug
ordinal: 29000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Depuis que la création de comptes est réservée aux admins (fix(security): restrict user creation to admins), le fixture e2e ne peut plus créer son compte admin de test via l'API publique : sur une base qui ne l'a pas encore, toute la suite échoue avant de tester quoi que ce soit (400 Failed to create record). Le commentaire du fixture décrit encore l'ancienne règle ouverte.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 La suite e2e passe sur une base locale qui n'a pas encore le compte de test
- [ ] #2 Le compte de test est créé sans rouvrir la création publique de comptes
<!-- AC:END -->

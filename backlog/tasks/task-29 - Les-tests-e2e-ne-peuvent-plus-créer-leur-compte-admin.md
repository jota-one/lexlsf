---
id: TASK-29
title: Les tests e2e ne peuvent plus créer leur compte admin
status: Done
assignee: []
created_date: '2026-11-18T08:57:00Z'
updated_date: '2026-11-18T09:10:00Z'
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
- [x] #1 La suite e2e passe sur une base locale qui n'a pas encore le compte de test
- [x] #2 Le compte de test est créé sans rouvrir la création publique de comptes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
When the test account is missing, ensureAdminAuth now creates a throwaway superuser with the local PocketBase CLI (pb/pocketbase superuser upsert, random password), creates the account through the API with its token, then deletes the superuser. The users create rule stays admin-only and no superuser is left behind. PB_DIR points to another binary folder if needed. Checked by deleting the test account and running the full suite: 13 passed, account recreated, no superuser left.
<!-- SECTION:NOTES:END -->

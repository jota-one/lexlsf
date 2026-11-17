---
id: TASK-25
title: Fermer l'accès anonyme aux signes et fiches sans rôle
status: Done
assignee: []
created_date: '2026-11-15T10:07:00Z'
updated_date: '2026-11-17T09:53:00Z'
labels:
  - securite
  - admin
  - à-valider
dependencies: []
priority: high
type: bug
ordinal: 25000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Un visiteur non connecté peut lire, par l'API, les signes, personnes, expressions et champs lexicaux qui n'ont aucun rôle : 311 signes et 16 personnes en production (relevé du 15.11.2026). Le site n'en montre rien à un visiteur, mais les données sortent quand même.

À décider : ces éléments sans rôle doivent-ils rester lisibles par tout le monde (un lexique public), ou seulement par les admins ?
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Un visiteur non connecté ne lit plus les signes, personnes, expressions et champs lexicaux sans rôle
- [x] #2 Les admins et les utilisateurs des rôles concernés les voient comme avant
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: rules like "@request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id" on sign, person, french_expression, lexical_field, pi_deaf_expression. For a visitor @request.auth.roles.id is empty and an empty Roles relation compares equal to it, so records without roles match. Same pitfall fixed for quizzes in migration require_auth_on_quizzes. general_culture explicitly allows '@request.auth.id = ''' (anonymous), maybe on purpose. category, hand_configurations, lexical_term, roles and video have an empty rule (public).

Decision (2026-11-17): content is for signed-in users only. Migration require_auth_on_content: sign, person, french_expression, lexical_field, pi_deaf_expression and general_culture require a signed-in user, and role matching a user holding a role; lexical_term and video require a signed-in user. Categories, roles and hand configurations stay public (reference lists). Measured on a copy of the local DB: an anonymous visitor went from 311 signs, 16 persons, 2 French expressions, 1 lexical field, 626 lexical terms and 6 videos to nothing; students (586 signs) and admins (897 signs, 16 persons…) see exactly what they saw before.
<!-- SECTION:NOTES:END -->

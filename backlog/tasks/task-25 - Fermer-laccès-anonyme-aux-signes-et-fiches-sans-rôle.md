---
id: TASK-25
title: Fermer l'accès anonyme aux signes et fiches sans rôle
status: To Do
assignee: []
created_date: '2026-11-15T10:07:00Z'
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
- [ ] #1 Un visiteur non connecté ne lit plus les signes, personnes, expressions et champs lexicaux sans rôle
- [ ] #2 Les admins et les utilisateurs des rôles concernés les voient comme avant
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: rules like "@request.auth.roles.slug ?= 'admin' || @request.auth.roles.id ?= Roles.id" on sign, person, french_expression, lexical_field, pi_deaf_expression. For a visitor @request.auth.roles.id is empty and an empty Roles relation compares equal to it, so records without roles match. Same pitfall fixed for quizzes in migration require_auth_on_quizzes. general_culture explicitly allows '@request.auth.id = ''' (anonymous), maybe on purpose. category, hand_configurations, lexical_term, roles and video have an empty rule (public).
<!-- SECTION:NOTES:END -->

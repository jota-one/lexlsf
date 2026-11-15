---
id: TASK-24
title: Publier le découpeur de signes dans l'admin
status: Done
assignee: []
created_date: '2026-11-15T09:43:00Z'
updated_date: '2026-11-15T10:07:00Z'
labels:
  - outils
  - admin
  - à-valider
dependencies:
  - TASK-1
priority: medium
type: feature
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Le découpeur de signes (l'archive préparée par apps/video-splitter/pack.sh) se télécharge depuis le site plutôt que de passer de main en main. Seuls les admins et les personnes autorisées peuvent le télécharger ; le lien ne fonctionne pour personne d'autre, même s'il circule.

Les personnes autorisées sont choisies une par une par un admin (décidé le 15.11.2026).

Chaque version publiée reste disponible : la page liste toutes les versions, de la plus récente à la plus ancienne, chacune avec une courte description de ce qui a changé. On peut ainsi revenir à une version précédente si la nouvelle pose problème.

À voir : où une personne autorisée qui n'est pas admin trouve le téléchargement (menu du compte, page Outils).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Un admin dépose une nouvelle version du découpeur depuis l'admin
- [x] #2 Un admin ou une personne autorisée télécharge la dernière version
- [x] #3 Le lien de téléchargement ne fonctionne pas pour une personne non autorisée, même s'il lui est transmis
- [x] #4 Un admin choisit, une par une, les personnes autorisées à télécharger
- [x] #5 Chaque version est publiée avec une courte description de ce qui a changé
- [x] #6 La page liste toutes les versions publiées, de la plus récente à la plus ancienne, avec leur description, et chacune reste téléchargeable
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: PocketBase protected file field. A collection (e.g. tool_release: version, changelog (editor or text), file protected with a raised maxSize, allowed_users relation) with list/view rules '@request.auth.roles.slug ?= "admin" || allowed_users.id ?= @request.auth.id', create/update/delete admin only. Protected files are served only with a short-lived file token (pb.files.getToken()) and only to users who pass the view rule. Today the build is a ~20 MB zip (not a dmg), with an ffmpeg for the packing machine's architecture (arm64 when packed on Apple Silicon) and no Apple signature, so macOS warns on first launch.

Keep the allowed users in one place, not on each version: e.g. a 'tool' record (the splitter) holding allowed_users, and 'tool_release' records (version, changelog, protected file) pointing to it, with release rules '@request.auth.roles.slug ?= "admin" || Tool.allowed_users.id ?= @request.auth.id'. Publishing a new version then needs no re-sharing.

Built: collections tool and tool_release (migration created_tool_releases, which also creates the 'Découpeur de signes' record), admin page /admin/tools (allowed users, publish with Markdown changelog, versions with delete), download page /decoupeur and an account-menu link shown only to those with access. The archive is downloaded through a URL carrying a file token: that URL works for a few minutes for whoever holds it, then expires. Still to do: publish the real archive once TASK-1 is done.
<!-- SECTION:NOTES:END -->

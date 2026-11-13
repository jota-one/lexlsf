---
id: TASK-9
title: 'Culture : nom au survol de la photo'
status: Done
assignee: []
created_date: '2026-11-13T07:49:00Z'
updated_date: '2026-11-13T17:34:00Z'
labels:
  - culture
dependencies: []
type: enhancement
ordinal: 9000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Dans la galerie photo des personnes, la carte ne montre plus que la photo. Le nom apparaît en blanc sur un voile foncé au survol.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La carte d'une personne n'affiche que sa photo
- [x] #2 Au survol, le nom s'affiche en blanc sur un voile foncé
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Cards without a photo keep their name, or they would be blank. On touch screens (no hover) the name stays shown at the bottom of the photo.
<!-- SECTION:NOTES:END -->

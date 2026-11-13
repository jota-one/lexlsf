---
id: TASK-1
title: 'Découpeur de signes : des clips prêts pour l''upload'
status: To Do
assignee: []
created_date: '2026-11-13T07:49:00Z'
updated_date: '2026-11-13T08:02:00Z'
labels:
  - outils
  - video
  - geetha
dependencies: []
references:
  - apps/video-splitter/lib/analysis.js
  - scripts/split-sign-video.js
  - pb/hooks.go
priority: high
type: enhancement
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Demande de Geetha (13.11.2026) : des clips sortis du découpeur de signes sont refusés à l'upload parce qu'ils sont trop lourds.

Un signe dure 3 à 4 secondes : un clip bien compressé tient largement sous la limite de 10 Mo, qui ne bouge pas. C'est le découpeur qui doit produire des fichiers légers, avant l'upload.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 La branche feat/video-splitter est mergée : le code source du découpeur est dans le repo
- [ ] #2 Les clips sortent dans le format que le serveur produit déjà, qui ne les recompresse plus
- [ ] #3 Un clip de 4 secondes pèse nettement moins de 10 Mo, sans perte de lisibilité des mains
- [ ] #4 Un nouveau zip est livré à Geetha
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: the cutter source (apps/video-splitter and scripts/split-sign-video.js) was merged from feat/video-splitter on 2026-11-13.

The app re-encodes each clip as H.264 -crf 18 -preset veryfast at source resolution (lib/analysis.js, cutClip), already without audio: nearly lossless, hence heavy. The CLI script already has --optimize (optimizeClip): crop=ih*4/3:ih, scale=720:-2, fps=24, libx265 -crf 24, the same as the PocketBase sign hook (pb/hooks.go), which skips files already in HEVC. The app needs that same output. Check that the bundled ffmpeg-static build has libx265; otherwise fall back or document it. Rebuild the zip with pack.sh.
<!-- SECTION:NOTES:END -->

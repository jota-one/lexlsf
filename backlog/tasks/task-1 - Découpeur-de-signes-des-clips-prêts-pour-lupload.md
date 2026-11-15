---
id: TASK-1
title: 'Découpeur de signes : des clips prêts pour l''upload'
status: Done
assignee: []
created_date: '2026-11-13T07:49:00Z'
updated_date: '2026-11-15T14:15:00Z'
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
- [x] #2 Les clips sortent dans le format que le serveur produit déjà, qui ne les recompresse plus
- [x] #3 Un clip de 4 secondes pèse nettement moins de 10 Mo, sans perte de lisibilité des mains
- [x] #4 Un nouveau zip est livré à Geetha
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Context: the cutter source (apps/video-splitter and scripts/split-sign-video.js) was merged from feat/video-splitter on 2026-11-13.

The app re-encodes each clip as H.264 -crf 18 -preset veryfast at source resolution (lib/analysis.js, cutClip), already without audio: nearly lossless, hence heavy. The CLI script already has --optimize (optimizeClip): crop=ih*4/3:ih, scale=720:-2, fps=24, libx265 -crf 24, the same as the PocketBase sign hook (pb/hooks.go), which skips files already in HEVC. The app needs that same output. Check that the bundled ffmpeg-static build has libx265; otherwise fall back or document it. Rebuild the zip with pack.sh.

Done in app 1.1.0: cutClip encodes each clip straight into the site format (lib/siteFormat.js, shared with scripts/split-sign-video.js): crop 4:3, 720 px, 24 fps, libx265 crf 24 slow, hvc1, no audio. The bundled ffmpeg 6.0 has libx265. On a real 31 s recording: 6 clips of 70-120 KB each, cut in 7 s; on a 1080p test recording a 4 s clip went from 1.4 MB (old H.264 crf 18) to 0.2 MB. Hands stay sharp. Clips play in Chromium and Safari. AC4 (new zip delivered) is checked once version 1.1 is published in Admin → Découpeur.

Version 1.1 published in Admin → Découpeur on 2026-11-15.
<!-- SECTION:NOTES:END -->

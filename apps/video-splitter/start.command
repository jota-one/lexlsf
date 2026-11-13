#!/bin/bash
# Double-clickable launcher. Finder runs this from the user's home directory,
# so the first job is to move into the folder this file actually lives in.
cd "$(dirname "$0")" || exit 1

# A folder that arrived by download or AirDrop is quarantined, and macOS refuses
# to run the bundled ffmpeg until that flag is cleared.
xattr -dr com.apple.quarantine . 2>/dev/null

if ! command -v node >/dev/null 2>&1; then
  echo ""
  echo "  Node.js est nécessaire et n'est pas installé sur ce Mac."
  echo ""
  echo "  1. La page de téléchargement va s'ouvrir."
  echo "  2. Prenez la version « LTS »."
  echo "  3. Installez-la, puis double-cliquez à nouveau sur ce fichier."
  echo ""
  open "https://nodejs.org/fr/download"
  echo "  Appuyez sur Entrée pour fermer."
  read -r _
  exit 1
fi

exec node server.js

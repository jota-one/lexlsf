#!/bin/bash
# Builds the archive to hand to the client: the app plus its bundled ffmpeg,
# so that nothing has to be installed or downloaded on the other side.
#
# The ffmpeg binary is fetched for the machine running this script. Packing on
# an Apple Silicon Mac produces an archive that only runs on Apple Silicon.
set -euo pipefail
cd "$(dirname "$0")"

NAME="decoupeur-de-signes"
STAGE="dist/$NAME"

echo "→ Installation des dépendances"
npm install --omit=dev --silent

echo "→ Copie des fichiers"
rm -rf dist
mkdir -p "$STAGE"
cp -R server.js lib public package.json start.command README.md node_modules "$STAGE/"

echo "→ Création de l'archive"
cd dist
zip -qry "$NAME.zip" "$NAME"
rm -rf "$NAME"

SIZE=$(du -h "$NAME.zip" | cut -f1)
ARCH=$(uname -m)
echo ""
echo "  dist/$NAME.zip  ($SIZE, ffmpeg pour $ARCH)"
echo ""
echo "  La cliente décompresse, puis double-clique sur start.command."
echo ""

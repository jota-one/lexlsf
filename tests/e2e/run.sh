#!/usr/bin/env bash
# Usage: ./tests/e2e/run.sh [playwright options]
# Examples:
#   ./tests/e2e/run.sh                          # run all e2e tests
#   ./tests/e2e/run.sh --grep "import"          # run matching tests
#   ./tests/e2e/run.sh --ui                     # open Playwright UI mode
#
# PocketBase must be running first (pnpm db). The project's Astro dev server is
# reused if already running (whatever port it picked) and started otherwise.
# Astro 7 daemonizes `astro dev`, so it is managed here, not by Playwright.

set -euo pipefail

ENV_FILE="$(dirname "$0")/.env"
if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

PB_URL="${PB_URL:-http://127.0.0.1:8090}"
if ! curl -sf -o /dev/null "${PB_URL}/api/health"; then
  echo "✖ PocketBase is not reachable at ${PB_URL}. Start it with: pnpm db" >&2
  exit 1
fi

detect_url() {
  npx astro dev status 2>/dev/null |
    sed -nE 's|.*Dev server running at (http://[^ ]+).*|\1|p' | head -1
}

URL="$(detect_url || true)"
if [[ -z "$URL" ]]; then
  echo "▶ Starting Astro dev server…"
  pnpm dev >/dev/null 2>&1 || true
  for _ in $(seq 1 60); do
    URL="$(detect_url || true)"
    if [[ -n "$URL" ]] && curl -sf -o /dev/null "$URL"; then
      break
    fi
    sleep 1
  done
fi

if [[ -z "$URL" ]] || ! curl -sf -o /dev/null "$URL"; then
  echo "✖ Astro dev server is not available." >&2
  exit 1
fi

export BASE_URL="$URL"
echo "▶ Testing against ${BASE_URL}"
pnpm exec playwright test "$@"

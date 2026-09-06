#!/usr/bin/env bash
# Usage: ./tests/e2e/run.sh [playwright options]
# Examples:
#   ./tests/e2e/run.sh                          # run all e2e tests
#   ./tests/e2e/run.sh --grep "import"          # run matching tests
#   ./tests/e2e/run.sh --ui                     # open Playwright UI mode
#
# PocketBase must be running first (pnpm db). Astro is started by Playwright's
# webServer config on port 4330.

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

pnpm exec playwright test "$@"

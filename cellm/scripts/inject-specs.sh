#!/usr/bin/env bash
# CELLM Oracle - Inject Active Specs (UserPromptSubmit hook)
# Fetches active spec summary and injects into context.
# Output: plain text stdout -> injected as additionalContext in Claude context
#
# Simplified vs inject-knowledge.sh: no prompt parsing needed, only cwd for project detection.

set -euo pipefail

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Specs] Script failed with exit code $exit_code" >> "${HOME}/.cellm/oracle-hook.log" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup EXIT

# Configuration
CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034 # used by sourced _get-port.sh
DEFAULT_PORT=31415

# Logging (to file only)
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Specs] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Shared helpers
source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_detect-project.sh"
source "${SCRIPT_DIR}/_health-gate.sh"

# Main
main() {
  # Non-critical: exit 0 silently if worker offline
  health_gate "non-critical"

  local port
  port=$(get_port)

  # Read JSON from stdin (Claude Code hook format) — only need cwd
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(head -c 65536)
  fi

  local cwd=""
  if [[ -n "${input}" ]]; then
    if command -v jq &> /dev/null; then
      cwd=$(echo "${input}" | jq -r '.cwd // ""')
    else
      cwd=$(echo "${input}" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' 2>/dev/null | sed 's/"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' || echo "")
    fi
  fi

  local project
  project=$(detect_project "${cwd:-${PWD}}")

  local response
  response=$(curl -sf --max-time 2 --connect-timeout 0.5 \
    "http://127.0.0.1:${port}/api/spec/active-summary?project=${project}" 2>/dev/null) || true

  if [[ -n "${response}" ]]; then
    echo "${response}"
    log "Injected spec summary for project: ${project}"
  fi

  exit 0
}

main "$@"

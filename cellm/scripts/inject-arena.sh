#!/usr/bin/env bash
# CELLM Oracle - Inject Arena Checks (UserPromptSubmit hook)
# Fetches pending arena verifications based on files touched in the session.
# Output: plain text stdout -> injected as additionalContext in Claude context
#
# Hybrid pattern (B4): structure from inject-knowledge.sh + session_id from capture-prompt.sh
# Claude Code hooks receive data via stdin as JSON, not environment variables.

set -euo pipefail

# Error handling
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[!] Script failed with exit code $exit_code" >&2
  fi
}

trap cleanup EXIT

# Configuration
CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034 # used by sourced _get-port.sh
DEFAULT_PORT=31415

# Logging (to file only)
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Arena] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Shared port extraction (jq with grep fallback + range validation)
source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

# Shared helpers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_detect-project.sh"
source "${SCRIPT_DIR}/_health-gate.sh"

# Main
main() {
  # Non-critical: exit 0 silently if worker offline
  health_gate "non-critical"

  local port
  port=$(get_port)

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(head -c 65536)
  fi

  if [[ -z "${input}" ]]; then
    exit 0
  fi

  # Require jq
  if ! command -v jq &> /dev/null; then
    exit 0
  fi

  # Parse session_id (from capture-prompt.sh pattern) and cwd
  local session_id cwd
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  cwd=$(echo "${input}" | jq -r '.cwd // ""')

  # Skip if no valid session
  if [[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]]; then
    exit 0
  fi

  local project
  project=$(detect_project "${cwd:-${PWD}}")

  # Call arena pending endpoint
  local response
  response=$(curl -sf --max-time 2 --connect-timeout 1 \
    "http://127.0.0.1:${port}/api/arena/pending?project=${project}&sessionId=${session_id}" 2>/dev/null) || true

  if [[ -n "${response}" ]]; then
    echo "${response}"
    log "Injected arena checks for session: ${session_id}"
  fi

  exit 0
}

main "$@"

#!/bin/bash
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
WORKER_JSON="${CELLM_DIR}/worker.json"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
DEFAULT_PORT=31415

# Logging (to file only)
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Arena] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Get port from worker.json
get_port() {
  if [[ -f "${WORKER_JSON}" ]]; then
    local port
    if command -v jq >/dev/null 2>&1; then
      port=$(jq -r '.port // empty' "${WORKER_JSON}" 2>/dev/null || echo "")
    else
      port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "${WORKER_JSON}" 2>/dev/null | grep -o '[0-9]*' || echo "")
    fi
    if [[ -n "${port}" ]] && [[ "${port}" =~ ^[0-9]+$ ]] && [[ "${port}" -ge 1 ]] && [[ "${port}" -le 65535 ]]; then
      echo "${port}"
      return
    fi
  fi
  echo "${DEFAULT_PORT}"
}

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
    input=$(cat)
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

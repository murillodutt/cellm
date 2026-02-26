#!/usr/bin/env bash
# CELLM Oracle - Init Session (SessionStart hook)
# Initializes a new session in the Oracle for AI analysis
# Phase 7: Independent AI Analysis System
#
# Claude Code hooks receive data via stdin as JSON, not environment variables.
# See: https://docs.anthropic.com/en/docs/claude-code/hooks

set -euo pipefail

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [SessionInit] Script failed with exit code $exit_code" >> "${HOME}/.cellm/oracle-hook.log" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup EXIT

# Configuration
CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034 # used by sourced _get-port.sh
DEFAULT_PORT=31415

# Logging
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [SessionInit] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Shared port extraction (jq with grep fallback + range validation)
source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

# Main
main() {
  # Source health gate
  source "$(dirname "${BASH_SOURCE[0]}")/_health-gate.sh"

  local port
  port=$(get_port)
  local url="http://127.0.0.1:${port}/api/session/init"

  # Health gate with retry (critical hook)
  health_gate "critical"

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(head -c 65536)
  fi

  if [[ -z "${input}" ]]; then
    log "No input received"
    exit 0
  fi

  # Check if jq is available
  if ! command -v jq &> /dev/null; then
    log "jq not found, skipping"
    exit 0
  fi

  # Parse JSON input from Claude Code hook
  local session_id cwd project
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  cwd=$(echo "${input}" | jq -r '.cwd // ""')

  # Shared project detection (5 priority levels)
  source "$(dirname "${BASH_SOURCE[0]}")/_detect-project.sh"
  project=$(detect_project "${cwd:-${PWD}}")
  log "Project detected: ${project}"

  # Skip if no valid session
  if [[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]]; then
    log "No valid session_id, skipping"
    exit 0
  fi

  # Build JSON payload for Oracle API
  local payload
  payload=$(jq -n \
    --arg sid "${session_id}" \
    --arg proj "${project}" \
    '{
      sessionId: $sid,
      project: $proj
    }')

  # Send session init request
  if curl -sf --max-time 2 --connect-timeout 0.5 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1; then
    log "Session initialized: ${session_id} (project: ${project})"
  else
    log "Failed to initialize session"
  fi

  exit 0
}

main "$@"

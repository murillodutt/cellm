#!/bin/bash
# CELLM Oracle - Init Session (SessionStart hook)
# Initializes a new session in the Oracle for AI analysis
# Phase 7: Independent AI Analysis System
#
# Claude Code hooks receive data via stdin as JSON, not environment variables.
# See: https://docs.anthropic.com/en/docs/claude-code/hooks

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

# Logging
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [SessionInit] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Get port from worker.json
get_port() {
  if [[ -f "${WORKER_JSON}" ]]; then
    local port
    port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "${WORKER_JSON}" 2>/dev/null | grep -o '[0-9]*' || echo "")
    if [[ -n "${port}" ]]; then
      echo "${port}"
      return
    fi
  fi
  echo "${DEFAULT_PORT}"
}

# Main
main() {
  local port
  port=$(get_port)
  local url="http://127.0.0.1:${port}/api/session/init"

  # Check if worker is online
  if ! curl -sf --max-time 0.3 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    log "Worker offline, skipping session init"
    exit 0
  fi

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(cat)
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

  # Extract project name from cwd
  if [[ -n "${cwd}" ]]; then
    project=$(basename "${cwd}")
  else
    project=$(basename "${PWD}")
  fi

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

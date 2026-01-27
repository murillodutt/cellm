#!/bin/bash
# CELLM Oracle - Capture Context (Stop hook)
# Captures session summary when Claude Code session ends
# Phase 2: Memory Pipeline

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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Stop] $1" >> "${LOG_FILE}" 2>/dev/null || true
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

# Get project name from current directory
get_project() {
  local cwd="${PWD}"
  # Extract last two path components as project identifier
  basename "${cwd}"
}

# Send session summary to worker
send_session_summary() {
  local port="${1}"
  local url="http://127.0.0.1:${port}/api/session/summary"
  local session_id="${CLAUDE_SESSION_ID:-unknown}"
  local project
  project=$(get_project)

  # Build JSON payload
  local payload
  payload=$(cat <<EOF
{
  "sessionId": "${session_id}",
  "project": "${project}",
  "completed": "Session ended normally",
  "durationSeconds": ${SECONDS:-0}
}
EOF
)

  # Send with short timeout
  curl -sf --max-time 3 --connect-timeout 0.5 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1 || true
}

# Send stop event to context ingest
send_stop_event() {
  local port="${1}"
  local url="http://127.0.0.1:${port}/api/context/ingest"
  local timestamp
  timestamp=$(date +%s)000

  local payload
  payload=$(cat <<EOF
{
  "type": "stop",
  "sessionId": "${CLAUDE_SESSION_ID:-unknown}",
  "project": "$(get_project)",
  "timestamp": ${timestamp},
  "data": {
    "title": "Session ended"
  }
}
EOF
)

  curl -sf --max-time 2 --connect-timeout 0.5 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1 || true
}

# Main
main() {
  log "Stop hook triggered (session: ${CLAUDE_SESSION_ID:-unknown})"

  local port
  port=$(get_port)

  # Check if worker is online
  if curl -sf --max-time 0.2 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    log "Worker online at port ${port}"

    # Send session summary
    send_session_summary "${port}"
    log "Session summary sent"

    # Send stop event
    send_stop_event "${port}"
    log "Stop event sent"
  else
    log "Worker offline, skipping capture"
  fi

  log "Stop hook completed"
  exit 0
}

main "$@"

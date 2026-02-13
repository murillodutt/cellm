#!/bin/bash
# CELLM Oracle - Capture Context (Stop hook)
# Ends session and triggers AI summary generation
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

# Main
main() {
  # Source health gate
  source "$(dirname "${BASH_SOURCE[0]}")/_health-gate.sh"

  local port
  port=$(get_port)

  # Health gate with retry (critical hook)
  health_gate "critical"

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(cat)
  fi

  # DEBUG: Log raw stdin for diagnosis (first 500 chars)
  log "RAW_STDIN_LEN=${#input} RAW_STDIN=${input:0:500}"

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
  local session_id stop_reason hook_event
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  stop_reason=$(echo "${input}" | jq -r '.stop_hook_reason // "unknown"')
  hook_event=$(echo "${input}" | jq -r '.hook_event_name // "Stop"')

  log "Hook triggered (event: ${hook_event}, session: ${session_id}, reason: ${stop_reason})"

  # Skip if no valid session
  if [[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]]; then
    log "No valid session_id, skipping"
    exit 0
  fi

  log "Worker online at port ${port}"

  # Route based on hook event: PreCompact = snapshot, Stop = summary
  if [[ "${hook_event}" == "PreCompact" ]]; then
    # PreCompact: lightweight snapshot, does NOT end session
    local url="http://127.0.0.1:${port}/api/session/compact"
    local payload
    payload=$(jq -n \
      --arg sid "${session_id}" \
      --arg reason "${stop_reason}" \
      '{
        sessionId: $sid,
        reason: $reason
      }')

    curl -sf --max-time 3 --connect-timeout 0.5 \
      -X POST \
      -H "Content-Type: application/json" \
      -d "${payload}" \
      "${url}" >/dev/null 2>&1 || true

    log "Compaction snapshot sent"
  else
    # Stop: full session end + summary generation
    local url="http://127.0.0.1:${port}/api/session/stop"
    local payload
    payload=$(jq -n \
      --arg sid "${session_id}" \
      --arg reason "${stop_reason}" \
      '{
        sessionId: $sid,
        stopReason: $reason
      }')

    curl -sf --max-time 3 --connect-timeout 0.5 \
      -X POST \
      -H "Content-Type: application/json" \
      -d "${payload}" \
      "${url}" >/dev/null 2>&1 || true

    log "Session stop sent (summary queued)"
  fi

  exit 0
}

main "$@"

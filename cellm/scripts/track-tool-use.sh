#!/bin/bash
# CELLM Oracle - Track Tool Use (PostToolUse hook)
# Captures tool usage for AI analysis
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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ToolUse] $1" >> "${LOG_FILE}" 2>/dev/null || true
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
  local url="http://127.0.0.1:${port}/api/session/observation"

  # Health gate (non-critical hook - exits silently if offline)
  health_gate "non-critical"

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
  local session_id tool_name tool_input tool_response cwd project
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  tool_name=$(echo "${input}" | jq -r '.tool_name // "unknown"')
  tool_input=$(echo "${input}" | jq -c '.tool_input // {}')
  tool_response=$(echo "${input}" | jq -c '.tool_response // ""')
  if [[ ${#tool_response} -gt 8000 ]]; then
    log "Truncating response from ${#tool_response} to 8000 chars"
    tool_response="${tool_response:0:8000}[... truncated]"
  fi
  cwd=$(echo "${input}" | jq -r '.cwd // ""')

  # Shared project detection (5 priority levels)
  source "$(dirname "${BASH_SOURCE[0]}")/_detect-project.sh"
  project=$(detect_project "${cwd:-${PWD}}")

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
    --arg tn "${tool_name}" \
    --argjson ti "${tool_input}" \
    --arg tr "${tool_response}" \
    --arg cwd "${cwd}" \
    '{
      sessionId: $sid,
      project: $proj,
      toolName: $tn,
      toolInput: $ti,
      toolOutput: $tr,
      cwd: $cwd
    }')

  # Send observation request (async, don't wait)
  curl -sf --max-time 1 --connect-timeout 0.3 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1 &

  log "Queued observation: ${tool_name} (session: ${session_id})"

  # Always exit 0 - never break CLI
  exit 0
}

main "$@"

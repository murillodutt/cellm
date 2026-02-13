#!/bin/bash
# CELLM Oracle - Capture Prompt (UserPromptSubmit hook)
# Captures user prompts during session for context building
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

# Logging (to file only)
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Prompt] $1" >> "${LOG_FILE}" 2>/dev/null || true
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

# Main
main() {
  # Source health gate
  source "$(dirname "${BASH_SOURCE[0]}")/_health-gate.sh"

  local port
  port=$(get_port)

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
  local session_id prompt_content
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  prompt_content=$(echo "${input}" | jq -r '.prompt // ""')

  # Skip if no valid session
  if [[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]]; then
    log "No valid session_id, skipping"
    exit 0
  fi

  # Skip system messages (task-notification, system-reminder)
  # These are injected by Claude Code, not actual human prompts
  if [[ "${prompt_content}" == "<task-notification>"* ]] || \
     [[ "${prompt_content}" == "<system-reminder>"* ]]; then
    exit 0
  fi

  # Truncate long prompts
  if [[ ${#prompt_content} -gt 10000 ]]; then
    log "Truncating prompt from ${#prompt_content} to 10000 chars"
    prompt_content="${prompt_content:0:10000}[truncated]"
  fi

  local url="http://127.0.0.1:${port}/api/session/prompt"

  # Build JSON payload for Oracle API
  # Note: project not sent here (already set in initSession, schema strips it)
  # Note: promptNumber not sent (server auto-increments)
  local payload
  payload=$(jq -n \
    --arg sid "${session_id}" \
    --arg content "${prompt_content}" \
    '{
      sessionId: $sid,
      userPrompt: $content
    }')

  # Fire and forget - don't wait for response
  curl -sf --max-time 0.5 --connect-timeout 0.2 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1 &

  disown 2>/dev/null || true

  log "Prompt captured (session: ${session_id})"

  # Always exit successfully and quickly
  exit 0
}

main "$@"

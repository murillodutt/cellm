#!/bin/bash
# CELLM Oracle - Capture Prompt (UserPromptSubmit hook)
# Captures user prompts during session for context building
# Phase 2: Memory Pipeline

set -euo pipefail

# Error handling
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    log "Script failed with exit code $exit_code"
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

    # Use jq for reliable JSON parsing
    if command -v jq >/dev/null 2>&1; then
      port=$(jq -r '.port // empty' "${WORKER_JSON}" 2>/dev/null || echo "")
    else
      # Fallback to grep if jq not available
      port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "${WORKER_JSON}" 2>/dev/null | grep -o '[0-9]*' || echo "")
    fi

    # Validate port range (1-65535)
    if [[ -n "${port}" ]] && [[ "${port}" =~ ^[0-9]+$ ]] && [[ "${port}" -ge 1 ]] && [[ "${port}" -le 65535 ]]; then
      echo "${port}"
      return
    fi
  fi
  echo "${DEFAULT_PORT}"
}

# Get project name
get_project() {
  basename "${PWD}"
}

# Send prompt event to worker (fire-and-forget)
send_prompt_event() {
  local port="${1}"
  local url="http://127.0.0.1:${port}/api/context/ingest"
  local timestamp
  timestamp=$(date +%s)000

  # Get prompt from stdin or environment (Claude Code provides it)
  local prompt_content="${CLAUDE_PROMPT:-}"

  # Truncate long prompts (log when truncating)
  if [[ ${#prompt_content} -gt 10000 ]]; then
    log "Truncating prompt from ${#prompt_content} to 10000 chars"
    prompt_content="${prompt_content:0:10000}[truncated]"
  fi

  # Build JSON payload using jq for proper escaping
  local payload
  if command -v jq >/dev/null 2>&1; then
    # Use jq for safe JSON construction (handles all escape cases)
    payload=$(jq -n \
      --arg type "user-prompt" \
      --arg sessionId "${CLAUDE_SESSION_ID:-unknown}" \
      --arg project "$(get_project)" \
      --argjson timestamp "${timestamp}" \
      --arg content "${prompt_content}" \
      '{
        type: $type,
        sessionId: $sessionId,
        project: $project,
        timestamp: $timestamp,
        data: {
          content: $content
        }
      }')
  else
    # Fallback: manual escaping (not recommended, but better than nothing)
    # Escape backslashes first, then quotes, then control chars
    local escaped_content
    escaped_content=$(echo "${prompt_content}" | \
      sed 's/\\/\\\\/g' | \
      sed 's/"/\\"/g' | \
      sed 's/	/\\t/g' | \
      tr '\n' ' ')

    payload=$(cat <<EOF
{
  "type": "user-prompt",
  "sessionId": "${CLAUDE_SESSION_ID:-unknown}",
  "project": "$(get_project)",
  "timestamp": ${timestamp},
  "data": {
    "content": "${escaped_content}"
  }
}
EOF
)
  fi

  # Fire and forget - don't wait for response
  curl -sf --max-time 0.5 --connect-timeout 0.2 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1 &

  disown 2>/dev/null || true
}

# Main
main() {
  local port
  port=$(get_port)

  # Quick check if worker is online (non-blocking)
  if curl -sf --max-time 0.1 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    send_prompt_event "${port}"
    log "Prompt captured"
  fi

  # Always exit successfully and quickly
  exit 0
}

main "$@"

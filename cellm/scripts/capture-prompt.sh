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
  local port
  port=$(get_port)

  # Quick check if worker is online
  if ! curl -sf --max-time 0.1 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    exit 0
  fi

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
  local session_id cwd project prompt_content
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  cwd=$(echo "${input}" | jq -r '.cwd // ""')
  prompt_content=$(echo "${input}" | jq -r '.prompt // ""')

  # Debug: log prompt length
  log "DEBUG: prompt_content length=${#prompt_content}, first50='${prompt_content:0:50}'"

  # Extract project name from git root (ensures consistent metrics)
  local search_dir="${cwd:-${PWD}}"
  if command -v git &> /dev/null; then
    local git_root
    git_root=$(cd "${search_dir}" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null || echo "")
    if [[ -n "${git_root}" ]]; then
      project=$(basename "${git_root}")
    else
      project=$(basename "${search_dir}")
    fi
  else
    project=$(basename "${search_dir}")
  fi

  # Skip if no valid session
  if [[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]]; then
    log "No valid session_id, skipping"
    exit 0
  fi

  # Truncate long prompts
  if [[ ${#prompt_content} -gt 10000 ]]; then
    log "Truncating prompt from ${#prompt_content} to 10000 chars"
    prompt_content="${prompt_content:0:10000}[truncated]"
  fi

  local url="http://127.0.0.1:${port}/api/session/prompt"
  local timestamp
  timestamp=$(date +%s)000

  # Build JSON payload for Oracle API
  local payload
  payload=$(jq -n \
    --arg sid "${session_id}" \
    --arg proj "${project}" \
    --arg content "${prompt_content}" \
    --argjson ts "${timestamp}" \
    '{
      sessionId: $sid,
      project: $proj,
      userPrompt: $content,
      timestamp: $ts
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

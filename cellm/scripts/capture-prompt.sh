#!/usr/bin/env bash
# CELLM Oracle - Capture Prompt v2 (UserPromptSubmit hook, async)
# Captures user prompts during session for context building.
# Runs with "async": true — non-blocking, errors are non-visible.

set -euo pipefail

CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034  # Used by sourced _get-port.sh
DEFAULT_PORT=31415

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Prompt] $1" >> "${LOG_FILE}" 2>/dev/null || true; }

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

command -v jq &>/dev/null || exit 0

port=$(get_port)
session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
prompt_content=$(echo "${input}" | jq -r '.prompt // ""')

[[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]] && exit 0

# Skip system messages
[[ "${prompt_content}" == "<task-notification>"* || "${prompt_content}" == "<system-reminder>"* ]] && exit 0

# Truncate long prompts
[[ ${#prompt_content} -gt 10000 ]] && prompt_content="${prompt_content:0:10000}[truncated]"

payload=$(jq -n \
  --arg sid "${session_id}" \
  --arg content "${prompt_content}" \
  '{ sessionId: $sid, userPrompt: $content }')

curl -sf --max-time 2 --connect-timeout 0.5 \
  -X POST -H "Content-Type: application/json" \
  -d "${payload}" \
  "http://127.0.0.1:${port}/api/session/prompt" >/dev/null 2>&1 || true

log "Prompt captured (session: ${session_id})"

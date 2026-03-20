#!/usr/bin/env bash
# CELLM Oracle - Capture Prompt v2 (UserPromptSubmit hook, async)
# Captures user prompts during session for context building.
# Runs with "async": true — non-blocking, errors are non-visible.
#
# Never exit non-zero: Claude Code surfaces UserPromptSubmit hook errors to the user.
# Invalid JSON, missing jq, or empty stdin must be silent success.

set -uo pipefail

CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034  # Used by sourced _get-port.sh
DEFAULT_PORT=31415

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Prompt] $1" >> "${LOG_FILE}" 2>/dev/null || true; }

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"

input=""
if [[ ! -t 0 ]]; then
  input=$(head -c 65536 2>/dev/null) || input=""
fi
[[ -z "${input}" ]] && exit 0

command -v jq &>/dev/null || exit 0

# Reject invalid JSON without failing the hook (jq parse error must not propagate)
if ! echo "${input}" | jq -e . >/dev/null 2>&1; then
  exit 0
fi

base_url=$(get_base_url)
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
  "${base_url}/api/session/prompt" >/dev/null 2>&1 || true

log "Prompt captured (session: ${session_id})"

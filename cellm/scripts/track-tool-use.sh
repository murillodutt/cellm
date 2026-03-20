#!/usr/bin/env bash
# CELLM Oracle - Track Tool Use v2 (PostToolUse hook, async)
# Captures tool usage for AI analysis.
# Runs with "async": true — non-blocking, errors are non-visible.

set -euo pipefail

CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034  # Used by sourced _get-port.sh
DEFAULT_PORT=31415

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ToolUse] $1" >> "${LOG_FILE}" 2>/dev/null || true; }

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

command -v jq &>/dev/null || exit 0

session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
tool_name=$(echo "${input}" | jq -r '.tool_name // "unknown"')
tool_input=$(echo "${input}" | jq -c '.tool_input // {}')
tool_response=$(echo "${input}" | jq -c '.tool_response // ""')
cwd=$(echo "${input}" | jq -r '.cwd // ""')

[[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]] && exit 0

# Truncate large responses
[[ ${#tool_response} -gt 8000 ]] && tool_response="${tool_response:0:8000}[... truncated]"

# Project detection
source "$(dirname "${BASH_SOURCE[0]}")/_detect-project.sh"
project=$(detect_project "${cwd:-${PWD}}")

payload=$(jq -n \
  --arg sid "${session_id}" \
  --arg proj "${project}" \
  --arg tn "${tool_name}" \
  --argjson ti "${tool_input}" \
  --arg tr "${tool_response}" \
  --arg cwd "${cwd}" \
  '{ sessionId: $sid, project: $proj, toolName: $tn, toolInput: $ti, toolOutput: $tr, cwd: $cwd }')

base_url=$(get_base_url)

curl -sf --max-time 2 --connect-timeout 0.5 \
  -X POST -H "Content-Type: application/json" \
  -d "${payload}" \
  "${base_url}/api/session/observation" >/dev/null 2>&1 || true

log "Observation: ${tool_name} (session: ${session_id})"

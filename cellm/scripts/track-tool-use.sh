#!/usr/bin/env bash
# CELLM Oracle - Track Tool Use v2 (PostToolUse hook, async)
# Captures tool usage for AI analysis.
# Runs with "async": true — non-blocking, errors are non-visible.
#
# Important: do NOT use "set -e" here. Hook payloads can be malformed/truncated
# (e.g. very large tool outputs), and this script must degrade silently.
set -uo pipefail

CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034  # Used by sourced _get-port.sh
DEFAULT_PORT=31415

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [ToolUse] $1" >> "${LOG_FILE}" 2>/dev/null || true; }

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"

input=""
[[ ! -t 0 ]] && input=$(cat || true)
[[ -z "${input}" ]] && exit 0

command -v jq &>/dev/null || exit 0

# Guard against malformed JSON payloads: skip instead of failing hook.
if ! printf '%s' "${input}" | jq -e . >/dev/null 2>&1; then
  log "Malformed hook payload (skipping)"
  exit 0
fi

session_id=$(printf '%s' "${input}" | jq -r '.session_id // "unknown"' 2>/dev/null || echo "unknown")
tool_name=$(printf '%s' "${input}" | jq -r '.tool_name // "unknown"' 2>/dev/null || echo "unknown")
tool_input=$(printf '%s' "${input}" | jq -c '.tool_input // {}' 2>/dev/null || echo "{}")
tool_response=$(printf '%s' "${input}" | jq -r '.tool_response // ""' 2>/dev/null || echo "")
cwd=$(printf '%s' "${input}" | jq -r '.cwd // ""' 2>/dev/null || echo "")

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

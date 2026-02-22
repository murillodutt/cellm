#!/usr/bin/env bash
# CELLM Oracle - Inject Knowledge (UserPromptSubmit hook)
# Fetches relevant knowledge atoms based on user prompt and injects into context.
# Output: plain text stdout -> injected as additionalContext in Claude context
#
# Claude Code hooks receive data via stdin as JSON, not environment variables.

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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Knowledge] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Shared port extraction (jq with grep fallback + range validation)
source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

# Shared helpers
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_detect-project.sh"
source "${SCRIPT_DIR}/_health-gate.sh"

# Main
main() {
  # Non-critical: exit 0 silently if worker offline
  health_gate "non-critical"

  local port
  port=$(get_port)

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(head -c 65536)
  fi

  if [[ -z "${input}" ]]; then
    exit 0
  fi

  # Require jq
  if ! command -v jq &> /dev/null; then
    exit 0
  fi

  # Parse prompt and cwd from stdin
  local prompt cwd
  prompt=$(echo "${input}" | jq -r '.prompt // ""')
  cwd=$(echo "${input}" | jq -r '.cwd // ""')

  # Guard: short prompts generate noise (< 10 chars)
  if [[ ${#prompt} -lt 10 ]]; then
    exit 0
  fi

  # Skip system messages (not human prompts)
  if [[ "${prompt}" == "<task-notification>"* ]] || \
     [[ "${prompt}" == "<system-reminder>"* ]]; then
    exit 0
  fi

  local project
  project=$(detect_project "${cwd:-${PWD}}")

  # Truncate prompt for search (max 500 chars — we only need semantic gist)
  local search_context="${prompt}"
  if [[ ${#search_context} -gt 500 ]]; then
    search_context="${search_context:0:500}"
  fi

  # Build payload
  local payload
  payload=$(jq -n \
    --arg proj "${project}" \
    --arg ctx "${search_context}" \
    '{project: $proj, context: $ctx, limit: 5}')

  local response
  response=$(curl -sf --max-time 2 --connect-timeout 1 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "http://127.0.0.1:${port}/api/knowledge/inject" 2>/dev/null) || true

  if [[ -n "${response}" ]]; then
    echo "${response}"
    log "Injected knowledge for project: ${project}"
  fi

  exit 0
}

main "$@"

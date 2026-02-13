#!/bin/bash
# CELLM Oracle - Inject Context (SessionStart helper)
# Fetches recent context from Worker and outputs for injection
# Output: plain text stdout -> injected as <system-reminder> in Claude context

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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Inject] $1" >> "${LOG_FILE}" 2>/dev/null || true
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

# Shared helpers (consistent with init-session.sh)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_detect-project.sh"
source "${SCRIPT_DIR}/_health-gate.sh"

# Main
main() {
  # Non-critical: exit 0 silently if worker offline (no stale message in context)
  health_gate "non-critical"

  local port
  port=$(get_port)

  # Read stdin (hook data) to extract cwd for project detection
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(cat)
  fi

  local cwd=""
  if [[ -n "${input}" ]]; then
    if command -v jq &> /dev/null; then
      cwd=$(echo "${input}" | jq -r '.cwd // ""')
    else
      cwd=$(echo "${input}" | grep -o '"cwd"[[:space:]]*:[[:space:]]*"[^"]*"' 2>/dev/null | sed 's/"cwd"[[:space:]]*:[[:space:]]*"//;s/"$//' || echo "")
    fi
  fi

  local project
  project=$(detect_project "${cwd:-${PWD}}")

  log "Injecting context for project: ${project}"

  # Endpoint returns plain text markdown — no JSON parsing needed
  local response
  response=$(curl -sf --max-time 3 --connect-timeout 0.5 "http://127.0.0.1:${port}/api/context/generate?project=${project}" 2>/dev/null)

  if [[ $? -eq 0 && -n "${response}" ]]; then
    echo "${response}"
    log "Context injected successfully"
  else
    log "No context available"
  fi

  exit 0
}

main "$@"

#!/usr/bin/env bash
# CELLM Oracle - Inject Context (SessionStart helper)
# Fetches recent context from Worker and outputs for injection
# Output: plain text stdout -> injected as <system-reminder> in Claude context

set -euo pipefail

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Inject] Script failed with exit code $exit_code" >> "${HOME}/.cellm/oracle-hook.log" 2>/dev/null || true
  fi
  exit 0
}

trap cleanup EXIT

# Configuration
CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
# shellcheck disable=SC2034 # used by sourced _get-port.sh
DEFAULT_PORT=31415

# Logging
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Inject] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Shared port extraction (jq with grep fallback + range validation)
source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

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
    input=$(head -c 65536)
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

  # Stack updates: write pending count for statusline (non-critical)
  write_stack_state "${port}"

  # Knowledge: Inject active facts briefing (non-critical)
  inject_knowledge "${port}" "${project}"

  # DSE: Inject design system decisions (non-critical)
  inject_design_system "${port}" "${project}"

  # Specs: Inject active spec summary (non-critical)
  inject_specs "${port}" "${project}"

  # Knowledge health: Inject gap indicator (non-critical)
  inject_knowledge_health "${port}" "${project}"

  exit 0
}

# Fetch knowledge atoms briefing for session start
inject_knowledge() {
  local port="$1"
  local project="$2"

  local payload
  payload=$(jq -n \
    --arg proj "${project}" \
    --arg ctx "SessionStart ${project}" \
    '{project: $proj, context: $ctx, limit: 15}') 2>/dev/null || return 0

  local response
  response=$(curl -sf --max-time 3 --connect-timeout 1 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "http://127.0.0.1:${port}/api/knowledge/inject" 2>/dev/null) || return 0

  if [[ -n "${response}" ]]; then
    echo ""
    echo "${response}"
    log "Knowledge: injected briefing for ${project}"
  fi
}

# Write stack pending count to file for statusline consumption
write_stack_state() {
  local port="$1"
  local state_file="${CELLM_DIR}/statusline-state"

  local status_json
  status_json=$(curl -sf --max-time 1 --connect-timeout 0.3 "http://127.0.0.1:${port}/api/stack-tracker/status" 2>/dev/null) || return 0

  if [[ -n "${status_json}" ]] && command -v jq &> /dev/null; then
    local pending
    pending=$(echo "${status_json}" | jq -r '[.migrations[] | select(.status == "pending" or .status == "approved" or .status == "blocked")] | length' 2>/dev/null)
    echo "${pending:-0}" > "${state_file}"
    log "Stack state: ${pending:-0} pending updates"
  fi
}

# Fetch design decisions and output compact summary
inject_design_system() {
  local port="$1"
  local project="$2"

  local dse_json
  dse_json=$(curl -sf --max-time 2 --connect-timeout 0.5 "http://127.0.0.1:${port}/api/design-system/decisions?project=${project}" 2>/dev/null) || return 0

  if [[ -z "${dse_json}" ]]; then
    return 0
  fi

  if ! command -v jq &> /dev/null; then
    return 0
  fi

  local total decisions_count
  total=$(echo "${dse_json}" | jq -r '.total // 0' 2>/dev/null) || return 0
  decisions_count=$(echo "${dse_json}" | jq -r '.decisionsCount // 0' 2>/dev/null) || return 0

  if [[ "${total}" == "0" ]]; then
    return 0
  fi

  echo ""
  echo "### Design System"
  echo "DSE active: ${total} entities with ${decisions_count} decisions. Use \`dse_search\` for details."

  log "DSE: injected summary (${total} entities, ${decisions_count} decisions)"
}

# Fetch active spec summary for session awareness
inject_specs() {
  local port="$1"
  local project="$2"

  local response
  response=$(curl -sf --max-time 1 --connect-timeout 0.5 \
    "http://127.0.0.1:${port}/api/spec/active-summary?project=${project}" 2>/dev/null) || return 0

  if [[ -n "${response}" ]]; then
    echo ""
    echo "${response}"
    log "Specs: injected active summary for ${project}"
  fi
}

# Fetch knowledge health indicator for capture gap awareness
inject_knowledge_health() {
  local port="$1"
  local project="$2"

  local response
  response=$(curl -sf --max-time 1 --connect-timeout 0.5 \
    "http://127.0.0.1:${port}/api/metrics/knowledge-health?project=${project}&window=10" 2>/dev/null) || return 0

  if [[ -z "${response}" ]]; then
    return 0
  fi

  if ! command -v jq &> /dev/null; then
    return 0
  fi

  local indicator
  indicator=$(echo "${response}" | jq -r '.indicator // empty' 2>/dev/null) || return 0

  if [[ -n "${indicator}" ]]; then
    echo ""
    echo "${indicator}"
    log "Knowledge health: indicator injected"
  fi
}

main "$@"

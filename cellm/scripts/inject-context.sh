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

  # Knowledge: Inject active facts briefing (non-critical)
  inject_knowledge "${port}" "${project}"

  # DSE: Inject design system summary (non-critical)
  inject_design_system "${port}"

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

# Fetch design system summary and output compact markdown table
inject_design_system() {
  local port="$1"

  local dse_json
  dse_json=$(curl -sf --max-time 2 --connect-timeout 0.5 "http://127.0.0.1:${port}/api/design-system" 2>/dev/null) || return 0

  if [[ -z "${dse_json}" ]]; then
    return 0
  fi

  # Require jq for JSON parsing
  if ! command -v jq &> /dev/null; then
    return 0
  fi

  local theme archetype primary secondary success info warning error neutral
  local component_count pattern_count

  theme=$(echo "${dse_json}" | jq -r '.meta.name // empty' 2>/dev/null) || return 0
  archetype=$(echo "${dse_json}" | jq -r '.archetype // empty' 2>/dev/null) || return 0
  primary=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.primary.value.value // empty' 2>/dev/null) || return 0
  secondary=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.secondary.value.value // empty' 2>/dev/null) || return 0
  success=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.success.value.value // empty' 2>/dev/null) || return 0
  info=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.info.value.value // empty' 2>/dev/null) || return 0
  warning=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.warning.value.value // empty' 2>/dev/null) || return 0
  error=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.error.value.value // empty' 2>/dev/null) || return 0
  neutral=$(echo "${dse_json}" | jq -r '.tokens.colors.semantic.neutral.value.value // empty' 2>/dev/null) || return 0
  component_count=$(echo "${dse_json}" | jq '.components | keys | length' 2>/dev/null) || return 0
  pattern_count=$(echo "${dse_json}" | jq '.patterns | keys | length' 2>/dev/null) || return 0

  # Skip if no theme name extracted
  if [[ -z "${theme}" ]]; then
    log "DSE: no theme name, skipping"
    return 0
  fi

  # Output compact markdown table
  echo ""
  echo "### Design System"
  echo "| Token | Value |"
  echo "|-------|-------|"
  echo "| Theme | ${theme} |"
  echo "| Archetype | ${archetype} |"
  echo "| Primary | ${primary} |"
  [[ -n "${secondary}" ]] && echo "| Secondary | ${secondary} |" || true
  [[ -n "${success}" ]] && echo "| Success | ${success} |" || true
  [[ -n "${info}" ]] && echo "| Info | ${info} |" || true
  [[ -n "${warning}" ]] && echo "| Warning | ${warning} |" || true
  [[ -n "${error}" ]] && echo "| Error | ${error} |" || true
  [[ -n "${neutral}" ]] && echo "| Neutral | ${neutral} |" || true
  echo "| Components | ${component_count} |"
  echo "| Patterns | ${pattern_count} |"

  log "DSE: injected summary for ${theme} (${component_count} components, ${pattern_count} patterns)"
}

main "$@"

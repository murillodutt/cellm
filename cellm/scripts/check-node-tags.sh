#!/usr/bin/env bash
# CELLM Oracle - Check Node Tags (PreToolUse hook)
# Injects tags + action_note context before Edit/Write operations.
# If node has "locked" tag, blocks the operation.
#
# Claude Code hooks receive data via stdin as JSON, not environment variables.
# See: https://docs.anthropic.com/en/docs/claude-code/hooks

set -euo pipefail

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [NodeTags] Script failed with exit code $exit_code" >> "${HOME}/.cellm/oracle-hook.log" 2>/dev/null || true
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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [NodeTags] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Shared port extraction (jq with grep fallback + range validation)
source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"

# Main
main() {
  # Source health gate
  source "$(dirname "${BASH_SOURCE[0]}")/_health-gate.sh"

  local port
  port=$(get_port)

  # Health gate (non-critical — worker offline = exit 0, no block)
  health_gate "non-critical"

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(head -c 65536)
  fi

  if [[ -z "${input}" ]]; then
    log "No input received"
    exit 0
  fi

  # Check if jq is available
  if ! command -v jq &> /dev/null; then
    log "jq not found, skipping"
    exit 0
  fi

  # Extract file_path from tool_input
  local file_path
  file_path=$(echo "${input}" | jq -r '.tool_input.file_path // ""')

  if [[ -z "${file_path}" ]]; then
    log "No file_path in tool_input, skipping"
    exit 0
  fi

  # Detect project
  local cwd
  cwd=$(echo "${input}" | jq -r '.cwd // ""')

  source "$(dirname "${BASH_SOURCE[0]}")/_detect-project.sh"
  local project
  project=$(detect_project "${cwd:-${PWD}}")

  # Normalize path: make relative to project root
  local normalized="${file_path}"
  if [[ "${file_path}" == /* ]]; then
    # Absolute path — strip cwd prefix to get relative
    local project_root="${cwd:-${PWD}}"
    normalized="${file_path#"${project_root}"/}"
  fi

  # Query worker for node data
  local url="http://127.0.0.1:${port}/api/workflow/node-by-path?project=${project}&path=${normalized}"
  local response
  response=$(curl -sf --max-time 1.5 --connect-timeout 0.3 "${url}" 2>/dev/null) || {
    log "API call failed for path: ${normalized}"
    exit 0
  }

  # Check if node was found
  local found
  found=$(echo "${response}" | jq -r '.found // false')

  if [[ "${found}" != "true" ]]; then
    log "No node found for: ${normalized}"
    exit 0
  fi

  # Extract node data
  local label type tags_json action_note
  label=$(echo "${response}" | jq -r '.node.label // ""')
  type=$(echo "${response}" | jq -r '.node.type // ""')
  tags_json=$(echo "${response}" | jq -c '.node.tags // []')
  action_note=$(echo "${response}" | jq -r '.node.actionNote // ""')

  # Check if there's anything relevant to inject
  local tag_count
  tag_count=$(echo "${tags_json}" | jq 'length')

  if [[ "${tag_count}" -eq 0 && -z "${action_note}" ]]; then
    log "Node found but no tags or action_note: ${label}"
    exit 0
  fi

  # Build context string
  local context_parts=""

  # Check for locked tag
  local is_locked
  is_locked=$(echo "${tags_json}" | jq 'map(ascii_downcase) | any(. == "locked")')

  local decision="allow"

  # Format tags as uppercase markers (exclude "locked" — handled separately)
  if [[ "${tag_count}" -gt 0 ]]; then
    local tags_upper
    tags_upper=$(echo "${tags_json}" | jq -r '[.[] | ascii_upcase | select(. != "LOCKED")] | .[] ' | tr '\n' ' ' | sed 's/ $//')
    if [[ -n "${tags_upper}" ]]; then
      context_parts="[${tags_upper// /] [}]"
    fi
  fi

  if [[ "${is_locked}" == "true" ]]; then
    decision="deny"
    context_parts="[LOCKED] ${context_parts}"
    log "BLOCKED edit on locked node: ${label} (${normalized})"
  fi

  context_parts="${context_parts} node: ${label} (${type})"

  if [[ -n "${action_note}" ]]; then
    context_parts="${context_parts} | action_note: ${action_note}"
  fi

  if [[ "${decision}" == "allow" ]]; then
    log "Injecting context for node: ${label} (${normalized})"
  fi

  # Output hookSpecificOutput JSON
  jq -n \
    --arg event "PreToolUse" \
    --arg decision "${decision}" \
    --arg context "${context_parts}" \
    '{
      hookSpecificOutput: {
        hookEventName: $event,
        permissionDecision: $decision,
        additionalContext: $context
      }
    }'

  exit 0
}

main "$@"

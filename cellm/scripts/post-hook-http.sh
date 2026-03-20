#!/usr/bin/env bash
# CELLM - HTTP hook wrapper — fail-silent on connection errors
# Replaces direct "type": "http" hooks to prevent "hook error" in Claude Code UI
# when Oracle is offline or restarting.
#
# Claude Code command hooks must print valid JSON on stdout (exit 0); see
# sk-extensibility-reference/core/hooks.md. Oracle routes return either JSON
# objects or plain text — this script normalizes to the hook envelope.
#
# Usage: post-hook-http.sh <api-path>
# Example: post-hook-http.sh /api/hooks/spec-reconcile
#
# URL resolution: CELLM_WORKER_URL env var (set in .mcp.json) → worker.json port → default 31415
#
# Related files (File Context System):
#  - cellm-plugin/cellm/hooks/hooks.json
#  - cellm-plugin/cellm/scripts/_get-port.sh

CELLM_DIR="${HOME}/.cellm"
# shellcheck disable=SC2034
DEFAULT_PORT=31415

source "$(dirname "${BASH_SOURCE[0]}")/_get-port.sh"
source "$(dirname "${BASH_SOURCE[0]}")/_get-base-url.sh"

# Emit stdout Claude Code expects from a command hook (exit 0).
emit_hook_envelope() {
  local raw="${1:-}"
  if ! command -v jq &>/dev/null; then
    printf '{"continue":true,"hookSpecificOutput":{}}\n'
    return
  fi
  if [[ -z "${raw}" ]]; then
    printf '{"continue":true,"hookSpecificOutput":{}}\n'
    return
  fi
  if printf '%s' "${raw}" | jq -e 'type == "object"' >/dev/null 2>&1; then
    printf '%s\n' "$(printf '%s' "${raw}" | jq -c 'if has("continue") then . else . + {continue: true} end')"
    return
  fi
  local esc
  esc=$(printf '%s' "${raw}" | jq -Rs .)
  printf '{"continue":true,"hookSpecificOutput":{"additionalContext":%s}}\n' "${esc}"
}

api_path="${1:-}"
if [[ -z "${api_path}" ]]; then
  emit_hook_envelope ""
  exit 0
fi

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)

base_url=$(get_base_url)

response=$(curl -sf --max-time 3 --connect-timeout 1 \
  -X POST -H "Content-Type: application/json" \
  -d "${input:-"{}"}" \
  "${base_url}${api_path}" 2>/dev/null) || {
  emit_hook_envelope ""
  exit 0
}

emit_hook_envelope "${response}"
exit 0

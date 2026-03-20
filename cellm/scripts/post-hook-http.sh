#!/usr/bin/env bash
# CELLM - HTTP hook wrapper — fail-silent on connection errors
# Replaces direct "type": "http" hooks to prevent "hook error" in Claude Code UI
# when Oracle is offline or restarting.
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

api_path="${1:-}"
[[ -z "${api_path}" ]] && exit 0

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)

# Extract hook event name from stdin JSON for proper envelope formatting
hook_event=""
if [[ -n "${input}" ]]; then
  hook_event=$(printf '%s' "${input}" | grep -o '"hook_event_name":"[^"]*"' | head -1 | cut -d'"' -f4)
fi

base_url=$(get_base_url)

response=$(curl -sf --max-time 3 --connect-timeout 1 \
  -X POST -H "Content-Type: application/json" \
  -d "${input:-"{}"}" \
  "${base_url}${api_path}" 2>/dev/null) || exit 0

# Forward response to Claude Code
# Skip empty responses or Nitro's serialized empty string '""'
[[ -z "${response}" || "${response}" == '""' || "${response}" == '""' ]] && exit 0

# If endpoint already returns hookSpecificOutput JSON, pass through as-is.
# Otherwise, wrap plain text in the hook envelope so Claude Code can parse it.
if printf '%s' "${response}" | grep -q '"hookSpecificOutput"'; then
  # Inject hookEventName if missing and we know the event type
  if [[ -n "${hook_event}" ]] && ! printf '%s' "${response}" | grep -q '"hookEventName"'; then
    # Insert hookEventName as first key inside hookSpecificOutput
    printf '%s\n' "${response}" | sed "s/\"hookSpecificOutput\":{/\"hookSpecificOutput\":{\"hookEventName\":\"${hook_event}\",/"
  else
    printf '%s\n' "${response}"
  fi
else
  # Escape the response for safe JSON embedding (newlines, quotes, backslashes)
  escaped=$(printf '%s' "${response}" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n' ' ')
  if [[ -n "${hook_event}" ]]; then
    printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":"%s"}}\n' "${hook_event}" "${escaped}"
  else
    printf '{"hookSpecificOutput":{"additionalContext":"%s"}}\n' "${escaped}"
  fi
fi

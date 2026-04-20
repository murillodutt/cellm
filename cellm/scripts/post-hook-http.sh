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
source "$(dirname "${BASH_SOURCE[0]}")/_quantization-policy.sh"

api_path="${1:-}"
[[ -z "${api_path}" ]] && exit 0

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)

# Extract hook event name from stdin JSON for proper envelope formatting
hook_event=""
if [[ -n "${input}" ]]; then
  hook_event=$(printf '%s' "${input}" | grep -o '"hook_event_name" *: *"[^"]*"' | head -1 | cut -d'"' -f4)
fi

# Whitelist validation — prevent injection via unexpected event names
case "${hook_event}" in
  SessionStart|UserPromptSubmit|PreToolUse|PostToolUse) ;;
  *) hook_event="" ;;
esac

base_url=$(get_base_url)

# Log hook degradation to AGENT-JOURNAL.md (dev-mode observability)
# Maintains exit 0 behavior — never blocks Claude Code
log_hook_degraded() {
  local path="$1"
  local journal="${CELLM_DIR}/logs/AGENT-JOURNAL.md"
  mkdir -p "${CELLM_DIR}/logs"
  if [ ! -f "${journal}" ]; then
    printf '# JORNAL DE ERROS — CELLM Agent\n\n' >> "${journal}"
  fi
  printf -- '---\n\n## %s\n\n- **Tipo**: HOOK_DEGRADED\n- **Tool**: post-hook-http %s\n- **Erro**: curl failed — Worker unreachable or timeout\n- **Acao sugerida**: Verificar Worker: curl %s/health\n\n' \
    "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)" "${path}" "${base_url}" >> "${journal}" 2>/dev/null || true
}

response=$(curl -sf --max-time 3 --connect-timeout 1 \
  -X POST -H "Content-Type: application/json" \
  -d "${input:-"{}"}" \
  "${base_url}${api_path}" 2>/dev/null) || { log_hook_degraded "${api_path}"; exit 0; }

# Forward response to Claude Code
# Skip empty responses or Nitro's serialized empty string '""'
[[ -z "${response}" || "${response}" == '""' || "${response}" == 'null' ]] && exit 0

# UI-driven quantization policy (single source of truth).
# Applies only to additionalContext payload delivered back to Claude CLI.
qz_enabled=$(get_ui_quantization_enabled "${base_url}")
qz_mode="standard"
qz_cap="1200"
if [[ "${qz_enabled}" == "true" ]]; then
  qz_mode=$(get_ui_quantization_mode "${base_url}")
  qz_cap=$(get_ui_quantization_cap "${base_url}")
fi

effective_cap=$(get_cli_context_cap_for_mode "${qz_mode}")
# Keep CLI context window tight: derive from UI cap with small headroom only.
ui_derived_cap=$(( (qz_cap * 3 + 1) / 2 )) # ~1.5x
effective_cap=$(min_int "${effective_cap}" "${ui_derived_cap}")

quantize_if_needed() {
  local input_text="$1"
  if [[ "${qz_enabled}" != "true" ]]; then
    printf '%s' "${input_text}"
    return 0
  fi
  quantize_hook_context "${input_text}" "${qz_mode}" "${effective_cap}"
}

# If endpoint already returns hookSpecificOutput JSON, pass through as-is.
# Otherwise, wrap plain text in the hook envelope so Claude Code can parse it.
if printf '%s' "${response}" | grep -q '"hookSpecificOutput"'; then
  # If hookSpecificOutput has additionalContext and jq exists, quantize that field.
  if command -v jq >/dev/null 2>&1; then
    existing_ctx=$(printf '%s' "${response}" | jq -r '.hookSpecificOutput.additionalContext // empty' 2>/dev/null || true)
    if [[ -n "${existing_ctx}" ]]; then
      quantized_ctx=$(quantize_if_needed "${existing_ctx}")
      response=$(printf '%s' "${response}" | jq --arg ctx "${quantized_ctx}" '.hookSpecificOutput.additionalContext = $ctx' 2>/dev/null || printf '%s' "${response}")
    fi
  fi

  # Inject hookEventName if missing and we know the event type
  if [[ -n "${hook_event}" ]] && ! printf '%s' "${response}" | grep -q '"hookEventName"'; then
    # Insert hookEventName as first key inside hookSpecificOutput
    printf '%s\n' "${response}" | sed "s/\"hookSpecificOutput\" *: *{/\"hookSpecificOutput\":{\"hookEventName\":\"${hook_event}\",/"
  else
    printf '%s\n' "${response}"
  fi
else
  response=$(quantize_if_needed "${response}")
  # Use jq for JSON-safe embedding of arbitrary strings (handles quotes, backslashes, control chars)
  if [[ -n "${hook_event}" ]]; then
    printf '%s' "${response}" | jq -Rc --arg event "${hook_event}" \
      '{hookSpecificOutput:{hookEventName:$event,additionalContext:.}}' 2>/dev/null \
      || printf '{"hookSpecificOutput":{"hookEventName":"%s"}}\n' "${hook_event}"
  else
    # hook_event unknown — still include hookEventName with fallback "Unknown"
    # to satisfy Claude Code validation (hookSpecificOutput without hookEventName is INVALID)
    printf '%s' "${response}" | jq -Rc \
      '{hookSpecificOutput:{hookEventName:"Unknown",additionalContext:.}}' 2>/dev/null \
      || printf '{"hookSpecificOutput":{"hookEventName":"Unknown"}}\n'
  fi
fi

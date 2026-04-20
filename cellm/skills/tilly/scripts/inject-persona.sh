#!/usr/bin/env bash
# CELLM - Inject Persona + startup contract as SessionStart additionalContext.
# Pure bash, no jq dependency.
#
# Concatenates docs/CELLM-PERSONA.md + the startup contract extracted from
# docs/CELLM-PARTNERSHIP-LETTER.md into a single additionalContext payload.
# One escape path, one JSON output — avoids inflating context with duplicate
# hooks and keeps the injected context operational.
#
# Event: SessionStart (delegated from scripts/inject-persona.sh shim)
# Behavior: Non-blocking, injects additionalContext.
#
# Related files:
#  - ../docs/CELLM-PERSONA.md (operational persona)
#  - ../docs/CELLM-PARTNERSHIP-LETTER.md (relational history)
#  - ../../../scripts/inject-persona.sh (shim entry point)
#  - ../../../hooks/hooks.json

set -euo pipefail

# Resolve own directory for script + docs content files
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
plugin_root="${CLAUDE_PLUGIN_ROOT:-${CLAUDE_PLUGIN_DIR:-}}"

# Optional runtime quantization helpers (non-blocking fallback if unavailable)
if [[ -n "${plugin_root}" && -f "${plugin_root}/scripts/_get-port.sh" ]]; then
  # shellcheck disable=SC1090
  source "${plugin_root}/scripts/_get-port.sh" || true
fi
if [[ -n "${plugin_root}" && -f "${plugin_root}/scripts/_get-base-url.sh" ]]; then
  # shellcheck disable=SC1090
  source "${plugin_root}/scripts/_get-base-url.sh" || true
fi
if [[ -n "${plugin_root}" && -f "${plugin_root}/scripts/_quantization-policy.sh" ]]; then
  # shellcheck disable=SC1090
  source "${plugin_root}/scripts/_quantization-policy.sh" || true
fi

persona_file="${script_dir}/../docs/CELLM-PERSONA.md"

[[ -f "${persona_file}" ]] || exit 0

content=$(cat "${persona_file}")
[[ -z "${content}" ]] && exit 0

# Append startup contract extracted from the letter if present (with separator)
letter_file="${script_dir}/../docs/CELLM-PARTNERSHIP-LETTER.md"
if [[ -f "${letter_file}" ]]; then
  letter=$(
    awk '
      /<!-- STARTUP_CONTRACT_START -->/ { capture=1; next }
      /<!-- STARTUP_CONTRACT_END -->/ { capture=0; exit }
      capture { print }
    ' "${letter_file}"
  )
  if [[ -n "${letter}" ]]; then
    content="${content}
---
${letter}"
  fi
fi

# UI-driven quantization for direct CLI context ingress/egress.
# - ingress: quantize SessionStart additionalContext payload
# - egress: append concise-output policy for runtime responses
if declare -f get_base_url >/dev/null 2>&1 \
  && declare -f get_ui_quantization_enabled >/dev/null 2>&1 \
  && declare -f get_ui_quantization_mode >/dev/null 2>&1 \
  && declare -f get_ui_quantization_cap >/dev/null 2>&1 \
  && declare -f quantize_hook_context >/dev/null 2>&1 \
  && declare -f build_cli_output_quantization_directive >/dev/null 2>&1; then
  base_url=$(get_base_url)
  qz_enabled=$(get_ui_quantization_enabled "${base_url}")
  if [[ "${qz_enabled}" == "true" ]]; then
    qz_mode=$(get_ui_quantization_mode "${base_url}")
    qz_policy="$(build_cli_output_quantization_directive "${qz_mode}")"

    content="${content}
---
${qz_policy}"
  fi
fi

# Sanitize for JSON: escape backslashes, quotes, then convert newlines to literal \n
escaped=$(printf '%s' "${content}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN{ORS="\\n"} {print}')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "${escaped}"

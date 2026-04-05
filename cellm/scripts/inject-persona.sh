#!/usr/bin/env bash
# CELLM - Inject Persona — reads CELLM-PERSONA.md and injects as SessionStart additionalContext.
# Pure bash, no jq dependency, POSIX-compatible.
#
# Event: SessionStart
# Behavior: Non-blocking, injects additionalContext with operational persona.
#
# Related files:
#  - cellm-plugin/cellm/CELLM-PERSONA.md (single source of truth for persona)
#  - cellm-plugin/cellm/hooks/hooks.json

set -euo pipefail

# Non-blocking skip paths: missing file or empty content -> exit 0 silently.
# Real failures after that (sed/awk/printf) surface via exit != 0.
# SessionStart treats non-zero as warning, does not block the session.

persona_file="${CLAUDE_PLUGIN_ROOT:-${CLAUDE_PLUGIN_DIR:-}}/CELLM-PERSONA.md"

[[ -f "${persona_file}" ]] || exit 0

content=$(cat "${persona_file}")
[[ -z "${content}" ]] && exit 0

# Sanitize for JSON: escape backslashes, quotes, then convert newlines to literal \n
escaped=$(printf '%s' "${content}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN{ORS="\\n"} {print}')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "${escaped}"

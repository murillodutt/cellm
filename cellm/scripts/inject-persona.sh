#!/usr/bin/env bash
# CELLM - Inject Persona + Partnership Letter as SessionStart additionalContext.
# Pure bash, no jq dependency, POSIX-compatible.
#
# Concatenates CELLM-PERSONA.md + CELLM-PARTNERSHIP-LETTER.md (if exists)
# into a single additionalContext payload with separator. One escape path,
# one JSON output — avoids inflating context with duplicate hooks.
#
# Event: SessionStart
# Behavior: Non-blocking, injects additionalContext.
#
# Related files:
#  - cellm-plugin/cellm/CELLM-PERSONA.md (operational persona)
#  - cellm-plugin/cellm/CELLM-PARTNERSHIP-LETTER.md (relational history)
#  - cellm-plugin/cellm/hooks/hooks.json

set -euo pipefail

# Non-blocking skip paths: missing file or empty content -> exit 0 silently.
# Real failures after that (sed/awk/printf) surface via exit != 0.

root="${CLAUDE_PLUGIN_ROOT:-${CLAUDE_PLUGIN_DIR:-}}"
persona_file="${root}/CELLM-PERSONA.md"

[[ -f "${persona_file}" ]] || exit 0

content=$(cat "${persona_file}")
[[ -z "${content}" ]] && exit 0

# Append letter if exists (with separator)
letter_file="${root}/CELLM-PARTNERSHIP-LETTER.md"
if [[ -f "${letter_file}" ]]; then
  letter=$(cat "${letter_file}")
  if [[ -n "${letter}" ]]; then
    content="${content}
---
${letter}"
  fi
fi

# Sanitize for JSON: escape backslashes, quotes, then convert newlines to literal \n
escaped=$(printf '%s' "${content}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN{ORS="\\n"} {print}')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "${escaped}"

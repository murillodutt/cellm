#!/usr/bin/env bash
# CELLM - Inject Persona + Partnership Letter as SessionStart additionalContext.
# Pure bash, no jq dependency, POSIX-compatible.
#
# Concatenates CELLM-PERSONA.md + CELLM-PARTNERSHIP-LETTER.md (if exists)
# into a single additionalContext payload with separator. One escape path,
# one JSON output — avoids inflating context with duplicate hooks.
#
# Event: SessionStart (delegated from scripts/inject-persona.sh shim)
# Behavior: Non-blocking, injects additionalContext.
#
# Related files:
#  - CELLM-PERSONA.md (operational persona, co-located)
#  - CELLM-PARTNERSHIP-LETTER.md (relational history, co-located)
#  - ../../scripts/inject-persona.sh (shim entry point)
#  - ../../hooks/hooks.json

set -euo pipefail

# Resolve own directory for co-located content files
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

persona_file="${script_dir}/CELLM-PERSONA.md"

[[ -f "${persona_file}" ]] || exit 0

content=$(cat "${persona_file}")
[[ -z "${content}" ]] && exit 0

# Append letter if exists (with separator)
letter_file="${script_dir}/CELLM-PARTNERSHIP-LETTER.md"
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

#!/usr/bin/env bash
# CELLM - Inject Persona + startup contract as SessionStart additionalContext.
# Pure bash, no jq dependency.
#
# Concatenates CELLM-PERSONA.md + the startup contract extracted from
# CELLM-PARTNERSHIP-LETTER.md into a single additionalContext payload.
# One escape path, one JSON output — avoids inflating context with duplicate
# hooks and keeps the injected context operational.
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

# Append startup contract extracted from the letter if present (with separator)
letter_file="${script_dir}/CELLM-PARTNERSHIP-LETTER.md"
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

# Sanitize for JSON: escape backslashes, quotes, then convert newlines to literal \n
escaped=$(printf '%s' "${content}" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' | awk 'BEGIN{ORS="\\n"} {print}')

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "${escaped}"

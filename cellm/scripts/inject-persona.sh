#!/usr/bin/env bash
# CELLM - Inject Persona + Partnership Letter as SessionStart additionalContext.
# Thin shim: resolves plugin root and delegates to skills/tilly/scripts/inject-persona.sh.
#
# Event: SessionStart
# Behavior: Non-blocking, injects additionalContext.
#
# Related files:
#  - cellm-plugin/cellm/skills/tilly/scripts/inject-persona.sh (real logic)
#  - cellm-plugin/cellm/skills/tilly/docs/CELLM-PERSONA.md (operational persona)
#  - cellm-plugin/cellm/skills/tilly/docs/CELLM-PARTNERSHIP-LETTER.md (relational history)
#  - cellm-plugin/cellm/hooks/hooks.json

set -euo pipefail

root="${CLAUDE_PLUGIN_ROOT:-${CLAUDE_PLUGIN_DIR:-}}"
delegate="${root}/skills/tilly/scripts/inject-persona.sh"

[[ -x "${delegate}" ]] && exec "${delegate}" "$@"

# Graceful: if delegate missing, exit 0 (non-blocking)
exit 0

#!/usr/bin/env bash
# CELLM - Boundary Drift Check v2 — Pure bash, no jq dependency, POSIX-compatible
# Schema edits: runs boundary-auto-fix.ts (proactive patching)
# Boundary edits: runs validate-boundary.ts (detect-only)
#
# Event: PostToolUse (Write|Edit)
# Behavior: Non-blocking, injects additionalContext
#
# Related files (File Context System):
#  - oracle/scripts/boundary-auto-fix.ts
#  - oracle/scripts/validate-boundary.ts
#  - oracle/scripts/boundary-utils.ts
#  - oracle/scripts/boundary-ownership.ts
#  - boundary.yml

set -euo pipefail
cleanup() { exit 0; }
trap cleanup EXIT

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

# Extract file_path from JSON (same pattern as check-file-context.sh)
file_path=$(echo "${input}" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[[ -z "${file_path}" ]] && exit 0

# Guard: CLAUDE_PROJECT_DIR must be set (only available inside Claude Code sessions)
[[ -z "${CLAUDE_PROJECT_DIR:-}" ]] && exit 0

# Route by file type: schema edits get auto-fix, boundary edits get detect-only
case "${file_path}" in
  *schema.ts|*client.ts)
    # Schema edit → run auto-fix (proactive patching)
    output=$(cd "${CLAUDE_PROJECT_DIR}/oracle" && timeout 4 bun run scripts/boundary-auto-fix.ts 2>&1 | tail -1) || true
    ;;
  *boundary.yml)
    # Boundary edit → detect-only (don't auto-fix what the user is manually editing)
    output=$(cd "${CLAUDE_PROJECT_DIR}/oracle" && timeout 4 bun run scripts/validate-boundary.ts 2>&1 | tail -1) || true
    ;;
  *) exit 0 ;;
esac

[[ -z "${output}" ]] && exit 0

# Filter system-level shell noise that is not actionable for the user.
# Suppress only the bash-prefix forms (env-level errors), NOT generic
# substring matches — application errors like "boundary.yml not found"
# must remain visible to surface real drift.
case "${output}" in
  *": command not found"*|"bash: "*)
    exit 0
    ;;
esac

# Sanitize for JSON embedding (no jq): collapse newlines/tabs/control chars, escape quotes/backslashes, limit length
output=$(echo "${output}" | tr '\n\t\r' '   ' | sed 's/["\\]/\\&/g' | head -c 300)

printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[BOUNDARY] %s"}}\n' "${output}"

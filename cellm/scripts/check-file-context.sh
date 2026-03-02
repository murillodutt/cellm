#!/usr/bin/env bash
# CELLM - Check File Context (PreToolUse hook)
# Detects "Related files" headers in files about to be edited.
# If found, reminds the AI to read all related files before modifying.
#
# Pure local — no Oracle dependency, no network calls.
# Designed for 1s timeout: head + grep on local filesystem.
#
# Related files (File Context System):
#  - cellm-plugin/cellm/skills/file-context/SKILL.md  — passive skill teaching header format
#  - cellm-plugin/cellm/hooks/hooks.json               — hook registration (PreToolUse)

set -euo pipefail

# Fail-safe: never let errors propagate to Claude Code
cleanup() {
  exit 0
}
trap cleanup EXIT

# Read JSON from stdin
input=""
if [[ ! -t 0 ]]; then
  input=$(head -c 65536)
fi

[[ -z "${input}" ]] && exit 0

# Check jq availability — fail silently without it
command -v jq &> /dev/null || exit 0

# Extract file_path from tool_input
file_path=$(echo "${input}" | jq -r '.tool_input.file_path // ""' 2>/dev/null) || exit 0
[[ -z "${file_path}" ]] && exit 0

# Extension filter — only check files where headers are expected
case "${file_path}" in
  *.ts|*.js|*.sh|*.vue|*.yaml|*.yml) ;;
  *) exit 0 ;;
esac

# File must exist on disk (new files won't have headers)
[[ -f "${file_path}" ]] || exit 0

# Scan first 30 lines for "Related files" header
header_block=$(head -30 "${file_path}" 2>/dev/null) || exit 0
if ! echo "${header_block}" | grep -q "Related files"; then
  exit 0
fi

# Extract related file paths from the header block
# Pattern: lines starting with " *  - " or " - " followed by a path
related_files=$(echo "${header_block}" | grep -E '^\s*\*?\s*-\s+\S+' | sed -E 's/^[[:space:]]*\*?[[:space:]]*-[[:space:]]+([^[:space:]]+).*/\1/' | tr '\n' ', ' | sed 's/,$//')

if [[ -z "${related_files}" ]]; then
  exit 0
fi

# Output PreToolUse hook response with reminder
jq -n \
  --arg context "[FILE-CONTEXT] This file has Related files. Read them before continuing: ${related_files}" \
  '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      additionalContext: $context
    }
  }'

exit 0

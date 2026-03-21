#!/usr/bin/env bash
# CELLM - Check File Context v2 — Pure bash, no jq dependency, POSIX-compatible
# Detects "Related files" headers in files just edited.
#
# Event: PostToolUse (Write|Edit)
# Behavior: Non-blocking, injects additionalContext
#
# Related files (File Context System):
#  - cellm-plugin/cellm/skills/file-context/SKILL.md
#  - cellm-plugin/cellm/hooks/hooks.json

set -euo pipefail
cleanup() { exit 0; }
trap cleanup EXIT

input=""
[[ ! -t 0 ]] && input=$(head -c 65536)
[[ -z "${input}" ]] && exit 0

# Extract file_path from JSON using sed (macOS compatible)
file_path=$(echo "${input}" | sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)
[[ -z "${file_path}" ]] && exit 0

# Extension filter
case "${file_path}" in
  *.ts|*.js|*.sh|*.vue|*.yaml|*.yml) ;;
  *) exit 0 ;;
esac

[[ -f "${file_path}" ]] || exit 0

# Scan first 30 lines for "Related files" header
header_block=$(head -30 "${file_path}" 2>/dev/null) || exit 0
echo "${header_block}" | grep -q "Related files" || exit 0

# Extract related file paths and sanitize for JSON (neutralize control chars, escape quotes)
related_files=$(echo "${header_block}" | grep -E '^\s*\*?\s*-\s+\S+' | sed -E 's/^[[:space:]]*\*?[[:space:]]*-[[:space:]]+([^[:space:]]+).*/\1/' | tr '\n\t\r' ',  ' | sed 's/,$//' | sed 's/["\\]/\\&/g')
[[ -z "${related_files}" ]] && exit 0

printf '{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"[FILE-CONTEXT] This file has Related files. Read them before continuing: %s"}}\n' "${related_files}"

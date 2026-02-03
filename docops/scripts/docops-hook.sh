#!/bin/bash
# DocOps Hook - Optional drift reminder (non-blocking)

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CONFIG_PATH="${PROJECT_DIR}/.claude/docops.json"
LOG_PATH="${PROJECT_DIR}/.claude/docops-hook.log"

if [[ ! -f "${CONFIG_PATH}" ]]; then
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

hooks_enabled="$(jq -r '.hooksEnabled // false' "${CONFIG_PATH}" 2>/dev/null || echo "false")"
if [[ "${hooks_enabled}" != "true" ]]; then
  exit 0
fi

doc_root="$(jq -r '.docRoot // "docs/technical"' "${CONFIG_PATH}" 2>/dev/null || echo "docs/technical")"

if [[ ! -d "${PROJECT_DIR}/${doc_root}" ]]; then
  exit 0
fi

if git -C "${PROJECT_DIR}" status --porcelain "${doc_root}" | grep -q '.'; then
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "[${timestamp}] DocOps: docs changed under ${doc_root}. Run /docops:sync." >> "${LOG_PATH}" 2>/dev/null || true
fi

exit 0

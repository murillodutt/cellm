#!/usr/bin/env bash
# CELLM Worktree Gate shim
#
# Delegates to worktree-gate.ts (canonical TypeScript implementation).
# Claude Code hooks only accept shell entrypoints, so this shim is the
# unavoidable integration point (per CELLM shell-to-TS rule).
#
# Reads PreToolUse JSON from stdin, forwards it to bun, and passes stdout/exit
# code through unchanged so the Claude Code hook protocol is preserved.
#
# Related files:
#  - cellm-plugin/cellm/scripts/worktree-gate.ts (logic)
#  - cellm-plugin/cellm/hooks/hooks.json (registration)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TS_ENTRY="${SCRIPT_DIR}/worktree-gate.ts"

if [[ ! -f "${TS_ENTRY}" ]]; then
  # Missing implementation -> fail-open (do not block tool) so a broken
  # install never prevents the user from working. An admin reinstall fixes it.
  exit 0
fi

if ! command -v bun >/dev/null 2>&1; then
  # bun not available: fail-open. The gate only enforces when available.
  exit 0
fi

exec bun run "${TS_ENTRY}"

---
name: init
description: Interactive Oracle setup with menus and guided troubleshooting. Manages installation, status, updates, diagnostics, and uninstall of the Oracle worker daemon.
argument-hint: "[install|status|update|doctor|restart|uninstall]"
allowed-tools: Bash(curl *), Bash(bun *), Bash(npm *), Bash(brew *), Bash(apt *), Bash(jq *), Bash(lsof *), Bash(kill *), Bash(mkdir *), Bash(cat *), Bash(tail *), Bash(rm *), Read, Grep, Glob, AskUserQuestion
---

Present an **interactive menu** for Oracle worker management. Without arguments, show the main menu. With a mode argument, execute that mode directly.

## Main Menu

Present via AskUserQuestion with these options:

| Option | Action |
|--------|--------|
| **Install** | First-time setup: check deps, install from NPM, spawn worker, validate health, activate MCP, configure OTEL |
| **Status** | Show install state, worker health, DB location/size, MCP activation |
| **Update** | Check for new version, install, restart worker |
| **Doctor** | Run 7-step diagnostic: deps, installation, worker, port, database, MCP, OTEL — auto-fix issues with confirmation |
| **Restart** | Kill and respawn worker |
| **Uninstall** | Remove Oracle completely (confirm with default No) |
| **Advanced** | Sub-menu: change port, change data dir, view logs, clear cache, reset config, configure OTEL |

## Installation Flow (6 steps)

1. **Check dependencies** — Bun required, jq optional (offer install via Homebrew)
2. **Install @cellm-ai/oracle** — download from NPM
3. **Start worker daemon** — spawn on port 31415
4. **Validate health** — test `/health` endpoint
5. **Finalize** — create marker file, offer MCP activation
6. **Configure OTEL** — offer telemetry setup (requires Claude Code restart)

## Dev Mode

When `~/.cellm/cellm.json` has `CELLM_DEV_MODE: true` and `CELLM_DEV_ORACLE_PATH` set, use local Oracle source instead of NPM. Skip update flow. Fall back to NPM if path missing.

## Confirmations

**Default Yes:** MCP activation, worker start, update apply.
**Default No (destructive):** uninstall, cache clear.

Always use AskUserQuestion for confirmations — never assume.

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Dependencies missing |
| 2 | Installation failed |
| 3 | Worker spawn failed |
| 4 | Health check failed |

## NEVER

- **Skip health validation** after install or restart — always confirm worker responds
- **Uninstall without explicit confirmation** — destructive, default No
- **Modify `~/.claude/settings.json`** without telling user to restart Claude Code
- **Block on failed OTEL** — OTEL is optional, never fail the install for it
- **Assume NPM in dev mode** — check `CELLM_DEV_MODE` first

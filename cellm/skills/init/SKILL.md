---
description: Interactive Oracle setup with menus and guided troubleshooting. Manages installation, status, updates, diagnostics, and uninstall of the Oracle worker daemon.
argument-hint: "[install|status|update|doctor|restart|uninstall|boundaries]"
allowed-tools: Bash(curl *), Bash(bun *), Bash(npm *), Bash(brew *), Bash(apt *), Bash(jq *), Bash(lsof *), Bash(kill *), Bash(mkdir *), Bash(cat *), Bash(tail *), Bash(rm *), Read, Grep, Glob, AskUserQuestion
---

Without arguments, present interactive menu via AskUserQuestion. With argument, execute directly.

## Menu

| Option | Action |
|--------|--------|
| Install | Check deps → install from NPM → spawn worker → validate health → activate MCP → configure OTEL |
| Status | Install state, worker health, DB location/size, MCP activation |
| Update | Check version → install → restart |
| Doctor | 7-step diagnostic (deps, install, worker, port, DB, MCP, OTEL) — auto-fix with confirmation |
| Restart | Kill and respawn worker |
| Uninstall | Remove Oracle (confirm with default No) |
| Boundaries | Scan project, generate boundary.yml for dependency enforcement |
| Advanced | Port, data dir, logs, cache, config, OTEL |

## Install Flow

1. Check deps (Bun required, jq optional)
2. Install `@cellm-ai/oracle` from NPM
3. Spawn worker on port 31415
4. Validate `/health` endpoint
5. Create marker, offer MCP activation
6. Offer OTEL setup (requires Claude Code restart)

## Boundaries Flow

1. Check if `boundary.yml` exists — skip if present
2. Run `bootstrap-boundaries.sh` via Bash (stdin: `{"cwd":"<project_root>"}`)
3. Read generated `boundary.yml`, show to user
4. AskUserQuestion: keep as-is, customize, or cancel
5. If customize: open in editor via Read + Edit
6. Validate against `schemas/boundary.schema.json` if available

## Dev Mode

`~/.cellm/cellm.json` with `CELLM_DEV_MODE: true` + `CELLM_DEV_ORACLE_PATH` → use local source, skip updates. Fall back to NPM if path missing.

## Confirmations

Default Yes: MCP activation, worker start, update. Default No: uninstall, cache clear.

## NEVER

- **Skip health validation** after install/restart
- **Uninstall without explicit confirmation** — default No
- **Modify `~/.claude/settings.json`** without telling user to restart
- **Block on failed OTEL** — optional, never fail install for it
- **Assume NPM in dev mode** — check `CELLM_DEV_MODE` first

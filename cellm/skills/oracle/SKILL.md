---
description: "CELLM Oracle Worker setup — interactive menus for install, status, update, diagnostics, MCP control, and uninstall of the Oracle daemon at ~/.cellm/. Use when: 'setup oracle', 'oracle setup', 'oracle not working', 'check worker', 'reinstall oracle', 'mcp tools', 'reload mcp', 'enable mcp', 'disable mcp'. Not for documentation init (use docops:init)."
cellm_scope: universal
user-invocable: true
argument-hint: "[install|status|update|doctor|restart|uninstall|boundaries|mcp]"
allowed-tools: Bash(curl *), Bash(bun *), Bash(npm *), Bash(brew *), Bash(apt *), Bash(jq *), Bash(lsof *), Bash(kill *), Bash(mkdir *), Bash(cat *), Bash(tail *), Bash(rm *), Bash(pkill *), Bash(pgrep *), Bash(ps *), Bash(claude *), Read, Grep, Glob, AskUserQuestion
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
| MCP | View tools, reload, check, enable, disable (submenu) |
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
2. Use `boundary_check` MCP tool to bootstrap boundaries for the project
3. Read generated `boundary.yml`, show to user
4. AskUserQuestion: keep as-is, customize, or cancel
5. If customize: open in editor via Read + Edit
6. Validate against `schemas/boundary.schema.json` if available

## MCP Flow

Submenu via `AskUserQuestion` with 5 options:

| Option | Action |
|--------|--------|
| View tools | `claude mcp list` + count deferred `mcp__plugin_cellm_cellm-oracle__*` tools in session — report tool names, count, connection status |
| Reload | Kill all `mcp-server.ts` orphan processes via `pkill -f "bun run.*oracle/scripts/mcp-server.ts"`; prompt user to restart Claude Code session (MCP stdio does not hot-reload — see `ANTI-STALEMCPSTDIOPROCESS`) |
| Check | Full handshake diagnostic: plugin install state, `.mcp.json` (project + global + plugin template), process count, Worker `/health`, Worker `/api/patterns` count, expected vs actual tool list. Report drift if any |
| Enable | Add `cellm-oracle` to project `.mcp.json` OR confirm plugin is active (`claude mcp list` shows `plugin:cellm:cellm-oracle ✓`). Warn if already enabled |
| Disable | Remove `cellm-oracle` from project `.mcp.json` OR offer to uninstall plugin (plugin command). Confirm destructive with default No |

### View tools contract

Output format:
```
[i] plugin:cellm:cellm-oracle status: <Connected|Needs auth|Disconnected>
[i] Stdio processes: <N> (pids: ...) — <fresh|stale>
[i] Exposed tools: <count> matching mcp__plugin_cellm_cellm-oracle__*
[i] Worker HTTP: <up|down> (http://127.0.0.1:31415/health)
[i] Registry size (Worker): <N> tools via /api/patterns
```

### Reload contract

1. List orphan pids: `pgrep -f "bun run.*oracle/scripts/mcp-server.ts"`
2. Report count + ages. If >1, warn about stale instances.
3. `AskUserQuestion` confirm kill (default Yes).
4. `pkill -f "bun run.*oracle/scripts/mcp-server.ts"` — kills all.
5. Instruct user: restart Claude Code session to spawn fresh MCP.
6. Never auto-restart Claude Code — session restart is user action.

### Check contract

Full handshake diagnostic must not raise false confidence:
- `claude mcp list` "Connected" is necessary but NOT sufficient.
- Must verify actual tool exposure matches Worker registry.
- Drift detected → recommend Reload + session restart.

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
- **Auto-restart Claude Code** — session restart is always the user's action
- **Report MCP "connected" without verifying tool exposure** — handshake ok != tools anunciadas
- **Kill only one `mcp-server.ts` pid** — orphans accumulate; kill all or none
- **Disable MCP without confirming** — default No, this breaks downstream skills depending on Oracle tools

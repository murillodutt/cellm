# Post-release Smoke — QT plugin install validation (formerly M7)

> **Scope clarification (2026-04):** this protocol is a **post-release** human
> validation gate. It runs AFTER the plugin is published and installed on a
> fresh Claude Code session as an end user would. It is NOT a dev-time gate
> and does NOT block pre-publish internal convergence.

Environment: macOS, Linux, or Windows with Bun ≥ 1.2 or Node ≥ 20. Requires `qt` binary on PATH (or `bunx @quantize-io/cli`).

## Steps

1. Enable the plugin in Claude Code:
   - Via UI: open `/plugin`, select marketplace `cellm`, enable `quantize-io`.
   - Via settings: add `"quantize-io@cellm": true` to `~/.claude/settings.json`
     under `enabledPlugins`, then restart the host.
   - Note: marketplace source is `./quantize-io` (plugin root); the root
     `.claude-plugin/plugin.json` declares all hooks and the statusline.
2. Start a new Claude Code session. Expected:
   - Statusline shows `[QT]` in orange (ANSI `38;5;172`).
   - `SessionStart` hook emits a block containing
     `quantize-io MODE ACTIVE — level: full` to the model context.
3. Trigger mode change. Expected:
   - The string `/qt ultra` is NOT a registered Claude Code slash command.
     It is parsed by the `UserPromptSubmit` hook (`track`). If Claude Code
     intercepts `/qt` as "Unknown command" before the hook runs, send the
     text without the leading slash (`qt ultra`) or as plain prompt text.
   - After the hook fires: `~/.quantize/active-mode` contains `ultra`.
   - Statusline re-renders as `[QT:ULTRA]`.
   - Follow-up task: register formal `commands/qt.md` so `/qt` works natively.
4. Disable mode. Expected:
   - After `qt off` (or `/qt off` when slash-command registration lands):
     `~/.quantize/active-mode` is deleted.
   - Statusline renders nothing.
5. Run `qt uninstall --dry-run` and confirm the reported diff matches expectations.
   Then run `qt uninstall` without the flag. Expected:
   - `~/.claude/settings.json` loses any `hooks[*].hooks[*].command` containing
     `quantize-io` or `compress-llm`.
   - `~/.quantize/` is removed.

## Verifications

| Check | Pass criterion |
|-------|----------------|
| Hook latency | Each hook returns in <5s (host enforces timeout). |
| Statusline safety | Statusline never renders content from a symlinked flag file. |
| Mode persistence | Mode survives session restart (flag file remains). |
| Reset | `qt uninstall` leaves zero Quantize-IO traces on the host. |
| MCP tool catalog | `quantize_compress` appears in Claude Code MCP tool list (provided by Oracle). |

## Known gotchas

- `/qt` is NOT a native Claude Code slash command. The current design relies on
  `UserPromptSubmit` hook interception. Claude Code may reject `/qt` as
  "Unknown command" before the hook runs. Registering formal slash commands
  in `commands/` directory is tracked as follow-up.
- If `bunx` cache is stale, the hook silently fails. Run `bun pm cache rm` and retry.
- On Windows, `readlinkSync` and `O_NOFOLLOW` are no-ops at the node level; the
  statusline and flag paths fall back to existence check only. Documented as a
  known caveat; does not compromise correctness for the intended threat model.

## Dev-time technical smoke (separate from this protocol)

Internal runtime validation (workspace, no install) is covered by:

- `bun run test --project quantize-io` (76 tests)
- `bun run scripts/quantize-release.ts` (parity gate + dry-run publish)
- Direct MCP handler invocation via
  `loadAllTools().find(t => t.name === 'quantize_compress').handler(...)`

These dev-time checks do NOT substitute the post-release smoke above.

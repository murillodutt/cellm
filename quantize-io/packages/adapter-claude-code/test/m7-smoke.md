# M7 Smoke Test — manual protocol

Environment: macOS, Linux, or Windows with Bun ≥ 1.2 or Node ≥ 20. Requires `qt` binary on PATH (or `bunx @quantize-io/cli`).

## Steps

1. Install the adapter into Claude Code:
   ```bash
   claude plugin install @quantize-io/adapter-claude-code
   ```
2. Start a new Claude Code session. Expected:
   - Statusline shows `[QT]` in orange (ANSI `38;5;172`).
   - `SessionStart` hook emits a block containing `quantize-io MODE ACTIVE — level: full` to the model context.
3. Type `/qt ultra`. Expected:
   - Flag file at `~/.quantize/active-mode` now contains `ultra`.
   - Statusline re-renders as `[QT:ULTRA]`.
4. Type `/qt off`. Expected:
   - `~/.quantize/active-mode` is deleted.
   - Statusline renders nothing.
5. Run `qt uninstall --dry-run` and confirm the reported diff matches expectations. Then run `qt uninstall` without the flag. Expected:
   - `~/.claude/settings.json` loses any `hooks[*].hooks[*].command` containing `quantize-io` or `compress-llm`.
   - `~/.quantize/` is removed.

## Verifications

| Check | Pass criterion |
|-------|----------------|
| Hook latency | Each hook returns in <5s (host enforces timeout). |
| Statusline safety | Statusline never renders content from a symlinked flag file. |
| Mode persistence | Mode survives session restart (flag file remains). |
| Reset | `qt uninstall` leaves zero Quantize-IO traces on the host. |

## Known gotchas

- If `bunx` cache is stale, the hook silently fails. Run `bun pm cache rm` and retry.
- On Windows, `readlinkSync` and `O_NOFOLLOW` are no-ops at the node level; the statusline and flag paths fall back to existence check only. Documented as a known caveat; does not compromise correctness for the intended threat model.

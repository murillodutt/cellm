# @quantize-io/adapter-claude-code

Install Quantize-IO hooks into Claude Code.

## Install

```bash
claude plugin install @quantize-io/adapter-claude-code
```

## What it installs

| Hook | Command | Timeout |
|------|---------|---------|
| `SessionStart` | `bunx @quantize-io/hooks activate` | 5s |
| `UserPromptSubmit` | `bunx @quantize-io/hooks track` | 5s |
| `statusLine` | `bunx @quantize-io/hooks statusline` | — |

Writes the flag file at `~/.quantize/active-mode`. Reads `rules.md` at runtime from `@quantize-io/core`.

## Controls inside a session

| Action | Command |
|--------|---------|
| Switch mode | `/qt lite` · `/qt full` · `/qt ultra` · `/qt wenyan-full` |
| Stop | `/qt off` — or say `stop quantize-io` / `normal mode` |
| Check status | `qt status` |

## Uninstall

```bash
qt uninstall
```

Strips quantize-io hook entries from `~/.claude/settings.json` and removes `~/.quantize/`.

## Conflict with compress-llm

`qt uninstall` also strips any leftover `compress-llm` hook entries by command substring. If you had the upstream `compress-llm` plugin installed, uninstall it first using its own process before installing this adapter.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| No statusline badge | Confirm `settings.json` has the `statusLine` block; run `qt mode full` manually. |
| Hooks never fire | `which bunx`; install Bun (https://bun.com). |
| Compression refuses | File is in denylist (credentials/secrets/keys). Rename or pick another file. |
| API errors | Set `ANTHROPIC_API_KEY`; otherwise the pipeline falls back to `claude --print` CLI. |

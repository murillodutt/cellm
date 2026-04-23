# Install

## Requirements

| Runtime | Version |
|---------|---------|
| Bun | >= 1.2 (primary) |
| Node | >= 20 (fallback) |
| Claude / Codex | any current host that loads `.claude-plugin` or `.codex-plugin` |

## Claude Code

```bash
claude plugin install @quantize-io/adapter-claude-code
```

This registers `SessionStart`, `UserPromptSubmit`, and the `statusLine` command. No further configuration is needed.

## Codex

Install `@quantize-io/adapter-codex` through your Codex plugin manager, then reload Codex.

## CLI (standalone)

```bash
bun add -g @quantize-io/cli
qt status
```

## Environment

| Var | Default | Notes |
|-----|---------|-------|
| `QT_DEFAULT_MODE` | `full` | One of `VALID_MODES`. |
| `QT_MODEL` | `claude-sonnet-4-5` | Anthropic model name. |
| `QT_DAEMON_URL` | unset | Forces the MCP adapter to call the daemon at this URL. |
| `QT_MAX_FILE_BYTES` | `500000` | Hard cap for the compress pipeline. |
| `ANTHROPIC_API_KEY` | unset | Enables the SDK path. When absent, the pipeline falls back to `claude --print`. |

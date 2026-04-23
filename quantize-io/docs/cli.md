# CLI

```bash
qt <subcommand> [args] [flags]
```

## Subcommands

| Command | Purpose | Output |
|---------|---------|--------|
| `qt compress <path> [--mode <m>] [--human]` | Compress a single file in place; writes backup `<stem>.original.md`. | JSON (or one-line summary with `--human`). |
| `qt benchmark <dir> [--json]` | Count tokens for every `*.original.md` / `*.md` pair in the directory. | Markdown table (default) or JSON. |
| `qt status [--json]` | Show mode, daemon presence, version, paths. | JSON by default. |
| `qt mode <level>` | Set or clear the active response mode (flag file). | JSON ack. |
| `qt rules [--level <m>]` | Print the bundled `rules.md` filtered by level. | Plain text. |
| `qt uninstall [--dry-run]` | Strip hook entries in `~/.claude/settings.json`; purge `~/.quantize/`. | JSON summary. |

## Exit codes

| Code | Meaning |
|------|---------|
| 0 | Success. |
| 1 | Input error (invalid mode, unreadable file, etc.). |
| 2 | Compression rolled back after retry exhaustion. |

## JSON contract for `qt compress`

```json
{
  "ok": true,
  "path": "/abs/path.md",
  "hash": "<sha256>",
  "mode": "full",
  "original_bytes": 12345,
  "compressed_bytes": 8000,
  "saved_pct": 35.19,
  "cache_hit": false,
  "retries": 0,
  "rolled_back": false,
  "reason": null
}
```

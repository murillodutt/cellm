# @quantize-io/hooks — Changelog

## [0.1.0] — 2026-04-23

- `activate` — SessionStart hook. Writes flag + emits filtered rules.
- `track` — UserPromptSubmit hook. Detects slash + NL triggers + deactivation.
- `statusline` — renders `[QT]` / `[QT:UPPER]` with ANSI orange; empty when off.
- Respects `QT_DEFAULT_MODE` env and mode whitelist.

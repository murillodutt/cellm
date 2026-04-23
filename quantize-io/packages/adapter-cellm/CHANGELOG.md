# @quantize-io/adapter-cellm — Changelog

## [0.1.0] — 2026-04-23

- `createQuantizeTool()` factory exposing `quantize_compress` MCP tool (Zod schema).
- Prefers daemon via `QT_DAEMON_URL` / presence file; falls back to `qt` CLI spawn.
- TimelineEmitter injection pattern; never writes `~/.quantize/` itself.
- Structured error when QT is absent with install hint.

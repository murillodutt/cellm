# @quantize-io/core — Changelog

## [0.1.0] — 2026-04-23

- detect / validate / sensitive / safe-io ported 1:1 from upstream Python.
- compress 12-step flow with atomic rollback and surgical fix loop (MAX_RETRIES=2).
- Anthropic SDK dual-path with `claude --print` fallback.
- Cache via unstorage fs driver at `~/.quantize/cache/`.
- Rules loader (`filterRulesByMode`) sourced from bundled `rules.md`.

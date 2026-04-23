# @quantize-io/daemon — Changelog

## [0.1.0] — 2026-04-23

- H3 standalone daemon (opt-in) with routes `/health`, `/rules`, `/compress`, `/metrics`.
- Port picker across 31500–31599.
- Presence + daemon JSON files at `~/.quantize/`.
- In-memory metrics: cache_hit_ratio, bytes_in/out, request_count, uptime.

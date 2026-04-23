# Daemon (opt-in)

Start the local daemon to share the compression cache across processes or to enable the CELLM MCP adapter.

```bash
bunx @quantize-io/daemon start
```

The daemon selects a free port in `31500–31599` and writes:

- `~/.quantize/daemon.json` — `{ pid, url, started_at }`.
- `~/.quantize/presence.json` — `{ version, daemon_url, pid, modes, started_at, capabilities }`.

## Routes

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | `{ status: "ok", version, uptime_ms }` — target <50ms. |
| `GET` | `/rules?level=<mode>` | Filtered rules body. Returns 400 for invalid levels. |
| `GET` | `/metrics` | Request count, bytes in/out, cache hits, `cache_hit_ratio`, uptime, `started_at`. In-memory only (reset on restart). Persistence tracked as follow-up (SPEC §12). |
| `POST` | `/compress` | Body `{ path, mode? }` validated by Zod. Returns the same JSON as `qt compress`. |

## Port range

Reserved range: `31500–31599`. Must not collide with the Oracle Worker range `31415–31499`.

## Lifecycle

The daemon is opt-in. The Quantize-IO pipeline runs fully standalone via CLI when the daemon is absent.

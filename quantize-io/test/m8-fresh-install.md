# M8 Fresh-install verification

This is a manual verification script run once per release tag. It is intentionally not executed in CI — npm publish is a privileged action.

## Preconditions

- Docker available on the host.
- `@quantize-io/*` published at `0.1.0` (or staged via a registry mirror).
- `ANTHROPIC_API_KEY` exported locally for the smoke test.

## Steps

```bash
docker run --rm -it \
  -e ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY" \
  oven/bun:1.3.3 bash -lc '
    set -euo pipefail
    bun add -g @quantize-io/cli
    mkdir -p /work && cd /work
    cat > doc.md <<"MD"
    # Guide

    See https://example.com for more.

    \`\`\`
    const x = 1;
    \`\`\`

    Bullet A with prose.
    MD
    qt compress doc.md
    qt benchmark . --json
  '
```

## Expected

| Check | Criterion |
|-------|-----------|
| Install | `bun add -g @quantize-io/cli` exits 0, registers `qt` in PATH. |
| Compress | `qt compress` emits JSON with `ok: true`. |
| Benchmark | `qt benchmark . --json` reports a non-zero `saved_pct`. |
| Rollback | No `doc.md.quantize.tmp.*` left after the run. |

## Rollout record

Paste the JSON outputs into the release GitHub issue tagged `release/quantize-io-v0.1.0`.

# Quantize-IO (QT) — user documentation

> 5th plugin of the CELLM family. Token I/O quantization for LLM hosts
> (Claude Code, Codex, and beyond).

```text
 sentido da marcha ───▶
 ┌──────────┐   ┌─────┐   ┌────────┬────────┬────────┬──────────┐
 │   LLM    │───│ QT  │───│ cellm  │ docops │  gdu   │  stitch  │
 │ locomo-  │   │ 5º  │   │        │        │        │          │
 │  tiva    │   │plug │   │  vagões de alimentação (família)    │
 └──────────┘   └─────┘   └────────┴────────┴────────┴──────────┘
    motor,      vagão de       specs · docs · UI · design bridge
   propulsão   quantização
   (modelo +    (tokens
    host)      in/out)
```

## Pages

| Topic | Doc |
|-------|-----|
| Install | [install.md](./install.md) |
| CLI reference | [cli.md](./cli.md) |
| Hooks | [hooks.md](./hooks.md) |
| Optional daemon | [daemon.md](./daemon.md) |
| CELLM MCP adapter | [adapter-cellm.md](./adapter-cellm.md) |

## Independence contract

- Zero runtime dependency on `~/.cellm/`.
- Zero cross-plugin import with `cellm`, `docops`, `gdu`, `stitch`.
- Connection to the CELLM family happens only at runtime via HTTP or CLI.

## Source of truth

- Product spec: `docs/technical/specs/quantize-io.md` (root of the repo).
- Consolidation rationale (2026-04): `docs/technical/specs/SPEC-QT-ORACLE-CONSOLIDATION.md`.
- Upstream reference: `tmp/compress-llm-main/plugins/compress-llm`.
- Runtime location: `oracle/packages/quantize-io-*/`.
- Version source: `oracle/VERSION` (single source consumed by core/cli/daemon/release).

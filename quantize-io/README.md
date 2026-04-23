# Quantize-IO (QT)

> 5th plugin of the CELLM family. Token I/O quantization for LLM hosts (Claude Code, Codex, and beyond).

## Status

M0 — Scaffold.

## Layout

```
cellm-plugin/quantize-io/
  package.json              # Bun workspaces root
  tsconfig.json             # TS 5 strict baseline
  vitest.config.ts
  packages/
    core/                   # detect, validate, compress, sensitive, safe-io, rules, cache
    cli/                    # qt binary (citty)
    hooks/                  # SessionStart + UserPromptSubmit + statusline
    daemon/                 # opt-in Nitro daemon (ports 31500-31599)
    adapter-claude-code/    # .claude-plugin manifest
    adapter-codex/          # .codex-plugin manifest
    adapter-cellm/          # Oracle MCP tool quantize_compress
```

## Independence contract

- Zero runtime dependency on `~/.cellm/`.
- Zero cross-plugin import with `cellm`, `docops`, `gdu`, `stitch`.
- Connection to the CELLM family happens exclusively via HTTP or CLI.

See `docs/technical/specs/quantize-io.md` for the full specification.

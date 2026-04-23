# Quantize-IO (QT)

> 5th plugin of the CELLM family. Token I/O quantization for LLM hosts (Claude Code, Codex, and beyond).

## Plugin scope

This directory ships only what Claude Code and Codex consume at session time:

```
cellm-plugin/quantize-io/
  README.md
  CHANGELOG.md
  packages/
    adapter-claude-code/     # .claude-plugin manifest + bundles/hooks.js (zero-install)
    adapter-codex/           # .codex-plugin manifest
```

No TypeScript source, no `package.json`, no `node_modules`, no `bun.lock`.
The marketplace entry points to `./quantize-io/packages/adapter-claude-code`
and that subpath is the full footprint host users install.

## Runtime location

The QT runtime lives inside CELLM Oracle:

```
oracle/packages/
  quantize-io-core/            # detect, validate, compress, sensitive, safe-io, rules, cache
  quantize-io-cli/             # qt binary (citty)
  quantize-io-hooks/           # SessionStart + UserPromptSubmit + statusline (bundled into adapter)
  quantize-io-daemon/          # opt-in H3 daemon (ports 31500-31599)
  quantize-io-adapter-cellm/   # MCP tool factory createQuantizeTool
oracle/scripts/
  quantize-build-bundle.ts     # rebuilds bundles/hooks.js from hooks package
  quantize-embed-rules.ts      # emits rules.embedded.ts + version.ts
  quantize-release.ts          # release orchestrator reading oracle/VERSION
```

## Independence contract

- Zero runtime dependency on `~/.cellm/`. QT writes to `~/.quantize/` only.
- Zero cross-plugin import with `cellm`, `docops`, `gdu`, `stitch`.
- Connection to the CELLM family happens exclusively via HTTP (daemon) or CLI (`qt`).

## Version source of truth

`oracle/VERSION` is the single source consumed by core, cli, daemon, release
orchestrator, and marketplace entry. `quantize-embed-rules.ts` regenerates
`version.ts` from it; no hardcoded versions remain in source.

## Specification

See `docs/technical/specs/quantize-io.md` for the full specification and
`docs/technical/specs/SPEC-QT-ORACLE-CONSOLIDATION.md` for the consolidation
rationale.

# Changelog — Quantize-IO

All notable changes to the Quantize-IO monorepo are tracked in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). SemVer for every package in `packages/*`.

## [0.1.0] — 2026-04-23

Initial release as the 5th plugin of the CELLM family. Reescrita TS/Bun/Nitro do upstream Python `compress-llm` com paridade linha-a-linha.

### Added

- `@quantize-io/core@0.1.0` — detect, validate, sensitive, safe-io, rules, cache, compress flow (12 passos), Anthropic SDK + CLI dual-path, MAX_RETRIES=2 com rollback atômico.
- `@quantize-io/cli@0.1.0` — `qt compress|benchmark|status|mode|rules|uninstall` via citty. JSON-first UX. Cold start verificado em Bun.
- `@quantize-io/hooks@0.1.0` — `activate` (SessionStart), `track` (UserPromptSubmit), `statusline` (Claude Code). Whitelist de modos + symlink-safe I/O.
- `@quantize-io/daemon@0.1.0` — H3 standalone daemon opt-in; rotas `/compress` `/health` `/rules` `/metrics`. Port picker 31500–31599. Presence file em `~/.quantize/presence.json`.
- `@quantize-io/adapter-claude-code@0.1.0` — plugin manifest + README.
- `@quantize-io/adapter-codex@0.1.0` — plugin manifest (sem bug de asset do upstream).
- `@quantize-io/adapter-cellm@0.1.0` — MCP tool factory `createQuantizeTool` com TimelineEmitter injection; zero import de `@quantize-io/core`.
- Fixtures de regressão copiadas do upstream em `packages/core/test/fixtures/`.
- CI GitHub Actions em `.github/workflows/quantize-io.yml` (typecheck + vitest).

### Invariants

- Zero dependência runtime de `~/.cellm/`.
- Zero import cross-plugin entre adapters e a família CELLM.
- Envs `QT_*` sem hífens (corrige P3 upstream).
- Range de porta 31500–31599 (não colide com Oracle 31415–31499).
- Rollback restaura original e remove backup em falha final.

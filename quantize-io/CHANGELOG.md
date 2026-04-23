# Changelog — Quantize-IO

All notable changes to Quantize-IO (QT) are tracked in this file.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). SemVer aligned to the CELLM family cadence (`oracle/VERSION` is the single source of truth).

## [0.36.66] — 2026-04-23

Runtime consolidated inside CELLM Oracle; plugin directory now ships only host-consumable surfaces.

### Changed

- Runtime packages (`core`, `cli`, `daemon`, `hooks`, `adapter-cellm`) moved from
  `cellm-plugin/quantize-io/packages/*` to `oracle/packages/quantize-io-*/`.
- Build scripts moved to `oracle/scripts/quantize-{build-bundle,embed-rules,release}.ts`.
- `cellm-plugin/quantize-io/` now contains only adapters (`adapter-claude-code`,
  `adapter-codex`), bundled `hooks.js`, docs, README and CHANGELOG.
- Version chain consolidated to `oracle/VERSION` (D6.1-D6.6).
  `quantize-embed-rules.ts` emits `version.ts` consumed by core/cli/daemon.

### Fixed

- F1: `qt compress` wraps I/O in try/catch and emits structured JSON errors
  instead of raw stacktraces.
- F2: `qt daemon start` subcommand now exists (delegates to `@quantize-io/daemon`);
  adapter hint consistent with real CLI surface.
- F3: `AbortSignal` threaded through daemon `fetch` so timeouts actually abort.
- F4: daemon→CLI fallback on transport failures (connectivity / timeout / 5xx / parse).
  Functional 4xx responses are not retried. Both-fail path emits consolidated
  `Primary: … Secondary: …` error without raw stacktrace.
- F5: vitest globs scoped to `src/` and `test/`, excluding `dist/**` to prevent
  duplicate test runs of compiled output.

### Follow-ups (tracked for future releases)

- `qt daemon stop` / `qt daemon status` subcommands.
- Codex adapter zero-install bundle.
- Daemon metrics persistence (currently in-memory).

## [0.1.0] — 2026-04-23 (historical baseline)

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

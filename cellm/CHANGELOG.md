# Changelog

All notable changes to CELLM Oracle will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.5] - 2026-01-27

### Rollback
- Revertido para v2.0.5 como versão canônica estável
- v2.4.0 e v3.0.0 eram branches experimentais descontinuados
- Estabelecida v2.0.5 como base para desenvolvimento futuro

### Changed
- Reestruturação completa do repositório para arquitetura aninhada
- Plugin movido para subdiretório `cellm/` para melhor organização
- Scripts integrados dentro do plugin (`cellm/scripts/`)
- Documentação organizada em 3 camadas (desenvolvimento, plugin, projeto)

## [2.4.0] - 2026-01-23 [DESCONTINUADO]

### Added
- **Phase 1: Memory Pipeline Visual**
  - ASCII icons for context injection (`[BUG]`, `[FEAT]`, `[DISC]`, etc.)
  - `<oracle-context>` wrapper tags for context output
  - Token economics display (Read/Work costs)

- **Phase 2: Timeline Enhancement**
  - Timeline API filters (types, dateFrom, dateTo, project)
  - TimelineFilters component with USelectMenu
  - ActivityTimeline with UModal/UDrawer for detail views
  - Virtualized scrolling with UScrollArea
  - Staggered entrance animations
  - Token economics in timeline cards

- **Phase 3: Auto-Start Robusto**
  - Lock file mechanism to prevent race conditions
  - Retry logic (3 attempts) before spawning
  - Structured JSON logging
  - Auto-recovery watchdog script
  - Health check with `--json`, `--readiness`, `--verbose` options
  - Log rotation script

- **Phase 4: Marketplace Foundation**
  - Plugin manifest specification (manifest.yaml)
  - JSON Schema for manifest validation
  - /sk-plugin-install skill documentation
  - Track tool use hook
  - Dependency check script

### Changed
- Improved spawn-worker.sh with dynamic path resolution
- Timeline API now returns `availableTypes` for filter options
- Context generator uses ASCII icons per icon-substitution.md

### Fixed
- Race conditions in worker spawning
- Stale process cleanup on spawn

## [2.3.0] - 2026-01-22

### Added
- Dashboard pages: observations, timeline, pulse, memory
- MCP stdio server for Claude Code integration
- Worker daemon with HTTP API

## [2.2.0] - 2026-01-21

### Added
- Semantic search with multilingual-e5-base embeddings
- Vector storage with sqlite-vec extension
- Session summary capture

## [2.1.0] - 2026-01-20

### Added
- Initial Oracle plugin structure
- Basic hooks for SessionStart and Stop
- SQLite database with observations table

## [2.0.0] - 2026-01-19

### Changed
- Complete rewrite as standalone plugin
- Separated from claude-mem dependency

## [1.0.0] - 2026-01-15

### Added
- Initial release based on claude-mem integration

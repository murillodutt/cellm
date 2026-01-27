# Changelog

All notable changes to CELLM Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.6] - 2026-01-27

### Added
- `/cellm-init` command for assisted Oracle installation/update/repair
- `init-oracle.sh` script with visual progress indicators (5 steps)
- `check-worker-health.sh` fast health check (2s timeout)
- Lazy loading for all framework skills via `paths:` field
- `argument-hint` to oracle-search skill for better UX

### Changed
- **SessionStart timeout**: 21s → 8s (62% faster)
- **Skills loading**: Always-loaded → Path-triggered (85% token reduction)
- **Oracle installation**: Automatic → Assisted (user-initiated)
- SessionStart hook now uses `check-worker-health.sh` instead of `spawn-worker.sh`
- Removed redundant `spawn-worker.sh` call from UserPromptSubmit hook
- `.mcp.json` renamed to `.mcp.json.example` (MCP activation now explicit)

### Fixed
- oracle-search skill missing required `name:` field
- oracle-search skill missing `allowed-tools` declaration
- Skills without `paths:` field caused unnecessary token overhead (~670 lines)
- Long SessionStart timeout blocked user experience

### Skills Path Configuration
- **sk-nuxt**: Triggers on `nuxt.config.ts`, `app.vue`, `app/**`, `server/**`, `pages/**`
- **sk-vue**: Triggers on `*.vue`, `composables/**/*.ts`
- **sk-typescript**: Triggers on `*.ts`, `*.tsx`, `types/**`
- **sk-tailwind**: Triggers on `*.vue`, `*.css`, `tailwind.config.ts`
- **sk-pinia**: Triggers on `stores/**/*.ts`, `store/**/*.ts`
- **sk-drizzle**: Triggers on `db/**`, `database/**`, `drizzle.config.ts`, `*schema*.ts`

### Installation Workflow
```bash
# Install Oracle (optional)
/cellm-init

# Activate MCP tools
cp cellm/.mcp.json.example cellm/.mcp.json

# Check status
/cellm-init status

# Update or repair
/cellm-init update
/cellm-init repair
```

## [2.0.5] - 2026-01-27

### Changed
- Repository restructure with nested plugin architecture
- Plugin moved to `cellm/` subdirectory
- Documentation organized in 3 layers

### Context
- v2.0.5 established as stable canonical version
- v2.4.0 and v3.0.0 were experimental branches (discontinued)

---

For complete version history, see [CHANGELOG-ARCHIVE.md](./CHANGELOG-ARCHIVE.md)

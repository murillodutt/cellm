# Changelog

All notable changes to CELLM will be documented in this file.

**Website**: [cellm.ai](https://cellm.ai) (coming soon)
**Repository**: [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Community source code access (`src/` directory)
- Additional framework skills
- DocOps Plugin (optional) for documentation maintenance and drift control

---

## [2.0.5] - 2026-01-27

### 🚀 What's New

**Architecture Evolution**
Migrated from bundled scripts (560KB) to 10 modular, audited shell scripts. Result: better transparency, easier debugging, and community-friendly code.

**5 New Commands**
- `/plan-product` - Product-level planning
- `/shape-spec` - Specification refinement
- `/discover-patterns` - Find patterns in your codebase
- `/inject-patterns` - Apply patterns consistently
- `/index-patterns` - Search and catalog patterns

**Oracle NPM Package**
Published `@cellm/oracle` on NPM. Semantic search and intelligent memory now available as standalone package.

**Compass Dashboard**
Visual navigation UI for workflow management and development metrics.

### 🔒 Security & Quality

- Comprehensive security audit completed
- Secret redaction expanded (12+ providers: Anthropic, Stripe, OpenAI, GitHub, etc.)
- JSON validation with jq across all scripts
- Proper error handling and cleanup traps
- Full audit trail and logging

### 🐛 Fixes

- JSON parsing errors in spawn-worker.sh
- Prompt escaping issues in capture-prompt.sh
- Buffer overflow risks in log-rotate.sh
- Race conditions in health-check.sh

### 🔧 Technical Details

- 10 shell scripts with `set -euo pipefail` error handling
- Modular architecture replacing 4 bundled files
- Synchronized with private repository security audit
- All scripts are now transparent and community-auditable

### ⚡ Migration

**No action required.** Plugin auto-updates. All functionality remains backward compatible.

**Breaking Change:** Architecture migrated to shell scripts. If you were directly importing bundled scripts, update your paths. For normal plugin usage, zero changes needed.

---

## [2.0.0] - 2026-01-23

### Changed
- **BREAKING**: Repository restructured for Claude Code plugin distribution
- Removed legacy multi-component architecture (cellm-core/, cli/, oracle/, schemas/, tests/)
- Plugin is now the primary deliverable (~680KB bundled)

### Plugin Architecture
- **Skills**: 7 framework skills (sk-nuxt, sk-vue, sk-typescript, sk-tailwind, sk-pinia, sk-drizzle, oracle-search)
- **Agents**: 4 development agents (Architect, Implementer, Reviewer, Project Manager)
- **Commands**: Plugin commands for Oracle status and operations
- **Hooks**: Event-driven Oracle worker integration
- **MCP Server**: Bundled 540KB server for semantic search and context

### Technical
- Runtime: Bun 1.0+ (required for MCP server)
- Stack: Nuxt 4.3, Vue 3.5, TypeScript 5.6, Tailwind v4, Nuxt UI 4.4
- Database: SQLite + sqlite-vec for vector search
- Embedding: Xenova/multilingual-e5-base (768 dims, 100 languages)

### Installation
```bash
claude /install-plugin murillodutt/cellm
```

---

## [1.1.0] - 2026-01-20 (Legacy)

### Added
- **CELLM Oracle**: Nuxt 4 dashboard for visual monitoring
- **MCP Integration**: Real-time validation via `@nuxtjs/mcp-toolkit`
- Session template for current context tracking

### Technical
- Stack: Nuxt 4, Vue 3, TypeScript 5.9, Tailwind 4, NuxtCharts 2

---

## [1.0.0] - 2026-01-18 (Legacy)

### Added
- First stable release for public use
- Complete CLI foundation with installation scripts
- All 68 specification files finalized

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **2.0.5** | 2026-01-27 | 🔒 Security audit, 5 new commands, Oracle NPM, Compass UI |
| 2.0.0 | 2026-01-23 | Claude Code Plugin distribution |
| 1.1.0 | 2026-01-20 | Legacy: CELLM Oracle dashboard |
| 1.0.0 | 2026-01-18 | Legacy: First stable public release |

---

## Migration Guides

### From v1.x to v2.0
The v2.0 release is a complete restructuring. Previous cellm-core/ based installations are not compatible.

Install the new plugin:
```bash
claude /install-plugin murillodutt/cellm
```

### New Installation
```bash
# Install plugin in Claude Code
claude /install-plugin murillodutt/cellm

# Or via marketplace
claude /plugin marketplace add murillodutt/cellm
claude /plugin install cellm@murillodutt-cellm
```

---

## Links

- [GitHub Repository](https://github.com/murillodutt/cellm)
- [Roadmap](./ROADMAP.md)
- [Contributing Guide](./CONTRIBUTING.md)

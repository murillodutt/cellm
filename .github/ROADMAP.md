# CELLM Roadmap

**Spec-Driven Development System for AI Agents**

---

| Metadata | Value |
|----------|-------|
| Document | ROADMAP-CELLM-002 |
| Version | 2.0.0 |
| Date | 2026-01-23 |
| Status | Current |
| Platform | Claude Code Plugin |

---

## Philosophy

**"Ship first, iterate later"** - Deploy to production, listen to users, let it mature.

This roadmap focuses on **direct value to developers**, not technical infrastructure.

**Principles:**
- Depth over breadth: optimize for Claude Code
- Token efficiency: every feature must justify its budget impact
- Developer experience: reduce friction, increase predictability
- Immediate value: small releases that deliver tangible benefits

---

## Current State

### v2.0.0 (CURRENT)

**Released:** 2026-01-23

**Major Changes:**
- Complete repository restructuring for plugin distribution
- Removed legacy multi-component architecture
- Bundled plugin (~680KB) as primary deliverable

**Plugin Components:**
- 7 Framework Skills (sk-nuxt, sk-vue, sk-typescript, sk-tailwind, sk-pinia, sk-drizzle, oracle-search)
- 4 Development Agents (Architect, Implementer, Reviewer, Project Manager)
- MCP Server for semantic search and context
- Event hooks for Oracle Worker integration

**Technical:**
- Runtime: Bun 1.0+ (required for MCP server)
- Stack: Nuxt 4.3, Vue 3.5, TypeScript 5.6, Tailwind v4, Nuxt UI 4.4
- Database: SQLite + sqlite-vec for vector search
- Embedding: Xenova/multilingual-e5-base (768 dims, 100 languages)

---

### v1.x (LEGACY)

Previous versions used a multi-component architecture:
- cellm-core/ - Spec definitions
- cli/ - TypeScript CLI
- oracle/ - Nuxt dashboard

These components have been consolidated into the bundled plugin.

---

## Future Roadmap

### v2.1.0 - Enhanced Skills

| Feature | Description |
|---------|-------------|
| Additional Skills | Prisma, tRPC, Zod patterns |
| Skill Improvements | Enhanced examples and patterns |
| Documentation | Expanded skill documentation |

### v2.2.0 - Oracle Improvements

| Feature | Description |
|---------|-------------|
| Search Enhancements | Improved semantic search accuracy |
| Context Generation | Better context optimization |
| Performance | Faster embedding generation |

### v3.0.0 - Community Source

| Feature | Description |
|---------|-------------|
| Source Code | `src/` directory for community contributions |
| Build System | Build tools for plugin development |
| Testing | Test framework for skills and agents |

---

## Compatibility

| Dependency | Minimum | Recommended |
|------------|---------|-------------|
| Bun | 1.0.0 | Latest |
| Claude Code CLI | 1.0.0 | Latest |
| Git | 2.30 | Latest |
| OS | macOS 12+, Linux, Windows 10+ | macOS 14+, Ubuntu 22.04 |

**Note:** No Node.js or npm installation required. The plugin uses Bun runtime for MCP server and bundled scripts.

---

## Out of Scope

Features considered but explicitly excluded:

| Feature | Reason |
|---------|--------|
| Multi-LLM support | Focus on Claude Code excellence |
| GUI application | CLI-first philosophy |
| Cloud sync | Privacy and simplicity |
| Real-time collaboration | Complexity vs value |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01-23 | Plugin-only distribution, bundled architecture |
| 1.1.0 | 2026-01-20 | Legacy: Oracle dashboard, MCP integration |
| 1.0.0 | 2026-01-18 | Legacy: First stable public release |

---

**Document maintained by the CELLM team**
**Website:** [cellm.ai](https://cellm.ai) (coming soon)
**Repository:** [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

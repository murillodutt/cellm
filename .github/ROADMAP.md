# CELLM Roadmap

**Spec-Driven Development for AI Agents**

---

## Current Version: 2.0.5

**Released:** 2026-01-27
**Status:** Production Ready
**Cost:** Free Forever (MIT License)

### What's Delivered

**Core Plugin**
- 7 Framework Skills (Nuxt, Vue, TypeScript, Tailwind, Pinia, Drizzle, Search)
- 4 Development Agents (Architect, Implementer, Reviewer, Project Manager)
- 10 Workflow Commands (plan, shape, implement, verify, patterns, etc.)
- 10 Audited Shell Scripts (modular architecture)

**Oracle Package**
- Published on NPM: `@cellm/oracle`
- Semantic search across codebase
- Session memory and learning
- Local-first privacy

**Compass Dashboard**
- Visual project navigation
- Real-time workflow insights
- Development velocity metrics
- Nuxt UI-powered interface

**Architecture**
- Modular shell scripts (audited for security)
- SQLite + sqlite-vec for vector search
- Xenova embeddings (768 dims, 100 languages)
- MCP server integration
- Event-driven hooks

---

## What's Next

### v2.1.0 - Enhanced Patterns
- Additional framework skills (Prisma, tRPC, Zod)
- Pattern recommendation engine
- Community pattern sharing

### v2.2.0 - Oracle Intelligence
- Improved semantic search accuracy
- Multi-project context
- Cross-repository pattern discovery

### v3.0.0 - Community Tools
- Build system for custom plugins
- Test framework for skills and agents
- Community contribution workflow

---

## Why Free?

Because great tools should be accessible to everyone. We're developers too, and we believe in giving back to the community that gave us so much.

**No catch. No premium tier. No "enterprise edition."**

Just excellent tooling, free forever, MIT licensed.

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

## Compatibility

| Dependency | Minimum | Recommended |
|------------|---------|-------------|
| Bun | 1.0.0 | Latest |
| Claude Code CLI | 1.0.0 | Latest |
| Git | 2.30 | Latest |
| OS | macOS 12+, Linux, Windows 10+ | macOS 14+, Ubuntu 22.04 |

**Note:** No Node.js or npm installation required. The plugin uses Bun runtime for MCP server and bundled scripts.

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **2.0.5** | 2026-01-27 | Security audit, Oracle NPM, Compass UI, 5 new commands |
| 2.0.0 | 2026-01-23 | Claude Code Plugin distribution |
| 1.1.0 | 2026-01-20 | Legacy: Oracle dashboard, MCP integration |
| 1.0.0 | 2026-01-18 | Legacy: First stable release |

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

**Built by developers, for developers.**

[Website](https://cellm.ai) · [GitHub](https://github.com/murillodutt/cellm) · [NPM](https://www.npmjs.com/package/@cellm/oracle)

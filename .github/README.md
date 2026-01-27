# CELLM

> **Stop repeating yourself. AI that remembers your project.**

![Image](https://github.com/user-attachments/assets/ab475e0a-27d1-44e4-886e-261b96839027)

**The Problem:** You waste 70% of every AI session re-explaining your stack, patterns, and rules.

**The Solution:** CELLM loads your project's knowledge automatically. Work with AI that already knows how you code.

**The Result:** 3-5x faster development. Consistent code. Zero repetition.

[![Install](https://img.shields.io/badge/Install-Now-blue.svg)](#quick-start)
[![Version](https://img.shields.io/badge/version-2.0.5-blue.svg)](https://github.com/murillodutt/cellm/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
[![Free](https://img.shields.io/badge/100%25-Free_Forever-brightgreen.svg)](#)

---

## What You Get

### ⚡ 3-5x Faster Development
AI already knows your stack (Nuxt 4, Vue 3, TypeScript, Tailwind). No more "use Nuxt composables" every session.

### 🎯 Consistent Quality
50+ validated patterns loaded automatically. Your code follows the same standards every time.

### 🚀 Zero Configuration
Install once. That's it. No YAML files, no complex setup. Works immediately.

### 💎 100% Free & Open Source
Professional-grade tooling. Zero cost. MIT license. Built for the dev community.

---

## How It Works (3 Steps)

```bash
# 1. Install (10 seconds)
claude /install-plugin murillodutt/cellm

# 2. Done. That's it.
# AI now knows your project.

# 3. Use it
claude "implement user authentication"
# AI follows your patterns automatically
```

**What Just Happened?**
- 7 framework skills loaded (Nuxt, Vue, TypeScript, Tailwind, Pinia, Drizzle, Search)
- 4 specialized agents ready (Architect, Implementer, Reviewer, Project Manager)
- 10 workflow commands available
- Oracle MCP server running (semantic search, context generation)
- Compass dashboard accessible (visual navigation)

---

## What's Inside

### 🧠 Oracle - NPM Package
**Semantic search and intelligent memory for your project.**

- 📦 Published on NPM: `@cellm/oracle`
- 🔍 Semantic search across your entire codebase
- 💾 Session memory that persists and learns
- 🎯 Context-aware suggestions
- ⚡ Local-first (privacy by design)

```bash
npm install @cellm/oracle
```

### 🧭 Compass Dashboard
**Visual navigation for your development workflow.**

- 📊 Real-time project insights
- 🗺️ Pattern usage tracking
- 📈 Development velocity metrics
- 🎨 Clean, intuitive UI built with Nuxt UI

Access at: `http://localhost:3000/compass` (auto-starts with plugin)

### 🎯 10 Workflow Commands
**Structured development from planning to deployment.**

| Command | Purpose |
|---------|---------|
| `/plan-product` | High-level product planning |
| `/shape-spec` | Requirements refinement |
| `/write-spec` | Specification documentation |
| `/create-tasks` | Task breakdown |
| `/implement` | Code generation |
| `/verify` | Quality gate validation |
| `/discover-patterns` | Find patterns in your code |
| `/inject-patterns` | Apply patterns consistently |
| `/index-patterns` | Search available patterns |
| `/oracle-status` | Check Oracle health |

### 🤖 4 Specialized Agents
**Like having senior devs on your team.**

- **Architect**: Technical design and system planning
- **Implementer**: Code execution following your patterns
- **Reviewer**: Quality assurance and validation
- **Project Manager**: Task orchestration and tracking

### 🎨 7 Framework Skills
**Deep expertise in your stack.**

- `sk-nuxt`: Nuxt 4 patterns (SSR, composables, routing)
- `sk-vue`: Vue 3 Composition API best practices
- `sk-typescript`: Type-safe patterns and utilities
- `sk-tailwind`: Tailwind v4 styling system
- `sk-pinia`: State management patterns
- `sk-drizzle`: Database ORM and migrations
- `oracle-search`: Semantic search integration

### 🛡️ Security & Quality
**Audited code you can trust.**

- 10 shell scripts (all audited for security)
- Secret redaction (12+ providers covered)
- JSON validation with jq
- Comprehensive error handling
- Full audit trail

---

## Free Forever. Open Source. Community-Driven.

**Why is CELLM free?**

Because great tools should be accessible to everyone. We believe in:
- 🌍 **Community over profit** - Built by devs, for devs
- 📖 **Transparency** - Open source, no black boxes
- 🤝 **Collaboration** - Better together than apart
- 🎁 **Giving back** - The community gave us so much, this is our way of contributing

**MIT License** - Use it commercially, modify it, share it. No restrictions.

**No catch. No premium tier. No "enterprise" paywall.**

Just excellent tooling for the developer community.

### How to Give Back

- ⭐ Star us on GitHub
- 🐛 Report issues and help fix bugs
- 💡 Suggest features and improvements
- 📝 Contribute code or documentation
- 💬 Help others in discussions

---

## Technical Specs

**Stack Supported:**
Nuxt 4.3+, Vue 3.5+, TypeScript 5.6+, Tailwind v4, Nuxt UI 4.4+, Pinia 3, Drizzle 0.38+

**Requirements:**
- Bun 1.0+ (runtime for MCP server)
- Claude Code CLI
- Git 2.30+
- macOS 12+, Linux, or Windows 10+

**Architecture:**
- 10 modular shell scripts (audited)
- SQLite + sqlite-vec for vector search
- Xenova/multilingual-e5-base embeddings (768 dims)
- MCP server for semantic search
- Hooks for event-driven automation

---

## Quick Start (60 seconds)

```bash
# Install the plugin
claude /install-plugin murillodutt/cellm

# Verify it's working
claude /oracle-status

# Start building
claude "create a new Nuxt component with Tailwind"
```

**That's it.** AI now knows your project.

### What to try next:
1. Run `/plan-product` to start a new feature
2. Check Compass dashboard at `http://localhost:3000/compass`
3. Explore Oracle search with `/discover-patterns`

### Need help?
- [Documentation](https://cellm.ai) (coming soon)
- [GitHub Discussions](https://github.com/murillodutt/cellm/discussions)
- [Report Issues](https://github.com/murillodutt/cellm/issues)

---

## Built By Developers, For Developers

**Dutt Yeshua Technology Ltd**

We're developers who got tired of repeating ourselves to AI. So we built this.

**Version:** 2.0.5 | **License:** MIT | **Cost:** Free Forever

[Website](https://cellm.ai) · [GitHub](https://github.com/murillodutt/cellm) · [NPM](https://www.npmjs.com/package/@cellm/oracle)

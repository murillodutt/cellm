# CELLM

![Image](https://github.com/user-attachments/assets/ab475e0a-27d1-44e4-886e-261b96839027)

> **Spec-Driven Development System for AI Agents**

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/murillodutt/cellm/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
[![Website](https://img.shields.io/badge/web-cellm.ai_(coming_soon)-blue)](https://cellm.ai)
[![Claude Code CLI](https://img.shields.io/badge/Claude_Code-CLI-191919?logo=anthropic&logoColor=white)](https://claude.ai)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.3-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)

---

## Overview

CELLM provides structured specifications that AI agents consume to understand how to work on a project. Instead of repeating instructions each session, you write specs once - rules, patterns, workflows - and the agent loads them automatically.

The result: consistent development, no amnesia, no wasted tokens, with knowledge that persists and evolves.

---

## Quick Start

Install the CELLM plugin in Claude Code:

```bash
# Navigate to your project
cd your-project

# Install the CELLM plugin
claude /install-plugin murillodutt/cellm

# Or use the marketplace
claude /plugin marketplace add murillodutt/cellm
claude /plugin install cellm@murillodutt-cellm
```

After installation, the plugin provides:
- **Framework Skills**: Nuxt, Vue, TypeScript, Tailwind, Pinia, Drizzle patterns
- **Development Agents**: Architect, Implementer, Reviewer, Project Manager
- **Oracle Integration**: MCP server for semantic search and context

---

## Features

- **Spec-Driven** - Structured specifications that AI agents interpret as instructions
- **Persistent Knowledge** - Project rules and patterns persist across sessions
- **Stack-Optimized** - Type-safe patterns for Nuxt 4, Vue 3, TypeScript, and more
- **Workflow Commands** - Structured development phases from planning to verification
- **Pattern Validation** - JSON Schema enforcement for rules and patterns
- **Specialized Agents** - Architect, Implementer, Reviewer, Project Manager

---

## Context Architecture

```
SESSION > PROJECT > PATTERNS > DOMAIN > CORE > REFERENCE
```

| Layer | Purpose |
|-------|---------|
| SESSION | Active task context and state |
| PROJECT | Project-specific rules and overrides |
| PATTERNS | Technology patterns and anti-patterns |
| DOMAIN | Domain-specific conventions |
| CORE | Fundamental rules and behaviors |
| REFERENCE | External documentation and APIs |

---

## Workflow

```
/plan-product  ->  /shape-spec  ->  /write-spec  ->  /create-tasks  ->  /implement  ->  /verify
```

Each phase uses specialized agents for planning, implementation, and review.

---

## Supported Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| ![Bun](https://img.shields.io/badge/Bun-1.0+-f9f1e1?logo=bun&logoColor=black) | Bun 1.0+ | JavaScript runtime and package manager |
| ![Nuxt](https://img.shields.io/badge/Nuxt-4.3-00DC82?logo=nuxt.js&logoColor=white) | Nuxt 4.3+ | Full-stack framework with SSR/SSG |
| ![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js&logoColor=white) | Vue 3.5+ | Composition API |
| ![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-4.4-00DC82?logo=nuxt.js&logoColor=white) | Nuxt UI 4.4+ | Component library |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white) | TypeScript 5.6+ | Type system |
| ![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss&logoColor=white) | Tailwind v4 | CSS framework |
| ![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859?logo=pinia&logoColor=black) | Pinia 3 | State management |
| ![Drizzle](https://img.shields.io/badge/Drizzle-0.38-C5F74F?logo=drizzle&logoColor=black) | Drizzle ORM | Database ORM |
| ![SQLite](https://img.shields.io/badge/SQLite-vec-003B57?logo=sqlite&logoColor=white) | SQLite + sqlite-vec | Vector database for semantic search |

---

## Plugin Components

**Skills** (Framework-specific guidance)
- `sk-nuxt`: Nuxt 4 patterns and best practices
- `sk-vue`: Vue 3 Composition API patterns
- `sk-typescript`: TypeScript type-safe patterns
- `sk-tailwind`: Tailwind CSS v4 styling
- `sk-pinia`: State management patterns
- `sk-drizzle`: Database ORM patterns
- `oracle-search`: Semantic search for project context

**Agents** (Specialized development assistants)
- Architect: System design and technical planning
- Implementer: Code execution following defined patterns
- Reviewer: Quality assurance and validation
- Project Manager: Task orchestration and tracking

**Oracle MCP Server**
- Semantic search across project files
- Context generation for AI assistants
- Session memory and history tracking

---

## Project Status

**Version:** 2.0.0
**Status:** Production ready (Claude Code Plugin)
**License:** MIT

---

## Documentation

- [Quick Start](#quick-start) - Get started in minutes
- [Contributing](./CONTRIBUTING.md) - How to contribute
- [Roadmap](./ROADMAP.md) - Future plans
- Full documentation at [cellm.ai](https://cellm.ai) (coming soon)

---

## Built By

**Dutt Yeshua Technology Ltd**

**Website:** [cellm.ai](https://cellm.ai) (coming soon)
**Repository:** [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

---

## License

MIT License - Copyright (c) 2026 Murillo Dutt / Dutt Yeshua Technology Ltd

See [LICENSE](../LICENSE) for details.

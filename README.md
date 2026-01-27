# CELLM - Context Engineering for LLM Development

<div align="center">

![Image](https://github.com/user-attachments/assets/ab475e0a-27d1-44e4-886e-261b96839027)

**Structured specs, intelligent memory, and orchestration for AI agents building software**

[![Version](https://img.shields.io/badge/version-2.0.5-blue.svg)](https://github.com/murillodutt/cellm/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Plugin-purple.svg)](https://claude.ai/code)

[Installation](.github/docs/INSTALLATION.md) • [Features](.github/docs/FEATURES.md) • [Documentation](.github/docs/INDEX.md) • [Community](.github/docs/COMMUNITY.md)

</div>

---

## What is CELLM?

CELLM is a **Claude Code plugin** that transforms AI-assisted development by providing:

- **📋 Structured Specifications** - Rules, patterns, and conventions AI agents follow
- **🧠 Intelligent Memory** - Oracle system with semantic search and context persistence
- **🤖 Agent Orchestration** - Specialized agents (Architect, Implementer, Reviewer, PM)
- **⚡ Slash Commands** - 6 workflow commands for common development tasks
- **🎯 Path-Triggered Skills** - 7 technology-specific skills auto-loaded by project context

## Quick Start

### Installation

```bash
# Install from Claude Code marketplace
claude plugin install cellm

# Or clone and test locally
git clone https://github.com/murillodutt/cellm.git
claude --plugin-dir ./cellm/cellm
```

### Usage

Once installed, CELLM activates automatically when you use Claude Code:

```bash
# Start Claude Code in your project
cd your-project
claude

# Oracle worker starts on port 31415
# Context is injected automatically
# Skills activate based on your project files
```

### Commands

CELLM provides 6 slash commands:

| Command | Description |
|---------|-------------|
| `/shape-spec` | Shape requirements with 8 structured questions |
| `/plan-product` | Plan product features with user story mapping |
| `/discover-patterns` | Discover code patterns in your project |
| `/index-patterns` | Index patterns for future reuse |
| `/inject-patterns` | Inject patterns into current context |
| `/oracle-status` | Check Oracle worker health and stats |

## Architecture

```
cellm/
├── .claude-plugin/          Plugin manifest (v2.0.5)
├── agents/                  4 specialized agents
├── commands/                6 slash commands
├── skills/                  7 technology skills
├── scripts/                 11 operational scripts
├── hooks/                   5 lifecycle hooks
└── docs/                    Technical documentation
```

## Features Highlight

### 🧠 Oracle Memory System
- Persistent memory across sessions
- Semantic search with embeddings
- Timeline of past decisions and context
- Dashboard at http://localhost:31415

### 🤖 Specialized Agents
- **Architect** - System design and planning
- **Implementer** - Code generation with constraints
- **Reviewer** - 12-point quality gate
- **ProjectManager** - Task orchestration

### 🎯 Auto-Activated Skills
- **Nuxt** - Framework patterns (triggers on `nuxt.config.ts`)
- **Vue** - Component patterns (triggers on `*.vue`)
- **TypeScript** - Type-safe patterns (triggers on `*.ts`)
- **Tailwind** - Utility-first CSS (triggers on `tailwind.config.*`)
- **Pinia** - State management (triggers on `stores/**`)
- **Drizzle** - Database ORM (triggers on `drizzle.config.*`)
- **Oracle Search** - Memory search (always available)

### ⚡ Lifecycle Hooks
- **SessionStart** - Initialize Oracle, inject context
- **UserPromptSubmit** - Capture user intent
- **PostToolUse** - Track tool usage patterns
- **Stop** - Persist session context
- **PreCompact** - Save before context compression

## Documentation

Complete documentation available in [.github/docs/](.github/docs/INDEX.md):

- [Installation Guide](.github/docs/INSTALLATION.md) - Setup and configuration
- [Features Overview](.github/docs/FEATURES.md) - Detailed feature descriptions
- [Technical Specs](.github/docs/TECHNICAL-SPECS.md) - Architecture and design
- [Agents Guide](.github/docs/AGENTS.md) - Working with specialized agents
- [Commands Reference](.github/docs/COMMANDS.md) - Slash command documentation
- [Skills Guide](.github/docs/SKILLS.md) - Technology-specific skills
- [Oracle System](.github/docs/ORACLE.md) - Memory and search
- [Compass Dashboard](.github/docs/COMPASS.md) - Visual monitoring
- [Troubleshooting](.github/docs/TROUBLESHOOTING.md) - Common issues
- [FAQ](.github/docs/FAQ.md) - Frequently asked questions

## Technology Stack

CELLM is optimized for the following stack:

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 4.x |
| UI | Vue 3.x |
| Language | TypeScript 5.x |
| Styling | Tailwind CSS 3.x |
| State | Pinia 2.x |
| Database | Drizzle ORM 0.28+ |
| Runtime | Bun 1.0+ (Oracle) |

## Requirements

- **Claude Code** CLI (latest version)
- **Node.js** 18+ or **Bun** 1.0+ (for Oracle worker)
- **NPM Package** `@cellm-ai/oracle` (installed automatically)

## Community

- [GitHub Discussions](https://github.com/murillodutt/cellm/discussions) - Ask questions, share ideas
- [Issue Tracker](https://github.com/murillodutt/cellm/issues) - Report bugs, request features
- [Contributing Guide](.github/docs/CONTRIBUTING.md) - How to contribute
- [Code of Conduct](.github/CODE_OF_CONDUCT.md) - Community guidelines

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- 📧 Email: contact@cellm.ai
- 🌐 Website: https://cellm.ai
- 💬 Discussions: https://github.com/murillodutt/cellm/discussions

---

<div align="center">

**Built with ❤️ by the CELLM team**

[Get Started](.github/docs/INSTALLATION.md) • [View Docs](.github/docs/INDEX.md) • [Join Community](.github/docs/COMMUNITY.md)

</div>

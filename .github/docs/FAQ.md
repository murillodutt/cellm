# Frequently Asked Questions

> [Home](../README.md) > [Docs](README.md) > **FAQ**

Common questions about CELLM.

---

## General

### What is CELLM?

CELLM is a context engineering system for AI-driven development. It provides:
- Persistent memory across sessions
- Framework-specific skills
- Structured development workflow
- Pattern management

### Is CELLM free?

Yes, 100% free forever. MIT licensed. No premium tiers, no paywalls.

### What makes CELLM different?

Most AI coding tools forget everything between sessions. CELLM:
- Remembers your project context
- Knows your patterns and rules
- Applies consistent code style
- Tracks what was built and why

### What stack does CELLM support?

CELLM is optimized exclusively for:
- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS v4
- Pinia
- Drizzle ORM

**Why exclusive?** Depth over breadth. Better to be expert in one stack than mediocre in twenty.

---

## Installation

### What are the prerequisites?

- **Bun 1.0+** - Runtime for Oracle
- **Claude Code CLI** - Latest version
- **Git 2.30+** - Version control
- **macOS/Linux/Windows (WSL2)**

### How do I install CELLM?

```bash
/plugin marketplace add murillodutt/cellm
/plugin install cellm
```

That's it. One command.

### How do I verify it's working?

```bash
/oracle-status
```

You should see all systems green.

### Can I use CELLM with other editors?

CELLM is designed for Claude Code. Support for other editors may come in future versions.

---

## Usage

### How do I start a new feature?

```bash
# 1. Plan the feature
/plan-product "my feature"

# 2. Shape requirements
/shape-spec

# 3. Create tasks
/create-tasks

# 4. Implement
/implement

# 5. Verify
/verify
```

### What commands are available?

| Command | Purpose |
|---------|---------|
| `/plan-product` | Product planning |
| `/shape-spec` | Requirements shaping |
| `/create-tasks` | Task breakdown |
| `/implement` | Code generation |
| `/verify` | Quality validation |
| `/oracle-status` | Health check |

See [Commands Reference](commands.md) for full list.

### Do I need to use all commands?

No. Use what fits your workflow. For quick fixes, just `/implement` and `/verify`.

### How do skills work?

Skills load automatically based on file type:
- Open `.vue` file → Vue skill loads
- Open `stores/*.ts` → Pinia skill loads
- Open `db/*.ts` → Drizzle skill loads

No configuration needed.

---

## Oracle

### What is Oracle?

Oracle is CELLM's memory system. It provides:
- Semantic search across your codebase
- Pattern tracking
- Session memory
- Context persistence

### Where is my data stored?

All data is stored locally:
- **Database:** `~/.cellm/oracle.db`
- **Logs:** `~/.cellm/logs/`
- **Config:** `~/.cellm/worker.json`

### Is my data sent anywhere?

No. Oracle is 100% local-first:
- Embeddings computed locally
- No API calls to external services
- No telemetry or tracking

### How does semantic search work?

Oracle converts text to vectors using a local embedding model, then finds similar content using cosine similarity. This enables natural language queries like "find authentication code" instead of exact keyword matching.

---

## Patterns & Skills

### What patterns are included?

50+ validated patterns for:
- Vue 3 Composition API
- Nuxt 4 SSR/SSG
- TypeScript strict mode
- Tailwind semantic tokens
- Pinia state management
- Drizzle ORM

### Can I add my own patterns?

Yes. Add pattern files to your project's `cellm-core/patterns/` directory.

### What are anti-patterns?

Anti-patterns are things to avoid. CELLM blocks:
- Using `any` type
- Hardcoded colors
- Synchronous I/O
- Options API
- And more...

### How do skills know when to activate?

Skills have trigger patterns:
- `sk-vue` triggers on `*.vue`
- `sk-pinia` triggers on `stores/**`
- `sk-drizzle` triggers on `db/**`

---

## Agents

### What agents are available?

| Agent | Role |
|-------|------|
| **Architect** | Design & Planning |
| **Implementer** | Code Execution |
| **Reviewer** | Quality Assurance |
| **Project Manager** | Task Orchestration |

### Do I choose which agent to use?

No, agents are triggered by commands:
- `/plan-product` → Architect
- `/implement` → Implementer
- `/verify` → Reviewer
- `/create-tasks` → PM

### Can agents write code?

Only the **Implementer** agent can write code. The **Architect** and **Reviewer** work in plan mode (read-only).

---

## Troubleshooting

### Oracle won't start

```bash
# Check Bun
bun --version

# Start manually
cd ~/.claude/plugins/cellm
bun scripts/spawn-worker.sh

# Check logs
tail -f ~/.cellm/logs/oracle-worker.log
```

### Commands not recognized

```bash
# Verify plugin installed
/plugin list

# Reinstall if needed
/plugin uninstall cellm
/plugin install cellm
```

### Skills not loading

- Check file extension matches skill trigger
- Restart Claude Code session
- Verify plugin is installed

See [Troubleshooting Guide](troubleshooting.md) for more solutions.

---

## Contributing

### How can I contribute?

- Report bugs
- Suggest features
- Improve documentation
- Submit code PRs

See [Contributing Guide](contributing.md).

### Where do I report bugs?

[GitHub Issues](https://github.com/murillodutt/cellm/issues)

### Where do I ask questions?

[GitHub Discussions](https://github.com/murillodutt/cellm/discussions)

---

## Business

### What's the business model?

There isn't one. CELLM is a passion project.

### Will there be a paid version?

No. Everything is and will remain free.

### Can I use CELLM commercially?

Yes. MIT license allows commercial use without restrictions.

### Who built CELLM?

**Dutt Yeshua Technology Ltd** - Developers who got tired of repeating themselves to AI.

---

## Related Documentation

- [Getting Started](getting-started.md) - Quick setup
- [Features Overview](features.md) - All capabilities
- [Troubleshooting](troubleshooting.md) - Problem solving

[Back to Docs](README.md) | [Back to Home](../README.md)

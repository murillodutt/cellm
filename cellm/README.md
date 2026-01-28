# CELLM Plugin for Claude Code

> Context Engineering for LLM-driven development

**Version:** 2.0.5

CELLM provides structured specs, intelligent memory, and orchestration for AI agents building software.

## Installation

```bash
# Install from marketplace
claude plugin install cellm

# Or test locally
claude --plugin-dir ./cellm-plugin
```

## Quick Start

### 1. Install the Plugin

```bash
claude plugin install cellm
```

### 2. Initialize Oracle (Optional)

```bash
/cellm-init
```

This installs and configures Oracle for enhanced features:
- Semantic search across project context
- Persistent memory between sessions
- Pattern discovery and suggestions
- Visual dashboard (Compass)

**Note**: CELLM works standalone without Oracle. This step is optional.

After installation, activate MCP tools:

```bash
cp cellm/.mcp.json.example cellm/.mcp.json
```

### 3. Start Working

```bash
claude
```

CELLM plugin is now active with all skills and agents available.

## Features

### Skills

Specialized knowledge that activates based on file context:

| Skill | Trigger | Description |
|-------|---------|-------------|
| `sk-vue` | `*.vue` files | Vue 3 Composition API patterns |
| `sk-nuxt` | Nuxt projects | Nuxt 4 full-stack patterns |
| `sk-pinia` | State files | Pinia state management |
| `sk-drizzle` | Schema files | Drizzle ORM database patterns |
| `sk-typescript` | `*.ts` files | TypeScript best practices |
| `sk-tailwind` | Styling | Tailwind CSS v4 with semantic tokens |

### Agents

Specialized assistants for different tasks:

| Agent | Command | Purpose |
|-------|---------|---------|
| `architect` | `/architect` | System design and planning |
| `implementer` | `/implementer` | Code implementation |
| `reviewer` | `/reviewer` | Code review and verification |
| `project-manager` | `/pm` | Task orchestration |

### Oracle Dashboard

Access at `http://localhost:31415`:

- **Intelligence Hub** - View rules, patterns, observations
- **Orchestrator** - Real-time terminal with MCP request logs
- **Action Center** - Approve/reject dangerous operations
- **Health** - System status and cache statistics

### Action Center (Safety)

Dangerous operations are automatically paused for approval:

- `rm -rf` commands
- `git push --force`
- Database drops
- Destructive file operations

Operations expire after 5 minutes if not acted upon.

## Commands

| Command | Description |
|---------|-------------|
| `/cellm-init` | Install/update/repair Oracle worker |
| `/oracle-status` | Check Oracle worker health |
| `/plan-product` | Define mission, roadmap, tech stack |
| `/shape-spec` | Research and define requirements |
| `/write-spec` | Create detailed specification |
| `/create-tasks` | Generate tasks from spec |
| `/implement` | Implement a task/feature |
| `/verify` | Review and verify implementation |
| `/status` | Show project status |

## Configuration

Edit `.claude/cellm/config.yaml`:

```yaml
project:
  name: "my-project"
  stack:
    - nuxt
    - typescript
    - tailwind

oracle:
  port: 31415
  cache:
    ttl: 3600
    maxSize: 1000

safety:
  dangerousOperationTimeout: 300
  autoRejectOnTimeout: true

skills:
  - vue
  - nuxt
  - typescript
  - pinia
  - drizzle
  - tailwind
```

## Architecture

```
CELLM Plugin
├── .claude-plugin/
│   └── plugin.json         # Plugin manifest
├── hooks/
│   └── hooks.json          # Event-keyed hooks configuration
├── scripts/                # Hook scripts
│   ├── init-oracle.sh      # Assisted Oracle installation
│   ├── check-worker-health.sh # Fast health check (2s)
│   ├── inject-context.sh   # Context injection on SessionStart
│   ├── capture-context.sh  # Session capture on Stop
│   ├── capture-prompt.sh   # Prompt capture on UserPromptSubmit
│   ├── track-tool-use.sh   # Track Write/Edit/Bash usage
│   ├── auto-recovery.sh    # Worker auto-recovery
│   ├── health-check.sh     # Health verification
│   ├── log-rotate.sh       # Log rotation utility
│   └── check-dependencies.sh # Dependency verification
├── skills/                 # Domain knowledge
│   ├── oracle-search/      # Semantic memory search
│   ├── sk-vue/
│   ├── sk-nuxt/
│   ├── sk-pinia/
│   ├── sk-drizzle/
│   ├── sk-typescript/
│   └── sk-tailwind/
├── agents/                 # Specialized assistants
│   ├── architect.md
│   ├── implementer.md
│   ├── reviewer.md
│   └── project-manager.md
├── commands/
│   └── oracle-status.md    # /oracle-status command
├── resources/
│   └── cellm-core/         # Rules, patterns, templates
├── .mcp.json.example       # MCP server configuration template
└── marketplace.json        # Plugin registry entry
```

## Oracle Worker

Oracle provides:

| Feature | Description |
|---------|-------------|
| **Intelligence Service** | Pattern recommendations based on context |
| **Semantic Cache** | <5ms response for similar queries |
| **WebSocket Streaming** | Real-time operation updates |
| **MCP Integration** | Tool exposure for Claude Code |
| **Action Center API** | Dangerous operation approval workflow |

Port: **31415** (auto-started with each session)

## API

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/orchestrator/logs` | MCP request logs |
| `GET /api/actions/pending` | Pending dangerous operations |
| `POST /api/actions/:id/approve` | Approve operation |
| `POST /api/actions/:id/reject` | Reject operation |
| `WS /_ws` | Real-time event streaming |

### Pattern Lifecycle API (v2.4.0)

| Endpoint | Description |
|----------|-------------|
| `GET /api/patterns` | List patterns with metrics |
| `GET /api/patterns/export` | Export patterns to Markdown |
| `GET /api/patterns/relations` | Get duplicates/conflicts |
| `GET /api/patterns/candidates` | Get promotion candidates |
| `POST /api/patterns/promote` | Promote observation cluster to pattern |
| `POST /api/patterns/:id/feedback` | Record pattern application feedback |

See [API Reference](../docs/plugin/api-reference.md) and [Pattern Lifecycle API](../docs/plugin/pattern-lifecycle-api.md) for full documentation.

## Requirements

- Claude Code CLI
- Bun >= 1.1.0 (for Oracle)
- macOS, Linux, or Windows with WSL

## Documentation

- [Getting Started](../docs/plugin/getting-started.md)
- [API Reference](../docs/plugin/api-reference.md)
- [Migration Guide](../docs/plugin/migration.md)
- [Pattern Migration](../docs/plugin/pattern-migration.md) - v2.4.0
- [Pattern Lifecycle API](../docs/plugin/pattern-lifecycle-api.md) - v2.4.0

## License

MIT

## Links

- **Website:** https://cellm.ai
- **GitHub:** https://github.com/murillodutt/cellm
- **Documentation:** https://docs.cellm.ai

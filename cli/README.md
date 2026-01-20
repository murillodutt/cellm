# @cellm/cli

[![npm version](https://img.shields.io/npm/v/@cellm/cli.svg)](https://www.npmjs.com/package/@cellm/cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Command-line interface for CELLM - Spec-Driven Development System for AI Agents.

**Version:** 1.0.0

## Installation

```bash
npm install -g @cellm/cli
```

Or use directly with npx:

```bash
npx @cellm/cli init
```

## Commands

### cellm init

Initialize CELLM structure in your project.

```bash
cellm init [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --profile <name>` | Profile to use | `nuxt-fullstack` |
| `-f, --force` | Overwrite existing `.claude` directory | `false` |
| `--dry-run` | Show what would be done without changes | `false` |

**Available Profiles:**

- `nuxt-fullstack` - Nuxt 4 full-stack with Drizzle, Nuxt UI, Pinia
- `nuxt-saas` - Nuxt 4 SaaS with Stripe integration
- `vue-spa` - Vue 3 SPA with Pinia
- `minimal` - Minimal setup with core rules only

**Example:**

```bash
# Initialize with default profile
cellm init

# Initialize with specific profile
cellm init --profile vue-spa

# Preview without making changes
cellm init --dry-run
```

### cellm validate

Validate CELLM project structure and schemas.

```bash
cellm validate [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --dir <path>` | Directory to validate | `.` |
| `-v, --verbose` | Show detailed output | `false` |

**What it checks:**

- Directory structure completeness
- Frontmatter validation against JSON schemas
- Token budget estimation
- Cross-references validity

**Example:**

```bash
# Validate current directory
cellm validate

# Validate with verbose output
cellm validate --verbose

# Validate specific directory
cellm validate --dir ./my-project
```

### cellm doctor

Diagnose CELLM configuration issues.

```bash
cellm doctor [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --dir <path>` | Directory to check | `.` |
| `-v, --verbose` | Show detailed output | `false` |

**What it checks:**

- Node.js version compatibility (>=20)
- npm availability
- Git repository status
- CELLM structure presence
- CLAUDE.md configuration
- Required directories

**Example:**

```bash
# Run diagnostics
cellm doctor

# Run with verbose output
cellm doctor --verbose
```

### cellm sync

Sync CELLM configuration from global profile or remote.

```bash
cellm sync [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-d, --dir <path>` | Directory to sync | `.` |
| `--from <source>` | Source to sync from | `global` |
| `--dry-run` | Show what would be done | `false` |
| `-f, --force` | Force sync even with local changes | `false` |

**Sources:**

- `global` - Sync from `~/.cellm` or package cellm-core
- `remote` - Sync from GitHub repository

**Example:**

```bash
# Sync from global installation
cellm sync

# Sync from remote repository
cellm sync --from remote

# Preview sync without changes
cellm sync --dry-run
```

### cellm debug

Debug CELLM context loading and configuration.

```bash
cellm debug <subcommand> [options]
```

**Subcommands:**

- `context` - Show all loaded context files
- `why <rule>` - Explain why a specific rule was loaded
- `budget` - Visualize token budget usage by layer
- `model [command]` - Show model selection matrix

**Example:**

```bash
# Show loaded context
cellm debug context

# Explain rule loading
cellm debug why conventions

# Show budget visualization
cellm debug budget
```

### cellm analytics

View CELLM usage metrics and analytics.

```bash
cellm analytics <subcommand> [options]
```

**Subcommands:**

- `session` - View current session metrics
- `history` - View metrics history over time
- `report` - Generate analytics report in Markdown

**Example:**

```bash
# View session metrics
cellm analytics session

# View history
cellm analytics history --days 7

# Generate report
cellm analytics report --output metrics.md
```

### cellm compile

Compile a CELLM profile into optimized context.

```bash
cellm compile [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --profile <name>` | Profile to compile | `nuxt-fullstack` |
| `-o, --output <path>` | Output directory | `.` |
| `--dry-run` | Show what would be compiled | `false` |
| `--list` | List available profiles | `false` |

**Example:**

```bash
# Compile default profile
cellm compile

# Compile specific profile
cellm compile --profile vue-spa

# List available profiles
cellm compile --list
```

### cellm upgrade

Upgrade project to the latest CELLM version.

```bash
cellm upgrade [options]
```

**Options:**

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Show what would be upgraded | `false` |
| `--no-backup` | Skip creating backup | `false` |
| `--target <version>` | Target version | latest |

**Example:**

```bash
# Upgrade to latest version
cellm upgrade

# Preview upgrade without changes
cellm upgrade --dry-run
```

### cellm feedback

Submit feedback and manage telemetry during CELLM usage.

```bash
cellm feedback [options]
```

**Options:**

| Option | Description |
|--------|-------------|
| `-t, --type <type>` | Feedback type: bug, feature, or general |
| `--title <text>` | Short summary of your feedback |
| `-d, --description <text>` | Detailed description |
| `-r, --rating <number>` | Satisfaction rating (1-10) |
| `-l, --list` | List submitted feedback |
| `-s, --stats` | Show feedback and telemetry statistics |
| `-c, --config [enabled]` | Configure telemetry (true/false) |

**Example:**

```bash
# Submit bug report
cellm feedback --type bug --title "Issue description"

# View statistics
cellm feedback --stats

# Configure telemetry
cellm feedback --config false
```

## Project Structure

After running `cellm init`, your project will have:

```
your-project/
├── CLAUDE.md                    # Project configuration for Claude
└── .claude/
    ├── index.md                 # Context index
    ├── rules/
    │   └── core/                # Core rules (always loaded)
    ├── patterns/
    │   ├── anti/                # Anti-patterns (always loaded)
    │   └── *.md                 # Stack-specific patterns
    ├── skills/                  # Optional skills
    ├── project/                 # Project-specific context
    └── session/
        └── current.md           # Session state
```

## Requirements

- Node.js >= 20.0.0
- npm >= 8.0.0

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## License

MIT

# CELLM Oracle

Visual Dashboard and MCP Integration for CELLM.

## Overview

CELLM Oracle provides:
- **Visual Dashboard** - Monitor budget, patterns, and project health
- **MCP Tools** - Real-time validation via MCP protocol
- **DevTools Integration** - Debug MCP requests and responses

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## MCP Tools

Oracle exposes 4 MCP tools:

| Tool | Description |
|------|-------------|
| `cellm_get_status` | Get current CELLM project status |
| `cellm_check_pattern` | Check if code follows patterns |
| `cellm_suggest_reuse` | Suggest existing components for reuse |
| `cellm_validate` | Validate project structure |

## Dashboard Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `/` | Overview and health status |
| Budget Tracker | `/budget` | Token usage by layer |
| Pattern Analytics | `/patterns` | Pattern usage statistics |
| Project Pulse | `/pulse` | Health score timeline |
| Prescriptive Actions | `/actions` | Suggested improvements |

## Tech Stack

- **Framework:** Nuxt 4.2
- **UI:** Nuxt UI v4.3
- **MCP:** @nuxtjs/mcp-toolkit v0.6
- **Charts:** NuxtCharts v2.0
- **State:** Pinia v3.0
- **Styling:** Tailwind CSS

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CELLM_CORE_PATH` | Path to cellm-core | `../cellm-core` |

## Development

```bash
# Run dev server
npm run dev

# Type checking
npm run typecheck

# Run tests
npm run test

# E2E tests
npm run test:e2e
```

## Deployment

### Option 1: Local

```bash
npm run build
npm run preview
```

### Option 2: Docker

```bash
docker build -t cellm/oracle .
docker run -p 3000:3000 cellm/oracle
```

## License

MIT

---

**Version:** 1.1.0
**Last Updated:** 2026-01-20

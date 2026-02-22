# CELLM Plugin

Context engineering for LLM-driven development. 18 skills, 4 agents, 6 hook events, Oracle integration.

See [../README.md](../README.md) for full reference.

## Quick Start

```bash
claude plugin install cellm
```

Optional Oracle setup:
```
/cellm:init
```

## Structure

```
.claude-plugin/plugin.json   # Manifest
skills/                      # 18 domain skills (auto-activated by path)
agents/                      # architect, implementer, reviewer, project-manager
hooks/hooks.json             # 6 event hooks
scripts/                     # 24 hook scripts
.mcp.json                    # Oracle MCP server config
```

## Requirements

- Claude Code CLI
- Bun >= 1.1.0 (for Oracle)

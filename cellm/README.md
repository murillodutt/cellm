# CELLM Plugin

Context engineering for LLM-driven development. 29 skills, 4 agents, 6 hook events, Oracle integration.

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
skills/                      # 29 skills (22 workflow + 7 context, auto-loaded by path)
agents/                      # architect, implementer, reviewer, project-manager
hooks/hooks.json             # 6 event hooks
scripts/                     # Hook scripts
.mcp.json                    # Oracle MCP server config
```

## Skills Architecture

Two types of skills coexist in the flat `skills/` directory:

**Context skills** (7) have `user-invocable: false` and `paths` in frontmatter. They auto-load when the Claude touches matching files. Multiple context skills stack: editing a `.vue` file loads vue + tailwind + dse simultaneously.

**Workflow skills** (18) are invoked manually as `/cellm:{name}`. They cover the full development lifecycle: plan, shape, write-spec, create-tasks, orchestrate, implement, verify.

## Requirements

- Claude Code CLI
- Bun >= 1.1.0 (for Oracle)

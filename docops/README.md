# DocOps Plugin

Documentation maintenance with LLM-first templates, code evidence, and drift control. 12 skills, 1 agent.

See [../README.md](../README.md) for full reference.

## Quick Start

```
/docops:init
```

## Structure

```
.claude-plugin/plugin.json   # Manifest
skills/                      # 12 documentation skills
agents/docops-writer.md      # Documentation specialist agent
hooks/hooks.json             # SessionEnd drift reminder
scripts/docops-hook.sh       # Hook script
templates/                   # en/ and pt-BR/ document templates
```

## Configuration

`.claude/docops.json`:
```json
{
  "docRoot": "docs/technical",
  "conveyorFile": "project-conveyor.md",
  "language": "en"
}
```

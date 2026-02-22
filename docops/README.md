# DocOps Plugin

Documentation maintenance with LLM-first templates, code evidence, and drift control. 10 skills, 1 agent, 11 commands.

See [../README.md](../README.md) for full reference.

## Quick Start

```
/docops:init
```

## Structure

```
.claude-plugin/plugin.json   # Manifest
skills/                      # 10 documentation skills
agents/docops-writer.md      # Documentation specialist agent
commands/                    # 11 slash commands (thin wrappers to skills)
hooks/hooks.json             # Stop + PreCompact drift reminders
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

---
command: orchestrate-tasks
agent: project-manager
---

# /orchestrate-tasks

## Load

- rules/core/*
- specs/{current}/tasks.md

## Steps

1. Read tasks.md
2. Group tasks by dependency (## headers)
3. Execute groups sequentially
4. Checkpoint between groups
5. Report progress

## Modes

| Mode | Description |
|------|-------------|
| standard | Execute all groups |
| resilient | Continue on non-critical failures |
| interactive | Confirm each group before execution |

## Output

Progress report + tasks.md updated with completion status

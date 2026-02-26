---
description: Manage complete documentation lifecycle from creation to archival and restoration. Handles undeprecation, restoration from archive, conflict resolution, and state transition logging.
argument-hint: "<action> <file> [options]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/archive/**"
  - "**/reference/conveyor-gaps.md"
---

## State Machine

```
[draft] -> [active] -> [deprecated] -> [archived]
              ^              |               |
              |  /undeprecate|    /restore    |
              +--------------+---------------+
```

| Transition | Command | Auto |
|-----------|---------|------|
| active → deprecated | `/docops:deprecate` | No |
| deprecated → active | `/docops:undeprecate` | No |
| deprecated → archived | `/docops:prune` | Yes (after grace) |
| archived → active | `/docops:restore` | No |

## Conflict Resolution

On restore, check original path:
- Empty: restore to original
- Same content: skip, remove archive
- Different: ask user
- Structure changed: restore to closest match

Log all transitions to `.claude/docops:deprecations.log`.

Archive structure: `{docRoot}/archive/{YYYY-MM}/{filename}` + `index.md`.

## NEVER

- **Auto-archive ADRs** — manual only (historical record)
- **Skip transition logging** — log every state change
- **Hard delete before 90 days** — keep archive minimum 90d
- **Restore without preserving history** — keep all lifecycle metadata

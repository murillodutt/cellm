---
name: lifecycle
description: Manage complete documentation lifecycle from creation to archival and restoration. Handles undeprecation, restoration from archive, conflict resolution, and state transition logging.
argument-hint: "<action> <file> [options]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/archive/**"
  - "**/reference/conveyor-gaps.md"
---

Manage the complete documentation lifecycle: **draft -> active -> deprecated -> archived**, with **undeprecate** and **restore** reverse paths.

## State Transitions

```
[draft] -> [active] -> [deprecated] -> [archived]
              ^              |               |
              |  /undeprecate|    /restore    |
              +--------------+---------------+
```

| From | To | Command | Automatic |
|------|-----|---------|-----------|
| active | deprecated | `/docops:deprecate` | No |
| deprecated | active | `/docops:undeprecate` | No |
| deprecated | archived | `/docops:prune` | Yes (after grace) |
| archived | active | `/docops:restore` | No |

## Archive Structure

```
{docRoot}/archive/
  2026-01/             # Monthly folders
    auth.spec.md
  index.md             # Archive index with metadata
```

## Restoration Conflict Resolution

| Scenario | Action |
|----------|--------|
| Original path empty | Restore to original |
| Same content exists | Skip, remove archive |
| Different content exists | Ask user |
| Structure changed | Restore to closest match |

All transitions logged to `.claude/docops:deprecations.log`.

## NEVER

- **Auto-archive ADRs** — historical record, archive only manually
- **Skip transition logging** — every state change must be logged
- **Hard delete before 90 days** — keep archive minimum 90 days
- **Restore without preserving history** — keep all lifecycle metadata in frontmatter

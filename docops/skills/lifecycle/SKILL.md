---
description: "Docops: manage complete documentation lifecycle — creation, deprecation, archival, restoration, undeprecation. Handles conflict resolution and state transition logging. Use when: 'lifecycle', 'restore doc', 'archive and restore'."
user-invocable: true
argument-hint: "<action> <file> [options]"
---

# Lifecycle

Manage complete documentation lifecycle with conflict resolution and state transition logging.

## Intent

- Orchestrate all documentation state transitions: draft → active → deprecated → archived, and reversals.
- Log every transition and resolve conflicts when restoring to an occupied path.

## Policy

- `context_preflight` mandatory before execution (`flow='generic'`).
- Respect active directives; do not destroy documentation referenced by active directives.
- Every state transition must be logged to `.claude/docops:deprecations.log`.
- Hard deletes are prohibited before 90 days in archive; minimum retention is 90d.
- ADRs must never be auto-archived — manual only (historical record).
- Record outcomes via `context_record_outcome` after execution.

## Routing

1. Run `context_preflight` with `flow='generic'`; block execution if preflight fails.
2. Parse `<action>` and `<file>` from arguments; validate the transition is permitted:

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

3. Delegate to the appropriate sub-skill (`deprecate`, `undeprecate`, `prune`, `restore`) or execute the transition directly.
4. On restore, resolve conflicts at original path:
   - Empty: restore to original.
   - Same content: skip, remove archive copy.
   - Different content: ask user.
   - Structure changed: restore to closest match.
5. Archive structure: `{docRoot}/archive/{YYYY-MM}/{filename}` + `index.md`.
6. Log the state transition to `.claude/docops:deprecations.log`.
7. Emit outcome via `context_record_outcome`.

## NEVER

- **Auto-archive ADRs** — manual only (historical record)
- **Skip transition logging** — log every state change
- **Hard delete before 90 days** — keep archive minimum 90d
- **Restore without preserving history** — keep all lifecycle metadata

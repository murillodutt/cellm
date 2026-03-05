---
description: Restore an archived document back to active status. Handles conflict resolution when the original path is occupied, preserves lifecycle metadata.
user-invocable: true
argument-hint: "<file>"
---

## Process

1. Find file in `{docRoot}/archive/`; fail if not found
2. Check original path for conflicts:
   - Empty: restore to original
   - Same content: skip, remove archive copy
   - Different content: ask user
   - Structure changed: restore to closest match
3. Move file to original location
4. Set `status: active`, add `restored_on`, `restored_from` to frontmatter
5. Update `{docRoot}/archive/index.md`
6. Log to `.claude/docops:deprecations.log`

Transition: `[archived] -> [active]`

## NEVER

- **Delete without restoring** — move only
- **Skip conflict resolution** — check original path first
- **Discard lifecycle metadata** — keep all dates in history
- **Skip logging** — log every state change

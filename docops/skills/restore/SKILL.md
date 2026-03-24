---
description: "Docops: restore an archived document back to active status. Handles conflict resolution when the original path is occupied, preserves lifecycle metadata. Use when: 'restore doc', 'unarchive', 'bring back archived file'."
user-invocable: true
argument-hint: "<file>"
---

# Restore

Restore an archived document back to active status with conflict resolution.

## Intent

- Move a file from `{docRoot}/archive/` back to its original path and mark it active.
- Resolve conflicts when the original path is already occupied, preserving all lifecycle metadata.

## Policy

- `context_preflight` mandatory before execution (`flow='generic'`).
- Respect active directives; do not destroy documentation referenced by active directives.
- Never delete an archived file without first restoring it — move only.
- All conflict cases at the original path must be resolved before the file is moved.
- Every state change must be logged to `.claude/docops:deprecations.log`.
- Record outcomes via `context_record_outcome` after execution.

## Routing

1. Run `context_preflight` with `flow='generic'`; block execution if preflight fails.
2. Find target file in `{docRoot}/archive/`; fail with clear message if not found.
3. Check original path for conflicts:
   - Empty: restore to original path.
   - Same content: skip, remove archive copy.
   - Different content: ask user to choose.
   - Structure changed: restore to closest matching path.
4. Move file to resolved destination path.
5. Set `status: active`, add `restored_on` and `restored_from` to frontmatter.
6. Update `{docRoot}/archive/index.md` to reflect the restoration.
7. Log transition (`[archived] -> [active]`) to `.claude/docops:deprecations.log`.
8. Emit outcome via `context_record_outcome`.

## NEVER

- **Delete without restoring** — move only
- **Skip conflict resolution** — check original path first
- **Discard lifecycle metadata** — keep all dates in history
- **Skip logging** — log every state change

---
name: docops-prune
description: Archive or remove deprecated documentation and broken references.
usage: /docops-prune [docRoot] [--dry-run]
arguments:
  - name: docRoot
    description: Optional documentation root (overrides .claude/docops.json)
    required: false
  - name: --dry-run
    description: List what would be pruned without making changes
    required: false
agent: docops-writer
budget: ~200
---

# DocOps Prune

## Goal
Remove deprecated documentation, broken references, and orphaned files to prevent accumulation of stale content.

## Rules
- **ALWAYS** run with `--dry-run` first to preview changes.
- **NEVER** delete without user confirmation (use AskUserQuestion).
- Archive to `archive/` by default instead of hard delete.
- Update all references to archived/deleted files.

## Steps

1) Resolve config
- Read `.claude/docops.json` or use defaults.
- Check for `pruneConfig` settings (archive vs delete, retention days).

2) Scan for deprecated content
- Find all `.md` files with `status: deprecated` in frontmatter.
- Find all `.md` files with `status: obsolete` in frontmatter.
- Check `last_reviewed` dates older than retention period (default: 90 days).

3) Detect broken references
- Scan all markdown files for internal links `](path/to/file.md)`.
- Identify links pointing to non-existent files.
- Identify orphaned files (exist but not referenced anywhere).

4) Detect orphaned evidence
- List files in `reference/code-evidence/`.
- Check if each evidence file is referenced by any SPEC/REF.
- Mark unreferenced evidence as candidates for removal.

5) Preview changes (dry-run)
- List deprecated files to archive/delete.
- List broken references to fix.
- List orphaned files to archive/delete.
- Show summary counts.

6) Confirm with user
- Use AskUserQuestion to confirm action.
- Options: Archive all, Delete all, Select individually, Cancel.

7) Execute pruning
- Move deprecated files to `archive/YYYY-MM/`.
- Remove broken references or update to archived path.
- Update `conveyor-gaps.md` with pruning record.

8) Report
- Files archived: N
- Files deleted: N
- References fixed: N
- Orphans removed: N

## Output
- Clean documentation tree without deprecated or orphaned content.
- Archive folder with removed content (if archive mode).
- Updated `conveyor-gaps.md` with pruning log.

## Configuration (optional in docops.json)

```json
{
  "pruneConfig": {
    "mode": "archive",
    "archivePath": "archive",
    "retentionDays": 90,
    "autoRemoveOrphans": false
  }
}
```

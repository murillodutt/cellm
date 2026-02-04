---
description: Restore an archived document back to active documentation
argument-hint: "<file> [--reason \"text\"]"
---

# DocOps Restore

## Goal
Restore a previously archived document back to active documentation.

## Rules
- Only works on files in `archive/` directory.
- Restores to original location if possible.
- Updates all tracking and references.

## Steps

1) Locate archived file
- Search in `{docRoot}/archive/` for the file.
- Parse archive metadata to find original location.

2) Check for conflicts
- Verify original location is available.
- If file exists at original location, ask user for action.

3) Move file
- Move from `archive/YYYY-MM/` to original location.
- Preserve file content.

4) Update frontmatter
- Set `status: active`.
- Remove archive-related fields.
- Add `restored_on: YYYY-MM-DD`.
- Add `restored_from: archive/YYYY-MM/filename.md`.
- Add `restoration_reason: <reason>`.

5) Update indexes
- Add file back to `index.md`.
- Update any category indexes.

6) Restore references
- Find docs that previously linked to this file.
- Restore links (if marked as broken/archived).

7) Log restoration
- Add entry to `.claude/docops-deprecations.log`.
- Add resolved entry to `conveyor-gaps.md`.

## Output
- File restored to original location.
- Indexes updated.
- References restored where possible.

## Archive Metadata Format

Archived files retain metadata about their origin:

```yaml
---
status: archived
archived_on: 2026-03-05
archived_from: specs/auth.spec.md
archive_reason: "Superseded by auth-v2.spec.md"
---
```

## Conflict Resolution

If a file exists at the original location:

```
File conflict detected:
- Archived: archive/2026-03/auth.spec.md
- Original location: specs/auth.spec.md (exists)

Options:
1. Restore with new name (auth-restored.spec.md)
2. Replace existing file
3. Merge contents manually
4. Cancel restoration
```

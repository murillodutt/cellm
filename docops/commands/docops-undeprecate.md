---
name: docops-undeprecate
description: Restore a deprecated document to active status.
usage: /docops-undeprecate <file> [--reason "text"]
arguments:
  - name: file
    description: File path to restore (relative to docRoot)
    required: true
  - name: --reason
    description: Reason for restoration
    required: false
agent: docops-writer
budget: ~100
---

# DocOps Undeprecate

## Goal
Restore a deprecated document to active status, canceling scheduled archival.

## Rules
- Only works on files with `status: deprecated`.
- Cannot restore already archived files (use `/docops-restore` instead).
- Cleans up all deprecation markers.

## Steps

1) Validate file
- Check file exists and has `status: deprecated`.
- Reject if already archived.

2) Update frontmatter
- Set `status: active`.
- Remove `deprecated_on`, `deprecated_by`, `deprecation_reason`.
- Remove `archive_on`, `replacement`.
- Add `restored_on: YYYY-MM-DD`.
- Add `restoration_reason: <reason>`.

3) Remove deprecation banner
- Delete the WARNING block from document.

4) Update references
- Find all docs with `[DEPRECATED]` marker for this file.
- Remove the marker.

5) Remove gap entry
- Delete the `DEP-XXX` entry from `conveyor-gaps.md`.
- Or move to Resolved section with note.

6) Log restoration
- Add entry to `.claude/docops-deprecations.log`.

## Output
- File restored to active status.
- Gap entry removed or resolved.
- References cleaned.

## Frontmatter After Restoration

```yaml
---
status: active
restored_on: 2026-02-10
restoration_reason: "Still needed for legacy clients"
---
```

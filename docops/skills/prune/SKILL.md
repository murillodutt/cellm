---
name: prune
description: Archive or remove deprecated documentation, broken references, and orphaned files. Scans for deprecated frontmatter, validates internal links, and identifies unreferenced files.
argument-hint: "[docRoot] [--dry-run]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/archive/**"
---

Find **deprecated docs**, **broken references**, and **orphaned files** — then archive or remove them with user confirmation.

## Detection

- **Deprecated** — frontmatter `status: deprecated` or `status: obsolete`
- **Broken references** — internal `[text](path.md)` links pointing to non-existent files
- **Orphaned files** — evidence files not referenced by any SPEC/REF, specs not linked from index.md

## Workflow

1. **Scan** — find all candidates
2. **Classify** — deprecated, broken, orphaned
3. **Preview** — show dry-run results
4. **Confirm** — ask user for approval
5. **Execute** — archive (default) or delete (explicit)
6. **Report** — summary, log actions in conveyor-gaps.md

## NEVER

- **Execute without preview** — always show dry-run first, then confirm
- **Delete by default** — archive is the default, delete only when explicitly requested
- **Leave dangling references** — update all links after moving files
- **Skip logging** — log all actions in conveyor-gaps.md

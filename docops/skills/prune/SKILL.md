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

## Detection

- **Deprecated**: `status: deprecated` or `status: obsolete` in frontmatter
- **Broken references**: `[text](path.md)` pointing to non-existent files
- **Orphaned files**: evidence not referenced by any SPEC/REF; specs not linked from index.md

## Workflow

1. Scan all candidates
2. Show dry-run preview (always first)
3. Ask user confirmation
4. Archive deprecated files; update all broken links
5. Log actions to conveyor-gaps.md

Archive is default. Delete only if explicitly requested.

## NEVER

- **Execute without preview** — always dry-run first
- **Delete by default** — archive only; delete on explicit request
- **Leave dangling references** — update all links when moving files
- **Skip logging** — log all actions to conveyor-gaps.md

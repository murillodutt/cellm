---
name: docops-prune
description: |
  Archive or remove deprecated documentation and broken references.
  Use when: cleaning up docs, removing deprecated content, fixing broken links.
  Triggers: /docops-prune, deprecated docs, broken references.
argument-hint: "[docRoot] [--dry-run]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/archive/**"
---

# DocOps Prune

## Purpose
Remove deprecated documentation, broken references, and orphaned files.

## Detection Patterns

### Deprecated Content
```yaml
# Frontmatter patterns to detect
status: deprecated
status: obsolete
status: archived
```

### Broken References
```markdown
# Link patterns to validate
[text](path/to/file.md)      # Internal file link
[text](#section)             # Section anchor
[text](./relative/path.md)   # Relative path
```

### Orphaned Files
- Files in `reference/code-evidence/` not referenced by any SPEC/REF
- Files in `specs/` not linked from `index.md`
- Files in `howto/` not linked from any doc

## Workflow

1. **Scan** - Find all candidates for pruning
2. **Classify** - Deprecated, broken, orphaned
3. **Preview** - Show dry-run results
4. **Confirm** - Ask user for approval
5. **Execute** - Archive or delete
6. **Report** - Summary of changes

## Rules
- Always preview before executing
- Archive by default, delete only if explicitly requested
- Update references after moving files
- Log all actions in conveyor-gaps.md

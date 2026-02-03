---
name: docops-gc
description: |
  Garbage collection for resolved gaps, stale evidence, and redundant content.
  Use when: cleaning gaps, checking evidence freshness, detecting duplicates.
  Triggers: /docops-gc, clean gaps, stale evidence, redundant docs.
argument-hint: "[docRoot] [--dry-run]"
allowed-tools: Read, Edit, Write, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/reference/conveyor-gaps.md"
  - "**/reference/code-evidence/**"
---

# DocOps GC (Garbage Collection)

## Purpose
Clean up resolved gaps, validate evidence freshness, and detect redundant content.

## Detection Patterns

### Resolved Gaps
```markdown
# Patterns indicating resolved gaps in conveyor-gaps.md
| GAP-XXX | ... | ... | ... | ... | done |
| GAP-XXX | ... | ... | ... | ... | resolved |
| CONFLICT-XXX | ... | ... | ... | ... | done |
```

### Stale Evidence
```yaml
# Frontmatter to check
last_verified: YYYY-MM-DD  # >30 days = stale
```

```bash
# File modification check
find reference/code-evidence -mtime +30 -name "*.md"
```

### Redundant Content
```markdown
# Compare heading structures between files
## 1. What it is
## 2. Responsibilities
## 3. Inputs & Outputs
# If >70% headings match, flag as potential duplicate
```

## Workflow

1. **Analyze gaps** - Separate resolved from active
2. **Check evidence** - Validate freshness dates
3. **Detect redundancy** - Compare document structures
4. **Fix links** - Update broken references
5. **Archive resolved** - Move to archive section
6. **Report** - Summary with recommendations

## Gap Archive Format

```markdown
## Resolved (Archive)

| ID | Description | Resolved Date | Resolution |
|---|---|---|---|
| GAP-001 | Description | 2026-02-03 | How it was resolved |
```

## Evidence Freshness Status

| Age | Status | Action |
|-----|--------|--------|
| 0-30 days | fresh | None |
| 31-60 days | stale | Warning in frontmatter |
| 61+ days | expired | Add to conveyor-gaps.md |

## Rules
- Never delete unresolved gaps
- Keep last 20 resolved items for audit trail
- Flag redundancy but don't auto-merge
- Preserve information, consolidate structure

---
name: lifecycle
description: |
  Manage complete documentation lifecycle: deprecation, restoration, and archival.
  Use when: managing doc status, checking pending deprecations, restoring archived docs.
  Triggers: /docops:undeprecate, /docops:restore, lifecycle management, doc status.
argument-hint: "<action> <file> [options]"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/archive/**"
  - "**/reference/conveyor-gaps.md"
---

# DocOps Lifecycle Management

## Purpose
Manage the complete documentation lifecycle from creation to archival and restoration.

## Document States

```
┌──────────┐     ┌────────────┐     ┌──────────┐
│  draft   │────>│   active   │────>│deprecated│
└──────────┘     └────────────┘     └──────────┘
                       ^                  │
                       │                  │ grace period
                       │                  v
                 ┌─────┴─────┐     ┌──────────┐
                 │ restored  │<────│ archived │
                 └───────────┘     └──────────┘
```

## State Transitions

| From | To | Command | Automatic |
|------|-----|---------|-----------|
| draft | active | (manual edit) | No |
| active | deprecated | `/docops:deprecate` | No |
| deprecated | active | `/docops:undeprecate` | No |
| deprecated | archived | `/docops:prune` | Yes (after grace) |
| archived | active | `/docops:restore` | No |

## Archive Directory Structure

```
{docRoot}/
  archive/
    2026-01/
      auth.spec.md
      old-api.ref.md
    2026-02/
      legacy-deploy.howto.md
    index.md          # Archive index with metadata
```

## Archive Index Format

```markdown
# Archive Index

## 2026-02

| File | Original Location | Archived On | Reason |
|------|-------------------|-------------|--------|
| legacy-deploy.howto.md | howto/deploy.howto.md | 2026-02-15 | Replaced by k8s-deploy.howto.md |

## 2026-01

| File | Original Location | Archived On | Reason |
|------|-------------------|-------------|--------|
| auth.spec.md | specs/auth.spec.md | 2026-01-20 | Superseded by auth-v2.spec.md |
```

## Deprecation Log Format

File: `.claude/docops:deprecations.log`

```
2026-02-03T10:30:00Z DEPRECATE specs/auth.spec.md reason="Superseded by v2" archive_on=2026-03-05 by=agent
2026-02-10T14:15:00Z UNDEPRECATE specs/auth.spec.md reason="Still needed" by=human
2026-03-05T00:00:00Z ARCHIVE specs/old.spec.md to=archive/2026-03/old.spec.md by=auto
2026-03-10T09:00:00Z RESTORE archive/2026-03/old.spec.md to=specs/old.spec.md reason="Needed for audit" by=human
```

## Pending Deprecations Check

To list pending deprecations:

```bash
# Find all deprecated files
grep -r "status: deprecated" docs/ --include="*.md" -l

# Find files past archive date
# (implemented in docops-prune)
```

## Restoration Conflict Resolution

| Scenario | Action |
|----------|--------|
| Original path empty | Restore to original |
| Original path exists (same content) | Skip, remove archive |
| Original path exists (different) | Ask user |
| Original path structure changed | Restore to closest match |

## Rules
- Never auto-archive ADRs (historical record)
- Always log state transitions
- Keep archive for minimum 90 days before hard delete
- Restoration preserves all history in frontmatter

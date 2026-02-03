---
name: docops-deprecate
description: |
  Mark documentation for deprecation with grace period and scheduled archival.
  Use when: retiring docs, replacing with new version, scheduling removal.
  Triggers: /docops-deprecate, deprecate doc, retire documentation, schedule archival.
argument-hint: "<file> [--days N] [--reason 'text']"
allowed-tools: Read, Edit, Write, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/specs/**"
  - "**/reference/**"
---

# DocOps Deprecate

## Purpose
Mark documentation for deprecation with configurable grace period before archival.

## Deprecation Lifecycle

```
         /deprecate
[active] ─────────────> [deprecated] ─────────────> [archived]
    ^                        │         grace period      │
    │                        │                           │
    │    /undeprecate        │                           │
    └────────────────────────┘                           │
    ^                                                    │
    │                    /restore                        │
    └────────────────────────────────────────────────────┘
```

## Frontmatter Fields

### Deprecated Status
```yaml
---
status: deprecated
deprecated_on: 2026-02-03
deprecated_by: agent | human
deprecation_reason: "Reason for deprecation"
archive_on: 2026-03-05
replacement: "path/to/replacement.md"
---
```

### Archived Status
```yaml
---
status: archived
archived_on: 2026-03-05
archived_from: specs/original-name.spec.md
archive_reason: "Grace period expired"
---
```

## Deprecation Banner Template

```markdown
> [!WARNING]
> **This document is DEPRECATED** and will be archived on {archive_on}.
> Reason: {deprecation_reason}
> Replacement: [{replacement}]({replacement})
```

## Reference Marking

When a doc is deprecated, update linking documents:

```markdown
<!-- Before -->
See [Authentication](specs/auth.spec.md) for details.

<!-- After -->
See [Authentication](specs/auth.spec.md) [DEPRECATED] for details.
```

## Gap Entry Format

```markdown
| DEP-001 | Scheduled: {filename} | - | - | scheduled deprecation | archive on {date} |
```

## Grace Period Defaults

| Document Type | Default Grace Period |
|---------------|---------------------|
| SPEC | 30 days |
| REF | 30 days |
| HOWTO | 14 days |
| RUNBOOK | 7 days |
| ADR | Never (archive manually) |

## Rules
- Always provide replacement when available
- Grace period minimum: 7 days
- ADRs should never be auto-archived (historical record)
- Update all references before archival

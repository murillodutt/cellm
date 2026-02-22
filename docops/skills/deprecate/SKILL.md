---
name: deprecate
description: Mark documentation for deprecation with configurable grace period before archival. Adds deprecation banner, updates references, and schedules archive date based on document type.
argument-hint: "<file> [--days N] [--reason 'text']"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/specs/**"
  - "**/reference/**"
---

Mark a document as **deprecated** with a grace period before automatic archival. Add deprecation banner, update `status: deprecated` in frontmatter, and mark references with `[DEPRECATED]`.

## Lifecycle

```
         /deprecate                    grace period
[active] ──────────> [deprecated] ──────────────> [archived]
    ^                     │                            │
    │   /undeprecate      │         /restore           │
    └─────────────────────┘────────────────────────────┘
```

## Frontmatter

```yaml
status: deprecated
deprecated_on: 2026-02-03
deprecated_by: agent | human
deprecation_reason: "Reason"
archive_on: 2026-03-05
replacement: "path/to/replacement.md"
```

## Grace Period Defaults

| Document Type | Grace Period |
|---------------|-------------|
| SPEC | 30 days |
| REF | 30 days |
| HOWTO | 14 days |
| RUNBOOK | 7 days |
| ADR | Never (manual only) |

## NEVER

- **Skip the deprecation banner** — always add `> [!WARNING]` block at top
- **Auto-archive ADRs** — ADRs are historical record, archive only manually
- **Grace period < 7 days** — minimum grace period is 7 days
- **Deprecate without replacement** — always provide replacement path when available
- **Forget references** — update all linking documents with `[DEPRECATED]` marker

---
name: deprecate
description: Mark documentation for deprecation with grace period and scheduled archival.
usage: /docops:deprecate <file> [--days N] [--reason "text"]
arguments:
  - name: file
    description: File path to deprecate (relative to docRoot)
    required: true
  - name: --days
    description: Grace period in days before archival (default 30)
    required: false
  - name: --reason
    description: Reason for deprecation
    required: false
agent: docops-writer
budget: ~150
---

# DocOps Deprecate

## Goal
Mark documentation for deprecation with a grace period, allowing stakeholders to migrate before archival.

## Rules
- Deprecation is reversible during grace period.
- Grace period default: 30 days (configurable).
- Notifications added to file header.
- Scheduled archival tracked in `conveyor-gaps.md`.

## Deprecation Lifecycle

```
[active] --(/deprecate)--> [deprecated] --(grace period)--> [archived]
    ^                           |
    |                           |
    +-----(/undeprecate)--------+
```

## Steps

1) Validate file
- Check file exists in docRoot.
- Check file is not already deprecated or archived.

2) Update frontmatter
- Set `status: deprecated`.
- Add `deprecated_on: YYYY-MM-DD`.
- Add `deprecated_by: <user|agent>`.
- Add `deprecation_reason: <reason>`.
- Add `archive_on: YYYY-MM-DD` (current + grace days).

3) Add deprecation banner
- Insert visible warning at top of document.
- Include reason and archive date.

4) Update references
- Find all docs linking to this file.
- Add `[DEPRECATED]` marker to links.

5) Create gap entry
- Add to `conveyor-gaps.md` as scheduled deprecation.
- Classification: `scheduled deprecation`.
- Action: `archive on YYYY-MM-DD`.

6) Notify
- Log deprecation to `.claude/docops-deprecations.log`.
- Include file, reason, dates.

## Output
- File marked as deprecated with banner.
- Gap entry for tracking.
- References marked.

## Frontmatter After Deprecation

```yaml
---
status: deprecated
deprecated_on: 2026-02-03
deprecated_by: agent
deprecation_reason: "Superseded by auth-v2.spec.md"
archive_on: 2026-03-05
replacement: "specs/auth-v2.spec.md"
---
```

## Deprecation Banner

```markdown
> [!WARNING]
> **This document is DEPRECATED** and will be archived on 2026-03-05.
> Reason: Superseded by auth-v2.spec.md
> Replacement: [auth-v2.spec.md](specs/auth-v2.spec.md)
```

## Gap Entry Format

```markdown
| DEP-001 | Scheduled: auth.spec.md | - | - | scheduled deprecation | archive on 2026-03-05 |
```

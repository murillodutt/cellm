---
description: Mark documentation for deprecation with configurable grace period before archival. Adds deprecation banner, updates references, and schedules archive date based on document type.
user-invocable: true
argument-hint: "<file> [--days N] [--reason 'text']"
---

## Decision Framework

- Determine doc type (SPEC/REF/HOWTO/RUNBOOK/ADR) from filename suffix
- Use grace period based on type, override with `--days N`
- ADRs: manual-only, never auto-archive
- Require replacement path if available

## Process

1. Add `> [!WARNING]` deprecation banner at top
2. Set frontmatter: `status: deprecated`, `deprecated_on`, `deprecated_by`, `deprecation_reason`, `archive_on`, `replacement`
3. Update all linking documents: add `[DEPRECATED]` marker next to links
4. Calculate archive_on: today + grace period

Grace periods: SPEC 30d, REF 30d, HOWTO 14d, RUNBOOK 7d, ADR never.

## NEVER

- **Skip the banner** — always add `> [!WARNING]` at top
- **Auto-archive ADRs** — manual only
- **Grace period < 7 days** — 7d minimum
- **Deprecate without replacement** — provide path when available
- **Forget reference updates** — mark all links with `[DEPRECATED]`

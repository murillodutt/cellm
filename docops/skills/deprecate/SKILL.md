---
description: "Docops: mark documentation for deprecation with configurable grace period before archival. Adds deprecation banner, updates references, schedules archive date. Use when: 'deprecate this doc', 'mark for removal'."
user-invocable: true
argument-hint: "<file> [--days N] [--reason 'text']"
---

# Deprecate

Mark documentation for deprecation with grace period before archival.

## Intent

- Apply deprecation state to a document: add banner, set frontmatter fields, schedule archive date.
- Update all documents that link to the deprecated file so they reflect its deprecated status.

## Policy

- `context_preflight` mandatory before execution (`flow='generic'`).
- Respect active directives; do not destroy documentation referenced by active directives.
- Determine doc type (SPEC/REF/HOWTO/RUNBOOK/ADR) from filename suffix.
- Use grace period based on type, override with `--days N`. Grace periods: SPEC 30d, REF 30d, HOWTO 14d, RUNBOOK 7d, ADR never.
- ADRs: manual-only, never auto-archive.
- Require replacement path if available.
- Record outcomes via `context_record_outcome` after execution.

## Routing

1. Run `context_preflight` with `flow='generic'`; block execution if preflight fails.
2. Determine doc type from filename suffix; resolve grace period (type default or `--days N`).
3. Verify target file exists; fail with clear message if not found.
4. Add `> [!WARNING]` deprecation banner at top of file.
5. Set frontmatter: `status: deprecated`, `deprecated_on`, `deprecated_by`, `deprecation_reason`, `archive_on`, `replacement`.
6. Calculate `archive_on`: today + grace period (minimum 7 days).
7. Update all linking documents: add `[DEPRECATED]` marker next to links pointing to this file.
8. Emit outcome via `context_record_outcome`.

## NEVER

- **Skip the banner** — always add `> [!WARNING]` at top
- **Auto-archive ADRs** — manual only
- **Grace period < 7 days** — 7d minimum
- **Deprecate without replacement** — provide path when available
- **Forget reference updates** — mark all links with `[DEPRECATED]`

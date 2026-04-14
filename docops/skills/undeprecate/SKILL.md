---
description: "Docops: reverse a deprecation, restoring a document from deprecated to active status. Removes deprecation banner, clears frontmatter, updates references. Use when: 'undeprecate', 'reverse deprecation', 'reactivate doc'."
cellm_scope: universal
user-invocable: true
argument-hint: "<file>"
---

# Undeprecate

Reverse a deprecation, restoring a document from deprecated to active status.

## Intent

- Remove all deprecation markers from a document and restore it to active state.
- Clean up all linking documents by removing `[DEPRECATED]` markers they carry.

## Policy

- `context_preflight` mandatory before execution (`flow='generic'`).
- Respect active directives; do not destroy documentation referenced by active directives.
- Only operates on files with `status: deprecated`; archived files must use `/docops:restore` instead.
- Every state change must be logged to `.claude/docops:deprecations.log`.
- Record outcomes via `context_record_outcome` after execution.

## Routing

1. Run `context_preflight` with `flow='generic'`; block execution if preflight fails.
2. Verify `status: deprecated` in target file frontmatter; fail with clear message if not deprecated.
3. Remove deprecation frontmatter fields: `deprecated_on`, `deprecated_by`, `deprecation_reason`, `archive_on`.
4. Set `status: active` in frontmatter.
5. Remove `> [!WARNING]` deprecation banner from the document body.
6. Scan all linking documents and remove `[DEPRECATED]` markers next to links pointing to this file.
7. Log transition (`[deprecated] -> [active]`) to `.claude/docops:deprecations.log`.
8. Emit outcome via `context_record_outcome`.

## NEVER

- **Undeprecate archived files** — use `/docops:restore` instead
- **Skip reference cleanup** — remove all `[DEPRECATED]` markers
- **Skip logging** — log every state change

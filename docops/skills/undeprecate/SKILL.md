---
description: Reverse a deprecation, restoring a document from deprecated status back to active. Removes deprecation banner, clears deprecation frontmatter, and updates references.
user-invocable: true
argument-hint: "<file>"
---

## Process

1. Verify `status: deprecated` in target file; fail if not deprecated
2. Remove fields: `deprecated_on`, `deprecated_by`, `deprecation_reason`, `archive_on`
3. Set `status: active`
4. Remove `> [!WARNING]` banner
5. Remove `[DEPRECATED]` markers from all linking documents
6. Log to `.claude/docops:deprecations.log`

Transition: `[deprecated] -> [active]`

## NEVER

- **Undeprecate archived files** — use `/docops:restore`
- **Skip reference cleanup** — remove all `[DEPRECATED]` markers
- **Skip logging** — log every state change

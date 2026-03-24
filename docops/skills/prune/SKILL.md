---
description: "Docops: archive or remove deprecated documentation, broken references, and orphaned files. Scans for deprecated frontmatter, validates links, identifies unreferenced files. Use when: 'prune docs', 'remove orphans', 'clean dead references'."
user-invocable: true
argument-hint: "[docRoot] [--dry-run]"
---

# Prune

Archive or remove deprecated documentation, broken references, and orphaned files.

## Intent

- Scan the documentation tree and identify candidates for removal: deprecated files, broken links, orphaned files.
- Archive (not delete) deprecated candidates after user confirmation, keeping documentation set clean.

## Policy

- `context_preflight` mandatory before execution (`flow='generic'`).
- Respect active directives; do not destroy documentation referenced by active directives.
- Always run dry-run preview before making any changes; never act without showing what will happen.
- Archive is the default action. Delete only if explicitly requested by the user.
- Record outcomes via `context_record_outcome` after execution.

## Routing

1. Run `context_preflight` with `flow='generic'`; block execution if preflight fails.
2. Scan all candidates and classify:
   - **Deprecated**: `status: deprecated` or `status: obsolete` in frontmatter.
   - **Broken references**: `[text](path.md)` links pointing to non-existent files.
   - **Orphaned files**: evidence not referenced by any SPEC/REF; specs not linked from `index.md`.
3. Show dry-run preview of all candidates and proposed actions (always, even if `--dry-run` not passed).
4. Ask user confirmation before proceeding.
5. Archive deprecated files; update all broken links in place.
6. Log all actions to `conveyor-gaps.md`.
7. Emit outcome via `context_record_outcome`.

## NEVER

- **Execute without preview** — always dry-run first
- **Delete by default** — archive only; delete on explicit request
- **Leave dangling references** — update all links when moving files
- **Skip logging** — log all actions to conveyor-gaps.md

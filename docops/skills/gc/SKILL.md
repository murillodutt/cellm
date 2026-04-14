---
description: "Docops: garbage collection for resolved gaps, stale evidence, and redundant content. Scans conveyor-gaps.md, validates freshness, detects duplicates, archives cleaned items. Use when: 'gc docs', 'clean gaps', 'garbage collect documentation'."
cellm_scope: universal
user-invocable: true
argument-hint: "[docRoot] [--dry-run]"
---

# GC

Garbage collection for resolved gaps, stale evidence, and redundant content.

## Intent

- Clean up `conveyor-gaps.md` by separating resolved gaps from active ones and archiving them.
- Validate evidence freshness, detect structural redundancy, and fix broken internal references.

## Policy

- `context_preflight` mandatory before execution (`flow='generic'`).
- Respect active directives; do not destroy documentation referenced by active directives.
- Always preview before destructive actions; never skip dry-run.
- Archive only gaps marked `done` or `resolved`; never touch unresolved gaps.
- Do not auto-merge redundant docs — flag and report only.
- Record outcomes via `context_record_outcome` after execution.

## Routing

1. Run `context_preflight` with `flow='generic'`; block execution if preflight fails.
2. Separate resolved (`done`/`resolved`) from active gaps in `conveyor-gaps.md`.
3. Check evidence freshness: 0-30d fresh, 31-60d stale, 61d+ expired.
4. Detect redundancy: >70% structural match (Jaccard on headings) = flag for review.
5. Fix broken internal references in documentation files.
6. Preview all proposed changes (dry-run); ask for confirmation.
7. Archive resolved gaps to `## Resolved (Archive)`, keep last 20 for audit trail.
8. Report counts and recommendations.
9. Emit outcome via `context_record_outcome`.

## NEVER

- **Delete unresolved gaps** — archive only `done` or `resolved`
- **Auto-merge redundant docs** — flag and report only
- **Discard content** — preserve all, consolidate structure only
- **Skip dry-run** — always preview before destructive actions

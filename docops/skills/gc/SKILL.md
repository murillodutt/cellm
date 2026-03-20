---
description: "Docops: garbage collection for resolved gaps, stale evidence, and redundant content. Scans conveyor-gaps.md, validates freshness, detects duplicates, archives cleaned items. Use when: 'gc docs', 'clean gaps', 'garbage collect documentation'."
user-invocable: true
argument-hint: "[docRoot] [--dry-run]"
---

## Workflow

1. Separate resolved (`done`/`resolved`) from active gaps in conveyor-gaps.md
2. Check evidence: 0-30d fresh, 31-60d stale, 61d+ expired
3. Detect redundancy: >70% structural match = flag for review
4. Fix broken internal references
5. Archive resolved gaps to `## Resolved (Archive)`, keep last 20 for audit
6. Report counts and recommendations

## NEVER

- **Delete unresolved gaps** — archive only `done` or `resolved`
- **Auto-merge redundant docs** — flag and report only
- **Discard content** — preserve all, consolidate structure only
- **Skip dry-run** — always preview before destructive actions

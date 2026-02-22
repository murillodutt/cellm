---
name: gc
description: Garbage collection for resolved gaps, stale evidence, and redundant content. Scans conveyor-gaps.md for resolved entries, validates evidence freshness, detects structural duplicates, and archives cleaned items.
argument-hint: "[docRoot] [--dry-run]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/reference/conveyor-gaps.md"
  - "**/reference/code-evidence/**"
---

Clean up **resolved gaps**, validate **evidence freshness**, and detect **redundant content**. Archive resolved items, flag stale evidence, and report structural duplicates.

## Workflow

1. **Analyze gaps** — separate resolved (`done`/`resolved`) from active in conveyor-gaps.md
2. **Check evidence** — validate freshness dates (0-30d fresh, 31-60d stale, 61d+ expired)
3. **Detect redundancy** — compare document heading structures (>70% match = flag)
4. **Fix links** — update broken internal references
5. **Archive resolved** — move to `## Resolved (Archive)` section, keep last 20 for audit trail
6. **Report** — summary with counts and recommendations

## NEVER

- **Delete unresolved gaps** — only archive gaps marked `done` or `resolved`
- **Auto-merge redundant docs** — flag and report, never auto-merge
- **Discard information** — preserve content, consolidate structure
- **Skip dry-run** — always preview before executing destructive actions

---
name: sync
description: Refresh code evidence, gaps, and derived documentation. Updates evidence files first, then conveyor-gaps with conflicts, then propagates to SPECs/REFs/HOWTOs/RUNBOOKs.
argument-hint: "[docRoot]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/reference/code-evidence/**"
---

Keep documentation aligned with code using **evidence-first updates**. Always update evidence before derived docs.

## Workflow

1. Update `reference/code-evidence/` from source code
2. Update `reference/conveyor-gaps.md` with conflicts found
3. Update derived docs (SPEC/REF/HOWTO/RUNBOOK) from evidence

## NEVER

- **Change source of truth silently** — always log drift in conveyor-gaps.md
- **Update derived docs before evidence** — evidence first, always
- **Skip evidence links** — all updates must link back to evidence files

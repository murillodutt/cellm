---
description: Refresh code evidence, gaps, and derived documentation. Updates evidence files first, then conveyor-gaps with conflicts, then propagates to SPECs/REFs/HOWTOs/RUNBOOKs.
user-invocable: true
argument-hint: "[docRoot]"
---

## Order (Evidence-First)

1. Update `reference/code-evidence/` from source code
2. Update `reference/conveyor-gaps.md` with conflicts found
3. Update derived docs (SPEC/REF/HOWTO/RUNBOOK) from evidence

Always evidence first. Log drift to conveyor-gaps.md. Link all updates back to evidence.

## NEVER

- **Change source of truth silently** — log all drift
- **Update derived before evidence** — evidence first
- **Skip evidence links** — all updates must link evidence

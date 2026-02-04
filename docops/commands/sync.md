---
description: Refresh code evidence, gaps, and derived documentation
argument-hint: "[docRoot]"
---

# DocOps Sync

## Goal
Keep documentation aligned with code using evidence-first updates.

## Rules
- Update **code evidence** first.
- Then update **derived docs** (SPEC/REF/HOWTO/RUNBOOK).
- Register conflicts in `reference/conveyor-gaps.md`.
- If code contradicts the conveyor, do NOT change silently.

## Steps
1) Resolve config
- Read `.claude/docops.json` or use defaults.

2) Update code evidence
- Rebuild files under `reference/code-evidence/`:
  - CLI
  - ENV
  - Events
  - Logging/Tracing
  - Ports/Paths
- Each item MUST include “where in code”.

3) Compare with conveyor
- Detect GAPS and CONFLICTS.
- Update `reference/conveyor-gaps.md` with classification and action.

4) Update derived docs
- SPECs and REFs MUST link to:
  - Source of truth (`<conveyorFile>`)
  - Code evidence (when factual)

5) Report
- Summarize files touched and gaps detected.

## Output
- Evidence refreshed and docs aligned.

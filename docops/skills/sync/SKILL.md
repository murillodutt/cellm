---
description: "Docops: refresh code evidence, gaps, and derived documentation. Updates evidence first, then conveyor-gaps, then propagates to SPECs/REFs/HOWTOs/RUNBOOKs. Use when: 'sync docs', 'refresh evidence', 'update documentation chain'."
user-invocable: true
argument-hint: "[docRoot]"
---

# Sync

Refresh code evidence, gaps, and derived documentation in evidence-first order.

## Intent

- Keep the documentation chain current by re-extracting code evidence and propagating changes upward.
- Detect and log drift between source code and derived documentation.

## Policy

- `context_preflight` recommended but failure does NOT block execution; if preflight fails, warn and proceed without context.
- Evidence must always be updated before derived documentation — never invert the order.
- All drift detected during sync must be logged to `conveyor-gaps.md`.
- All derived document updates must link back to the evidence that drove them.
- Write-back to `conveyor-gaps.md` is mandatory after sync (write-back required).

## Routing

1. Run `context_preflight` with `flow='generic'`; if it fails, log a warning and continue without context (do not block).
2. Update `reference/code-evidence/` from current source code (evidence-first).
3. Compare evidence to existing `reference/conveyor-gaps.md`; log newly detected conflicts and drift.
4. Update derived documentation (SPEC/REF/HOWTO/RUNBOOK) from updated evidence; link all updates back to the evidence file.
5. Write updated `conveyor-gaps.md` (mandatory write-back).
6. Emit outcome via `context_record_outcome`.

## NEVER

- **Change source of truth silently** — log all drift
- **Update derived before evidence** — evidence first
- **Skip evidence links** — all updates must link evidence

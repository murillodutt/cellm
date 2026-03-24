---
description: "Docops: validate and maintain freshness status of code evidence files. Checks last_verified dates, transitions fresh/stale/expired, creates gaps for expired evidence. Use when: 'check freshness', 'stale evidence', 'validate dates'."
user-invocable: true
argument-hint: "[docRoot] [--update]"
---

# Freshness

Validate and maintain freshness status of code evidence files.

## Intent

- Scan evidence files, evaluate `last_verified` dates against freshness thresholds, and transition statuses accordingly.
- Create `conveyor-gaps.md` entries for expired evidence so drift is tracked.

## Policy

- `context_preflight` optional; skip if unavailable, proceed regardless.
- Never auto-verify evidence — only change status fields; marking verified requires human re-scanning of code.
- Human verification always takes precedence over automated status transitions.
- Without `--update`, operate in report-only mode; with `--update`, apply status transitions.

## Routing

1. Optionally run `context_preflight` with `flow='generic'`; proceed whether it succeeds or not.
2. Scan all evidence files in `reference/code-evidence/`.
3. Evaluate each file against freshness thresholds based on `last_verified` date:
   - Fresh: 0-30d old.
   - Stale: 31-60d old — add `stale_since` field.
   - Expired: 61d+ old (or no `last_verified`) — add `expired_since` field, create GAP entry in `conveyor-gaps.md`.
4. For re-verified files (when `--update` and human provides fresh date): remove `stale_since`/`expired_since`, update `last_verified`.
5. Report status summary: counts per tier, list of expired files needing attention.

## NEVER

- **Auto-verify** — only change status, never mark verified without re-scanning code
- **Delete expired evidence** — flag it only
- **Override human verification** — human takes precedence
- **Skip gap creation** — expired evidence gets GAP entry

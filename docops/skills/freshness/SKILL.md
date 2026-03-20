---
description: "Docops: validate and maintain freshness status of code evidence files. Checks last_verified dates, transitions fresh/stale/expired, creates gaps for expired evidence. Use when: 'check freshness', 'stale evidence', 'validate dates'."
user-invocable: true
argument-hint: "[docRoot] [--update]"
---

## Status Transitions

- Fresh: 0-30d old
- Stale: 31-60d old (add `stale_since`)
- Expired: 61d+ old (add `expired_since`, create GAP entry)
- No `last_verified`: expired by default

## Process

1. Scan all evidence files
2. Transition status based on `last_verified` date
3. For expired: add field, create conveyor-gaps.md entry
4. For re-verified: remove stale/expired fields, update `last_verified`

## NEVER

- **Auto-verify** — only change status, never mark verified without re-scanning code
- **Delete expired evidence** — flag it
- **Override human verification** — human takes precedence
- **Skip gap creation** — expired evidence gets GAP entry

---
name: freshness
description: Validate and maintain freshness status of code evidence files. Checks last_verified dates, transitions status between fresh/stale/expired, and creates gaps for expired evidence.
argument-hint: "[docRoot] [--update]"
paths:
  - "**/.claude/docops.json"
  - "**/reference/code-evidence/**"
  - "**/technical/reference/**"
---

Scan code evidence files for **freshness status** based on `last_verified` frontmatter. Transition status and create gaps for expired evidence.

## Status Transitions

```
[fresh] ---(30 days)---> [stale] ---(30 days)---> [expired]
   ^                                                  |
   +-------------(re-verification)--------------------+
```

| Current | New | Action |
|---------|-----|--------|
| fresh | stale | Add `stale_since` to frontmatter |
| stale | expired | Add `expired_since`, create GAP entry |
| expired | fresh | Remove stale/expired fields, update `last_verified` |
| (none) | expired | Add all fields, create GAP entry |

Files without `last_verified` are **expired by default**.

## NEVER

- **Auto-verify** — only update status, never mark as verified without re-scanning source code
- **Delete expired evidence** — flag it, don't remove it
- **Override human verification** — human verification takes precedence over agent verification
- **Skip gap creation** — every expired evidence must have a GAP entry in conveyor-gaps.md

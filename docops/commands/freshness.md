---
description: Check and update evidence freshness status across all code-evidence files
argument-hint: "[docRoot] [--update]"
---

# DocOps Freshness

## Goal
Validate and update the freshness status of code evidence files, ensuring documentation stays current with code changes.

## Rules
- Evidence without `last_verified` date is treated as `expired`.
- Freshness is calculated from `last_verified`, not file modification date.
- Status transitions: `fresh` -> `stale` -> `expired`.
- Expired evidence MUST be added to `conveyor-gaps.md`.

## Freshness Thresholds

| Age (days) | Status | Action Required |
|------------|--------|-----------------|
| 0-30 | fresh | None |
| 31-60 | stale | Warning, schedule review |
| 61+ | expired | Add to gaps, block dependent docs |

## Steps

1) Resolve config
- Read `.claude/docops.json` for `gcConfig.evidenceFreshnessDays`.
- Default thresholds: fresh=30, stale=60.

2) Scan evidence files
- List all files in `reference/code-evidence/*.md`.
- Parse frontmatter for `last_verified` and `status`.

3) Calculate freshness
- For each file, compute days since `last_verified`.
- Determine new status based on thresholds.

4) Generate report
```
Evidence Freshness Report
=========================
Fresh (0-30 days):  N files
Stale (31-60 days): N files  [!]
Expired (61+ days): N files  [-]

Stale files:
- env.md (45 days) - last verified: 2025-12-20

Expired files:
- cli.md (90 days) - last verified: 2025-11-05 [-]
```

5) Update status (if --update)
- Update `status` field in frontmatter.
- Add `stale_since` or `expired_since` date.
- For expired: add entry to `conveyor-gaps.md`.

6) Cross-reference check
- Verify SPECs/REFs linking to stale/expired evidence.
- Warn about docs relying on outdated evidence.

## Output
- Freshness status report.
- Updated frontmatter (if --update).
- New gaps for expired evidence.

## Evidence Freshness Frontmatter

```yaml
---
status: fresh | stale | expired
last_verified: 2026-01-15
stale_since: 2026-02-15      # Added when status becomes stale
expired_since: 2026-03-15    # Added when status becomes expired
verified_by: agent | human
---
```

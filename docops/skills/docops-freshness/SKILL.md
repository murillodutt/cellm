---
name: docops-freshness
description: |
  Check and update evidence freshness status across code-evidence files.
  Use when: validating evidence currency, checking stale docs, updating verification dates.
  Triggers: /docops-freshness, stale evidence, outdated docs, verification check.
argument-hint: "[docRoot] [--update]"
allowed-tools: Read, Edit, Write, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/reference/code-evidence/**"
  - "**/technical/reference/**"
---

# DocOps Freshness

## Purpose
Validate and maintain freshness status of code evidence files.

## Freshness Calculation

```javascript
// Pseudocode for freshness calculation
function calculateFreshness(lastVerified, config) {
  const daysSince = daysBetween(lastVerified, today());
  const freshDays = config.evidenceFreshnessDays || 30;
  const staleDays = freshDays * 2; // 60 days default

  if (daysSince <= freshDays) return 'fresh';
  if (daysSince <= staleDays) return 'stale';
  return 'expired';
}
```

## Detection Patterns

### Frontmatter to Parse
```yaml
---
status: fresh | stale | expired
last_verified: YYYY-MM-DD
verified_by: agent | human
---
```

### Missing Verification
```markdown
# Files without last_verified are EXPIRED by default
# Pattern to detect:
^---\n(?!.*last_verified).*\n---
```

## Status Transitions

```
[fresh] ---(30 days)---> [stale] ---(30 days)---> [expired]
   ^                                                  |
   |                                                  |
   +-------------(re-verification)--------------------+
```

## Update Actions

| Current | New | Action |
|---------|-----|--------|
| fresh | stale | Add `stale_since` |
| stale | expired | Add `expired_since`, create GAP |
| expired | fresh | Remove stale/expired fields, update `last_verified` |
| (none) | expired | Add all fields, create GAP |

## Gap Entry Format

```markdown
| GAP-XXX | Expired evidence: {filename} | {filename} | Evidence | evidence expired | reverify |
```

## Rules
- Never auto-verify; only update status
- Verification requires re-scanning source code
- Human verification overrides agent verification
- Expired evidence blocks dependent doc updates

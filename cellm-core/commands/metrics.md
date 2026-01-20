---
id: CMD-METRICS
version: v1.1.0
status: OK
command: metrics
agent: project-manager
budget: ~300 tokens
---

# /metrics

## Subcommands

### /metrics show

Displays consolidated pattern metrics.

```text
PATTERN METRICS (last 30 days)
────────────────────────────────────────────

TOP HITS
  TS-001: 45 hits  │ Avoid any
  VU-003: 38 hits  │ Composition API
  NX-002: 32 hits  │ useAsyncData with key

TOP PREVENTS
  ANTI-001: 62 prevents │ any blocked
  ANTI-002: 28 prevents │ hardcode color blocked

STALE (> 6 months without hit)
  [!] DR-005: Query pagination
  [!] ST-003: Webhook retry

────────────────────────────────────────────
COVERAGE: 78% │ PREVENTION: 84%
```

### /metrics sync

Synchronizes metrics from the current session.

1. Read session/current.md
2. Extract hits and prevents
3. Update pattern frontmatter
4. Clear session

### /metrics report

Generates a report for quarterly review.

- Patterns without hits > 6 months → REVIEW
- High-hit patterns → Highlight
- Merge suggestions
- Proposed new patterns

## Automatic Collection

During the session, record in session/current.md:

```markdown
<metrics>
- hit: TS-001 (2x)
- hit: VU-003 (1x)
- prevent: ANTI-001 (3x)
</metrics>
```

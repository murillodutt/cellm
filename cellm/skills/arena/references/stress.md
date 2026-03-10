# Stress Mode — Reference

Multi-agent convergence testing for data-driven subsystems. Agents consume the target as end-users, rate coverage, fix gaps, and repeat until convergence.

## Input

`stress <target> [max-iterations]` — target is a known subsystem (`DSE`, `specs`, `knowledge`) or a custom scope. Default 6 iterations.

**Custom scope**: any directory path or module name. Arena will scan the target for MCP tools, API endpoints, or data stores to build a scenario pool. Example: `stress server/api/timeline 4` stress-tests the timeline API with 4 iterations. Custom scopes require at least one discoverable surface (MCP tool, REST endpoint, or DB table) — Arena will error if none are found.

## Framework

1. **Scope** — identify target, generate checklist file, build scenario pool
2. **Simulate** — parallel agents consume target via MCP tools only (no file reads)
3. **Triage** — L2-FIX (project, actionable) | L1-SKIP (framework handles) | ACCEPT (by design)
4. **Fix** — apply L2 fixes, reindex if applicable, commit after each fix phase
5. **Audit** — dedicated agent checks format compliance, broken references, schema
6. **Adversarial** — agent attempts contradictions, snapshot drift, edge cases
7. **Converge** — all three (simulate + audit + adversarial) clean in SAME iteration

## Checklist File

Auto-generated checklist tracking coverage targets, scores per iteration, gaps, and stack snapshot for drift detection. Location depends on project structure:

| Condition | Path | Rationale |
|-----------|------|-----------|
| `docs/audits/` exists | `{project-root}/docs/audits/stress-loop-{target}-{scope}.md` | Committable audit evidence |
| No `docs/audits/` | `~/.cellm/audits/stress-loop-{target}-{scope}.md` | Avoids intruding on external projects |

Detect project root via `git rev-parse --show-toplevel`.

## Stack Snapshot and Drift

Versions from `package.json` / `bun.lock` — NEVER from training data. When re-invoked on a CONVERGED target:

| Change | Action |
|--------|--------|
| Major bump | Full re-run |
| Minor bump | Targeted re-run on affected scenarios |
| Patch only | Skip |

## Simulation Scoring

Agents fill a rubric per scenario:
- Entity exists with ATOM decisions: +1
- Entity exists but thin: +0.5
- In top-3 search results: +0.5
- Missing from target: -2

Score = (sum / max) * 10. All scenarios >= 7/10 required.

## Fix Phase Rules

Before spawning fix agents, declare:
```
FILES TO EDIT: {list}
STRATEGY: SEQUENTIAL | PARTITIONED
```

Multiple agents on SAME file = SEQUENTIAL only. Different files = parallel OK.

## Convergence Criteria

All three in the SAME iteration:
1. Simulation: all >= 7/10, no new L2 gaps
2. Audit: zero format violations
3. Adversarial: zero contradictions, zero snapshot drift

Max 6 iterations without user checkpoint.

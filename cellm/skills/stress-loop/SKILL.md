---
description: Multi-agent stress testing loop for any CELLM subsystem. Spawns parallel agents that consume a target (DSE, specs, knowledge), rate coverage, extract gaps, fix, and repeat until convergence. Use when auditing completeness of any data-driven system.
user-invocable: true
---

# Stress Loop

Iterative multi-agent convergence testing. Agents consume the target system as end-users would, rate coverage, and surface gaps until no new L2 findings emerge.

## Framework

1. **Scope** — identify target system and scenario pool
2. **Simulate** — parallel agents consume target, each rates coverage 1-10 with findings
3. **Triage** — classify each finding: L2-FIX (project, actionable) | L1-SKIP (framework handles) | ACCEPT (by design)
4. **Fix** — apply L2 fixes, reindex if applicable
5. **Audit** — dedicated agent checks format compliance, broken references, vocabulary, schema
6. **Adversarial** — agent attempts contradictions, snapshot drift, edge cases
7. **Converge** — no new L2 gaps + audit clean + adversarial clean = DONE

## Target Detection

| Target | Auto-detect | Scenario Source |
|--------|-------------|-----------------|
| DSE | `dse_search` returns results | UI build scenarios (component, pattern, composition, token queries) |
| Specs | `spec_get_tree` has nodes | Task coverage, dependency ordering, state transitions |
| Knowledge | `knowledge_list` non-empty | Cross-reference accuracy, staleness, contradiction detection |
| Custom | User provides scope | User provides scenarios |

## Simulation Agents

Each agent receives:
- **Scenario**: A realistic task description (e.g., "Build a KPI card with semantic colors")
- **Constraint**: Consume ONLY the target system — no file reads, no external docs
- **Output**: `{ score: 1-10, gaps: string[], verdict: "PASS"|"GAP"|"BLOCKED" }`

Spawn 3-5 agents per batch. Batch size adapts: first batch = 5 broad scenarios, subsequent batches = 3 focused on prior gaps.

## Triage Rules

| Finding | Classification | Action |
|---------|---------------|--------|
| Missing project decision | L2-FIX | Add to target |
| Framework prop/slot docs | L1-SKIP | Framework MCP handles |
| Accessibility built-in | L1-SKIP | Nuxt UI handles |
| Intentional absence | ACCEPT | Document why |
| Format violation | L2-FIX | Rewrite to spec |
| Snapshot drift vs code | L2-FIX | Update snapshot |
| Contradiction between entries | L2-FIX | Resolve + rewrite |

## Convergence Criteria

All three must hold in the same iteration:
1. **Simulation**: All scenarios score >= 7/10, no new L2 gaps
2. **Audit**: Zero format violations, zero broken references
3. **Adversarial**: Zero contradictions, zero snapshot drift

## Reporting

After each iteration, output a convergence table:

```
| Iteration | Agents | New L2 Gaps | Audit | Adversarial | Status |
|-----------|--------|-------------|-------|-------------|--------|
| 1         | 5      | 12          | -     | -           | FIX    |
| 2         | 3      | 4           | 2     | -           | FIX    |
| 3         | 3      | 0           | 0     | 1           | FIX    |
| 4         | 3      | 0           | 0     | 0           | DONE   |
```

## NEVER

- Run simulation agents with access to source files — they consume ONLY the target system
- Classify framework documentation gaps as L2 — that is L1, always skip
- Auto-fix without triage — every finding gets classified before action
- Declare convergence with open L2 gaps — all three criteria must pass simultaneously
- Skip adversarial phase — contradictions hide in clean audits
- Run more than 6 iterations without user checkpoint — ask if scope needs narrowing

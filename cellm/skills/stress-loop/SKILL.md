---
description: Multi-agent stress testing loop for any CELLM subsystem. Spawns parallel agents that consume a target (DSE, specs, knowledge), rate coverage, extract gaps, fix, and repeat until convergence. Use when auditing completeness of any data-driven system.
user-invocable: true
argument-hint: "[target] [iterations] — e.g. DSE 5, specs 3, knowledge 4"
allowed-tools: Agent, Read, Edit, Write, Glob, Grep, Bash, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, mcp__plugin_cellm_cellm-oracle__dse_reindex, mcp__plugin_cellm_cellm-oracle__dse_discover, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_create_node, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__knowledge_list, mcp__plugin_cellm_cellm-oracle__knowledge_search, mcp__plugin_cellm_cellm-oracle__knowledge_get, mcp__plugin_cellm_cellm-oracle__search, mcp__plugin_cellm_cellm-oracle__record_observation
---

# Stress Loop

Iterative multi-agent convergence testing. Agents consume the target system as end-users would, rate coverage, and surface gaps until no new L2 findings emerge.

## Arguments

```
$ARGUMENTS
```

| Argument | Default | Example |
|----------|---------|---------|
| `$0` (target) | Auto-detect from available MCP tools | `DSE`, `specs`, `knowledge` |
| `$1` (max iterations) | `6` | `3`, `5`, `8` |

## Framework

1. **Scope** — identify target system, scenario pool, and archetype set
2. **Simulate** — parallel agents consume target, each rates coverage using the scoring rubric
3. **Triage** — classify each finding: L2-FIX (project, actionable) | L1-SKIP (framework handles) | ACCEPT (by design)
4. **Fix** — apply L2 fixes sequentially (one agent per file), reindex if applicable, then commit
5. **Audit** — dedicated agent checks format compliance, broken references, vocabulary, schema
6. **Adversarial** — agent attempts contradictions, snapshot drift, edge cases
7. **Converge** — BLOCKED until audit AND adversarial return clean in the SAME iteration as simulation

## Target Detection

| Target | Auto-detect | Scenario Source |
|--------|-------------|-----------------|
| DSE | `dse_search` returns results | Auto-generate from archetypes (see Scenario Generation) |
| Specs | `spec_get_tree` has nodes | Auto-generate from phases/task groups |
| Knowledge | `knowledge_list` non-empty | Cross-reference accuracy, staleness, contradiction detection |
| Custom | User provides scope | User provides scenarios |

## Scenario Generation

Auto-generate scenarios from target structure to reduce operator burden:

| Target | Strategy |
|--------|----------|
| DSE | For each archetype in preset (e.g., dashboard, content, chat-editor): generate 2 scenarios from component categories matching that archetype |
| Specs | For each phase in spec tree: generate 1 scenario per task group |
| Knowledge | For each category: generate 1 cross-reference query + 1 contradiction probe |

Re-test prompts MUST vary between iterations — same intent, different wording. This tests search robustness and prevents overfitting to specific phrasing.

```
Iteration N:   "Build a pricing page with 3 tiers and toggle for monthly/annual"
Iteration N+1: "I need to create a subscription pricing section with plan comparison"
```

## Simulation Agents

Each agent receives:
- **Scenario**: A realistic task description (e.g., "Build a KPI card with semantic colors")
- **Constraint**: Consume ONLY the target system — no file reads, no external docs
- **Output**: `{ score: number, gaps: string[], verdict: "PASS"|"GAP"|"BLOCKED" }`

Score uses the **Scoring Rubric** below — not subjective judgment.

Spawn 3-5 agents per batch. Batch size adapts: first batch = 5 broad scenarios, subsequent batches = 3 focused on prior gaps.

## Scoring Rubric

Scores must be reproducible. Two agents evaluating the same state produce the same number.

| Criteria | Points |
|----------|--------|
| Each stated requirement has a matching entity in target | +1 per requirement |
| Entity has ATOM decisions (intent + snapshot, not just a name) | +1 per entity |
| Cross-references between entities are valid and resolvable | +0.5 per valid ref |
| Search query returns the needed entity in top-3 results | +0.5 per query |
| Critical requirement missing entirely from target | -2 per missing |

```
score = (sum / max_possible) * 10, capped at 10
```

The agent MUST show the calculation, not just the final number.

## Fix Phase — Concurrency Rules

Fix agents MUST NOT edit the same file in parallel — concurrent edits to overlapping regions cause silent corruption. Choose one strategy per iteration:

| Strategy | When to use |
|----------|-------------|
| **Sequential** | Default. Agent 1 finishes, then agent 2 starts. Safest. |
| **File partitioning** | Multiple fix agents each own different files (e.g., agent 1 = tokens, agent 2 = patterns). Only when target has separate files. |

After ALL fixes in an iteration complete: **commit changes immediately**. State must survive context compaction — a lost fix means wasted work. Do not batch commits to the end of the loop.

## Quality Gate — Entity Inflation

Before declaring a fix complete, validate each NEW entity:

| Check | Pass condition |
|-------|---------------|
| Decision specificity | At least 1 decision chooses between alternatives (e.g., "UTabs, NOT horizontal nav") |
| Intent vs name | Decision contains INTENT beyond simply naming a component |
| Value-add | Entity provides information not already covered by framework defaults (L1) |

Entities that fail all three checks: reclassify as L1-SKIP and remove from target.

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

All three must hold in the SAME iteration — skipping audit or adversarial blocks convergence:

1. **Simulation**: All scenarios score >= 7/10 (per rubric), no new L2 gaps
2. **Audit**: Zero format violations, zero broken references
3. **Adversarial**: Zero contradictions, zero snapshot drift

If operator skips audit or adversarial, convergence cannot be declared. Status remains FIX.

## Reporting

After each iteration, output:

### Convergence Table

```
| Iteration | Agents | New L2 Gaps | Audit | Adversarial | Status |
|-----------|--------|-------------|-------|-------------|--------|
| 1         | 5      | 12          | -     | -           | FIX    |
| 2         | 3      | 4           | 2     | -           | FIX    |
| 3         | 3      | 0           | 0     | 1           | FIX    |
| 4         | 3      | 0           | 0     | 0           | DONE   |
```

### Diff Summary

After each iteration, include a delta report:

```
Entities:  before → after (+N new, -M removed)
Decisions: before → after (+N new, -M removed)
Gaps:      resolved N, new K, remaining R
Files:     list of changed files
Commit:    <hash>
```

## NEVER

- Run simulation agents with access to source files — they consume ONLY the target system
- Classify framework documentation gaps as L2 — that is L1, always skip
- Auto-fix without triage — every finding gets classified before action
- Declare convergence with open L2 gaps — all three criteria must pass simultaneously
- Skip adversarial phase — contradictions hide in clean audits
- Allow parallel fix agents to edit the same file — sequential or partitioned only
- Accept scores without visible rubric calculation — "vibes" scores are invalid
- Commit only at the end — commit after EVERY fix phase
- Run more than 6 iterations without user checkpoint — ask if scope needs narrowing

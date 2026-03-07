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

1. **Scope** — identify target system, generate checklist file, build scenario pool
2. **Simulate** — parallel agents consume target using the simulation prompt template
3. **Triage** — classify each finding: L2-FIX (project, actionable) | L1-SKIP (framework handles) | ACCEPT (by design)
4. **Fix** — apply L2 fixes following fix phase checklist, reindex if applicable, run post-fix validation, then commit
5. **Audit** — dedicated agent checks format compliance, broken references, vocabulary, schema
6. **Adversarial** — agent attempts contradictions, snapshot drift, edge cases
7. **Converge** — BLOCKED until audit AND adversarial return clean in the SAME iteration as simulation

## Checklist File — Auto-Generation

On first iteration, if no checklist file exists for this target, create one automatically. The file tracks coverage targets, scores per iteration, and gaps.

### Naming Convention

File name MUST reflect the target being stressed, not a generic name:

```
stress-loop-{target}-{scope}.md
```

| Target | Example File |
|--------|-------------|
| DSE against Nuxt UI | `stress-loop-dse-nuxt-ui.md` |
| DSE against Figma export | `stress-loop-dse-figma-export.md` |
| Specs for CellmOS | `stress-loop-specs-cellm-os.md` |
| Knowledge atoms | `stress-loop-knowledge-atoms.md` |
| Custom | `stress-loop-{user-provided-scope}.md` |

### Auto-Detection of Coverage Targets

| Target | How to detect coverage items | Source |
|--------|------------------------------|--------|
| DSE | List all components from the UI framework being used | Nuxt UI MCP `list-components`, or user-provided component list |
| Specs | List all nodes in spec tree | `spec_get_tree` |
| Knowledge | List all categories/tags | `knowledge_list` |

### Checklist File Structure

```markdown
# Stress Loop: {Target} — {Scope}

> **Purpose**: Coverage checklist for stress-loop against {scope}.
> **Created**: {date}
>
> **Status**: IN_PROGRESS | CONVERGED
> **Iterations**: {N}
> **Entities**: {count} | **Decisions**: {count} | **Chunks**: {count}
>
> | Scenario | Score | Verdict |
> |----------|-------|---------|
> | {name}   | X/10  | PASS    |
>
> **Gaps residuais**: {list or "none"}

## {Category} [{covered}/{total}]
- [x] Item — covered by {entity-id}
- [ ] Item — N/A (L1)
- [ ] Item — gap
```

### Update Rules

- Update the checklist file AFTER each iteration with new scores and coverage marks
- On convergence, change status to `CONVERGED` and record final metrics
- The checklist file is the **single source of truth** for loop progress across sessions

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

## Simulation Prompt Template

When spawning simulation agents, use this EXACT prompt structure. Do NOT improvise — the table IS the enforcement.

```
You are a stress-test agent. Use ONLY {TARGET_TOOLS} MCP tools. Do NOT read files.

Scenario: {SCENARIO}

For EACH requirement, search the target and fill this table:

| # | Requirement | Entity Found | Entity ID | Has ATOM Decisions | In Top-3 Search | Points |
|---|-------------|-------------|-----------|-------------------|-----------------|--------|
| 1 | {REQ}       |             |           |                   |                 |        |

Scoring:
- Entity exists with ATOM decisions (intent + snapshot): +1
- Entity exists but thin or no ATOM: +0.5
- Search returns entity in top-3 results: +0.5
- Requirement completely missing from target: -2

FINAL = (sum / max_possible) * 10, capped at 10

You MUST show the filled table and calculation. No table = invalid score.

Output:
SCORE: X/10 (show calculation)
VERDICT: PASS|GAP|BLOCKED
GAPS:
- [gap description]
```

Spawn 3-5 agents per batch. Batch size adapts: first batch = 5 broad scenarios, subsequent batches = 3 focused on prior gaps.

## Fix Phase — Pre-Launch Checklist

Before spawning ANY fix agent, the operator MUST write this in the response:

```
FILES TO EDIT: {list all files}
STRATEGY: SEQUENTIAL | PARTITIONED
PARTITION PLAN: {if partitioned, which agent owns which file}
```

| Rule | Enforcement |
|------|-------------|
| Multiple agents, SAME file | SEQUENTIAL only — agent 1 finishes, then agent 2 starts |
| Multiple agents, DIFFERENT files | Parallel OK — each agent owns its file exclusively |
| No checklist written | Protocol violation — do NOT launch agents |

After ALL fixes in an iteration complete: **commit changes immediately**. State must survive context compaction — a lost fix means wasted work.

## Post-Fix Validation

After fix agent completes, BEFORE committing, run this quality gate:

```bash
python3 -c "
import json, sys
d = json.load(open('{TARGET_FILE}'))
issues = []
for s in ('components','patterns','compositions'):
    for k,v in d.get(s,{}).items():
        decs = v.get('decisions',[])
        for dec in decs:
            if '(currently' not in dec.lower():
                issues.append(f'ATOM FAIL: {s}.{k}: {dec[:60]}')
            if dec.lower().strip().startswith('(currently'):
                issues.append(f'NO INTENT: {s}.{k}: {dec[:60]}')
        if len(decs) < 2:
            issues.append(f'THIN: {s}.{k}: {len(decs)} decisions')
if issues:
    print(f'{len(issues)} issues found:')
    for i in issues: print(f'  {i}')
    sys.exit(1)
else:
    print('Quality gate PASSED')
"
```

If the gate fails: fix issues BEFORE committing. Do NOT skip.

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

On convergence: update checklist file status to `CONVERGED`, commit, and report final metrics.

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
- Accept scores without visible rubric table — "vibes" scores are invalid
- Commit only at the end — commit after EVERY fix phase
- Run more than 6 iterations without user checkpoint — ask if scope needs narrowing
- Launch fix agents without writing the pre-launch checklist — no checklist = no agents
- Skip post-fix validation — quality gate runs BEFORE every commit, no exceptions
- Start a stress-loop without a checklist file — auto-generate on first iteration

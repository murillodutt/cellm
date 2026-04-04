---
description: "Intelligent spec execution advisor — analyzes spec structure, proposes optimal per-phase strategy, orchestrates execution with quality gates and go/no-go evaluations. Use when: 'execute spec', 'run spec', 'execute', 'best strategy for spec', 'execute check'."
user-invocable: true
argument-hint: "[spec check ID, title, or search term]"
allowed-tools: mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify, mcp__cellm-oracle__go_no_go_evaluate, mcp__plugin_cellm_cellm-oracle__quality_gate, Task, Skill, AskUserQuestion
---

# execute — Intelligent Spec Execution Advisor

Analyze a decomposed spec and propose the optimal execution strategy per phase, then orchestrate approved plan with quality gates between every stage.

## Intent

- Analyze spec structure and propose per-phase execution strategy.
- Compose multiple execution skills into a coherent plan.
- Inject go/no-go evaluations and quality gates between stages.
- Report progress between every stage — user is never in the dark.
- Prioritize quality and precision over speed. Speed enters only when it does not increase risk.

## Policy

- Run `context_preflight` before analysis (`flow='orchestrate'`).
- Use `spec_get_tree` + `spec_get_counters` as single source of truth.
- Evaluate `go_no_go_evaluate(phase_exit)` between execution steps.
- Evaluate `go_no_go_evaluate(check_exit)` before declaring check complete.
- Persist outcome via `context_record_outcome` after each step.
- Present plan and wait for user approval before executing anything.

## Routing

### Stage 1: Analysis

1. Resolve spec via `spec_search`.
2. Load tree via `spec_get_tree` (yaml format) + `spec_get_counters`.
3. **Empty tree guard**: If tree has 0 tasks or counters show 0 total, STOP and escalate: "Check is active but has 0 tasks — decomposition likely failed. Run /cellm:plan-to-spec to recreate."
4. Build DAG adjacency from edges — identify parallel groups and linear chains.
4. Compute risk score per phase.
5. Select strategy per phase using decision rules.
6. Group phases into execution steps.

### Stage 2: Proposal

7. Present EXECUTION PLAN table to user via `AskUserQuestion`.
8. User can approve, modify strategy for any step, or abort.

### Stage 3: Execution Loop

9. For each approved step:
   a. Invoke execution skill via `Skill` tool (e.g., `cellm:implement`, `cellm:orchestrate-teams`).
   b. Run `go_no_go_evaluate` with `decisionClass: phase_exit` for completed phases.
   c. If verdict is `conditional`: run `quality_gate`, report, ask user.
   d. If verdict is `no_go`: invoke `cellm:asclepius` via `Skill`, re-evaluate.
   e. Present inter-stage report to user.
   f. Ask user to proceed / pause / abort.
10. Persist step outcome via `context_record_outcome`.

### Stage 4: Post-Check

11. Run `go_no_go_evaluate` with `decisionClass: check_exit`.
12. If check priority high or critical: invoke `cellm:convergir` via `Skill`.
13. If check priority critical: invoke `cellm:olympus` via `Skill`.
14. Present final summary report.

## Risk Score (per phase, 0-10)

| Factor | Points |
|--------|--------|
| Specialist focus: DB / security / auth / migration | +3 |
| Check priority critical | +2 |
| Check priority high | +1 |
| Tasks with fileRefs in server/db/ or auth/ | +2 |
| Phase is Convergence Gate | +3 (forces spec-treat) |
| 4+ distinct fileRef paths (high coupling) | +2 |
| More than 6 tasks in phase | +1 |

## Strategy Selection Rules (priority order)

1. **Convergence Gate phase** -> `cellm:spec-treat` (always — SCE certification required)
2. **Risk >= 6** -> `cellm:implement` (sequential, maximum control)
3. **1-2 tasks** -> `cellm:implement` (orchestration overhead not worth it)
4. **Specialist in critical domain (DB/security/auth) + risk >= 3** -> `cellm:implement`
5. **3+ phases in same executable DAG group** -> `cellm:orchestrate-teams` (invoke via `Skill`)
6. **10+ parallelizable tasks, risk <= 2, parallelizable ratio >= 0.7** -> `cellm:swarm` (invoke via `Skill`)
7. **Linear chain of 3+ tasks** -> `cellm:orchestrate`
8. **Default** -> `cellm:spec-treat`

Parallelizable ratio = tasks with no unsatisfied `depends_on` edges / total pending tasks. Computed from `spec_get_tree` edges.

Phases partially completed (some tasks done, some pending) are excluded from parallel groups — they run individually via `cellm:implement`.

## Execution Plan Format

Present to user before execution:

```
EXECUTION PLAN — "{title}" (priority: {p}, {n} phases, {t} tasks)

| Step | Phase(s) | Strategy | Reason | Gate |
|------|----------|----------|--------|------|
| 1 | Phase 1 (2 tasks) | implement | 2 tasks, DB migration, risk:7 | go_no_go phase_exit |
| 2 | Phase 2-4 (18 tasks) | orchestrate-teams | 3 independent phases, risk:3 | go_no_go phase_exit |
| 3 | Convergence Gate (1 task) | spec-treat | Convergence, SCE required | go_no_go phase_exit |

Post-Check:
| Gate | Condition |
|------|-----------|
| go_no_go check_exit | Always |
| cellm:convergir | Priority high or critical |
| cellm:olympus | Priority critical |
```

## Inter-Stage Report Format

After each step completes:

```
STEP {n} COMPLETE — {phase title}

| Metric | Value |
|--------|-------|
| Tasks | {done}/{total} completed |
| Go/No-Go | {verdict} |
| Findings | {count} |
| Next | Step {n+1}: {phases} via {strategy} |

Proceed? (yes / pause / abort)
```

## Go/No-Go MCP Contract

When calling `go_no_go_evaluate`, pass IDs from the resolved spec tree:
- **phase_exit**: `{ projectKey, subjectType: "phase", subjectRef: { phaseId: "<phase-id>" }, decisionClass: "phase_exit" }`
- **check_exit**: `{ projectKey, subjectType: "check", subjectRef: { checkId: "<check-id>" }, decisionClass: "check_exit" }`

## Error Handling

- `no_go` verdict -> check blockers: if test/verification failure invoke `cellm:asclepius`; if dependency/external blocker escalate to user
- `conditional` verdict -> run `quality_gate`, report, ask user
- Skill fails mid-execution -> report current state, offer retry / skip / abort
- Dependency blocked -> report with blocker details, never force

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: write feedback to `dev-cellm-feedback/entries/execute-{date}-{seq}.md`. Include:
- Risk scores per phase and whether strategy matched expectations
- Go/no-go verdicts and whether they caught real issues
- User overrides and rationale
- Total steps, wall-clock time estimate, skill composition used

## NEVER

- **Execute without user approval** — always present plan first.
- **Skip go/no-go evaluation** between steps.
- **Choose swarm for linear DAG** or high-risk phases.
- **Skip outcome write-back** after any step.
- **Parallelize partially-completed phases** — run them individually.
- **Hide failures or blocked transitions** from the user.
- **Build custom ranking logic** — ranking belongs to SCE.

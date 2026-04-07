---
description: "Intelligent spec execution advisor — analyzes spec structure, proposes optimal per-phase strategy, orchestrates execution with quality gates and go/no-go evaluations. Use when: 'execute spec', 'run spec', 'execute', 'best strategy for spec', 'execute check'."
user-invocable: true
argument-hint: "[spec check ID, title, or search term]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__context_certify, mcp__plugin_cellm_cellm-oracle__go_no_go_evaluate, mcp__plugin_cellm_cellm-oracle__go_no_go_record, mcp__plugin_cellm_cellm-oracle__go_no_go_render, mcp__plugin_cellm_cellm-oracle__go_no_go_history, mcp__plugin_cellm_cellm-oracle__execution_plan_build, mcp__plugin_cellm_cellm-oracle__execution_plan_explain, mcp__plugin_cellm_cellm-oracle__quality_gate, Task, Skill, AskUserQuestion
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

- Spec lifecycle (pending check vs `active`, incremental API vs bulk `decomposeSpec`): see `docs/technical/SPEC-DECOMPOSE-LIFECYCLE.md`. Execution assumes a decomposed tree; it does not replace owner approval of the plan before decomposition.
- Run `context_preflight` before analysis (`flow='orchestrate'`).
- Use `spec_get_tree` + `spec_get_counters` as single source of truth.
- Confirmation right-sizing: Stage 2 approval may be skipped only with a valid `check.body.approvalTicket` (`scope=decompose+execute-stage2`) and strict checks (same session, TTL valid, fingerprint match, non-critical priority).
- Evaluate `go_no_go_evaluate(phase_exit)` between execution steps.
- Evaluate `go_no_go_evaluate(check_exit)` before declaring check complete.
- **Record every evaluation**: after each `go_no_go_evaluate`, call `go_no_go_record` to persist the verdict. Render the decision matrix via `go_no_go_render` in inter-stage reports.
- Persist outcome via `context_record_outcome` after each step. Use deterministic key: `{checkId}/{phaseId}/step-{n}` for idempotent writes.
- Persist confirmation telemetry via `context_record_outcome` with deterministic keys (`approval_prompt_count`, `approval_prompt_skipped`, `approval_ticket_reused`, `approval_ticket_rejected`).
- **Retry limit**: maximum 2 cycles of `asclepius -> re-evaluate` per step. If still `no_go` after 2 retries, escalate to user with full context.
- **Degradation policy**: if `go_no_go_evaluate` itself fails (API error, timeout), BLOCK advancement and ask user for explicit decision. Never assume `go` on evaluation failure.
- Present plan and wait for user approval before executing anything.

## Routing

### Stage 1: Analysis

1. Resolve spec via `spec_search`.
2. Load tree via `spec_get_tree` (yaml format) + `spec_get_counters`.
3. **Empty tree guard**: If tree has 0 tasks or counters show 0 total, STOP and escalate: "Check is active but has 0 tasks — decomposition likely failed. Run /cellm:plan-to-spec to recreate."
4. Load `approvalTicket` from check body (if present) and compute current fingerprint from the current tree summary:
   - `phaseCount`, `taskCount`, `edgeCount`, `injectConvergenceGate`.
   - Format: `p{phaseCount}-t{taskCount}-e{edgeCount}-cg{flag}`.
   Evaluate validity (`scope`, session, ttl, fingerprint, priority).
   - If valid: mark `ticketEligible=true`.
   - If invalid: store rejection reason (`scope|session|ttl|fingerprint|priority|missing`) for telemetry.
5. **Deterministic planner**: Call `execution_plan_build` with the check path and desired mode. This computes DAG grouping, risk scores, and strategy selection deterministically.
   - If planner returns `source: 'planner'`: use the computed plan directly (steps 5-6 are handled by the planner).
   - If planner returns `source: 'manual-fallback'`: present `[FALLBACK]` badge and use the conservative plan. The `fallbackReason` field explains why (e.g., `PLANNER_DISABLED`, API error).
6. Build DAG adjacency from edges — identify parallel groups and linear chains. *(Only when planner unavailable — fallback path.)*
7. Compute risk score per phase. *(Only when planner unavailable — fallback path.)*
8. Select strategy per phase using decision rules. *(Only when planner unavailable — fallback path.)*

### Stage 2: Execution Gate (mandatory — 3 menus)

This stage is the **central mandatory gate** for all post-decomposition execution.
All decomposition flows (plan-to-spec, tilly, direct) redirect here. No execution
without explicit user decisions on all 3 menus.

9. If `ticketEligible=true` and user did not request `force-confirmation`:
   - Skip M1 `AskUserQuestion` — reuse ticket executor.
   - M2 and M3 are **never skippable** — always ask explicitly.
   - Record telemetry via `context_record_outcome`:
     - `approval_prompt_skipped`
     - `approval_ticket_reused`

10. **Menu 1 — Executor (M1)**: Present EXECUTION PLAN table with CELLM recommendation per phase, then ask user to select executor via `AskUserQuestion`.
    - Options: `cellm:implement`, `cellm:orchestrate`, `cellm:orchestrate-teams`, `cellm:swarm` (and future executors).
    - `cellm:execute` does NOT appear as an option — it is the gate, not an executor.
    - CELLM recommendation is computed from Strategy Selection Rules (risk score, DAG structure).
    - User can approve recommendation, modify strategy for any step, or abort.

11. **Menu 2 — Autonomy Level (M2)**: Ask user via `AskUserQuestion`:
    - **(A)** Direct execution without human intervention
    - **(B)** Assisted execution with human checkpoints
    - Maps to Execution Mode: A = `throughput`, B = `balanced` (user can further refine to `conservative`).
    - **Telemetry value**: `autonomy_level` records the execution mode value (`throughput`, `balanced`, or `conservative`), NOT the menu label (A/B).
    - **Fail-closed**: if M2 not explicitly answered, execution MUST NOT proceed.

12. **Menu 3 — Certification (M3, multiple choice)**: Ask user via `AskUserQuestion`:
    - `cellm:olympus` — Triad certification (Argus/Asclepius/Hefesto)
    - `cellm:arena` — Quality lab (prove/debug/gate/stress)
    - `cellm:convergir` — E2E convergence loop (typecheck + tests + oracle)
    - `skip` — No certification (user accepts risk)
    - User may select **one or more** options (e.g., `V3+V1` = convergir then olympus).
    - CELLM recommendation: based on check priority (critical -> olympus+convergir, high -> convergir, medium -> convergir, low -> skip).
    - **Fail-closed**: if M3 not explicitly answered, execution MUST NOT proceed.

13. Record telemetry via `context_record_outcome`:
    - always: `approval_prompt_count`, `decomposition_source`
    - M1: `recommended_executor`, `selected_executor`
    - M2: `autonomy_level`
    - M3: `certification_choice` (array of selected options)
    - if blocked: `blocked_reason`
    - if ticket existed but invalid: `approval_ticket_rejected` with reason.

### Stage 3: Execution Loop

14. For each approved step:
    a. Invoke execution skill via `Skill` tool (e.g., `cellm:implement`, `cellm:orchestrate-teams`).
    b. Run `go_no_go_evaluate` with `decisionClass: phase_exit` for completed phases.
    c. Call `go_no_go_record` to persist the verdict. Include in inter-stage report via `go_no_go_render`.
    d. If verdict is `conditional`: run `quality_gate`, report, ask user.
    e. If verdict is `no_go`: invoke `cellm:asclepius` via `Skill`, re-evaluate. Max 2 retries per step — if still `no_go`, escalate to user.
    f. If `go_no_go_evaluate` fails (error/timeout): BLOCK and ask user — never assume `go`.
    g. Present inter-stage report to user (include rendered go/no-go matrix).
    h. Ask user to proceed / pause / abort.
15. Persist step outcome via `context_record_outcome` with key `{checkId}/{phaseId}/step-{n}`.

### Stage 4: Post-Check (respects M3 user choice)

16. Run `go_no_go_evaluate` with `decisionClass: check_exit`. Call `go_no_go_record` to persist.
17. Render full decision matrix via `go_no_go_render` — include in final report.
18. Execute certification tools **based on user M3 selection** (not automatic by priority):
    - If M3 includes `convergir`: invoke `cellm:convergir` via `Skill`.
    - If M3 includes `arena`: invoke `cellm:arena` via `Skill`.
    - If M3 includes `olympus`: invoke `cellm:olympus` via `Skill`.
    - If M3 is `skip`: skip certification (go_no_go check_exit from step 16 still runs).
    - Execute in order listed by user (e.g., `V3+V1` = convergir first, then olympus).
19. Present final summary report with complete go/no-go history and certification results.

## Risk Score (per phase, 0-10) — Hybrid Model

Risk = structural score + empirical adjustment.

### Structural Score (static, from spec tree)

| Factor | Points |
|--------|--------|
| Specialist focus: DB / security / auth / migration | +3 |
| Check priority critical | +2 |
| Check priority high | +1 |
| Tasks with fileRefs in server/db/ or auth/ | +2 |
| Phase is Convergence Gate | +3 (forces spec-treat) |
| 4+ distinct fileRef paths (high coupling) | +2 |
| More than 6 tasks in phase | +1 |

### Empirical Adjustment (from go/no-go history)

Query `go_no_go_render` for the project. If historical data exists for similar phase types:
- Phase type had `no_go` rate > 30% in past checks -> +2
- Phase type had `conditional` rate > 50% -> +1
- Phase type had 100% `go` in past 3 checks -> -1 (min 0)

If no historical data, use structural score only.

## Confidence Band

Risk score maps to a confidence band that determines checkpoint granularity:

| Risk | Band | Checkpoint Strategy |
|------|------|-------------------|
| 0-2 | High confidence | Confirm every N steps (N = total low-risk steps, min 2) |
| 3-5 | Medium confidence | Confirm per phase |
| 6-10 | Low confidence | Confirm per critical task within phase |

## Strategy Selection Rules (priority order, deterministic)

Rules are evaluated top-to-bottom. **First match wins** — no fallthrough.

0. **Partially completed phase** -> `cellm:implement` (never parallelize partial phases)
1. **Convergence Gate phase** -> `cellm:spec-treat` (always — SCE certification required)
2. **Risk >= 6** -> `cellm:implement` (sequential, maximum control)
3. **1-2 tasks** -> `cellm:implement` (orchestration overhead not worth it)
4. **Specialist in critical domain (DB/security/auth) + risk >= 3** -> `cellm:implement`
5. **3+ phases in same executable DAG group, all risk <= 4** -> `cellm:orchestrate-teams` (invoke via `Skill`)
6. **10+ parallelizable tasks, risk <= 2, parallelizable ratio >= 0.7** -> `cellm:swarm` (invoke via `Skill`)
7. **Linear chain of 3+ tasks, risk <= 4** -> `cellm:orchestrate`
8. **Default** -> `cellm:spec-treat`

**Tiebreaker**: if multiple rules could match (e.g., rule 5 and 7 both apply), the **lower-numbered rule wins**. This is enforced by first-match-wins evaluation.

Parallelizable ratio = tasks with no unsatisfied `depends_on` edges / total pending tasks. Computed from `spec_get_tree` edges.

Phases partially completed (some tasks done, some pending) are handled by rule 0 — they run individually via `cellm:implement`.

## Execution Mode

Present mode selection to user alongside the execution plan. User chooses one:

| Mode | Behavior |
|------|----------|
| `conservative` | Confirm every step. Full `quality_gate` (typecheck + tests) at every `phase_exit`. Never batch low-risk confirmations. |
| `balanced` | Confirm per confidence band. `quality_gate` at every `phase_exit`. Batch confirmations for high-confidence steps. Default mode. |
| `throughput` | Confirm only at band transitions (high->medium, medium->low). `quality_gate` typecheck at every phase, full tests only at critical phases and `check_exit`. |

If user does not choose, default to `balanced`.

## Execution Plan Format

Present to user before execution:

```
EXECUTION PLAN — "{title}" (priority: {p}, {n} phases, {t} tasks)
Mode: {mode} (conservative / balanced / throughput)

| Step | Phase(s) | Risk | Band | Strategy | Reason | Gate |
|------|----------|------|------|----------|--------|------|
| 1 | Phase 1 (2 tasks) | 7 | low | implement | DB migration, risk:7 | phase_exit |
| 2 | Phase 2-4 (18 tasks) | 3 | medium | orchestrate-teams | 3 independent phases | phase_exit |
| 3 | Convergence Gate (1 task) | 3 | low | spec-treat | SCE required | phase_exit |

Post-Check:
| Gate | Condition |
|------|-----------|
| go_no_go check_exit | Always |
| {M3 selections} | User choice from Menu 3 (e.g., convergir + olympus) |

Approve plan? Choose mode (conservative / balanced / throughput) or modify steps.
```

## Inter-Stage Report Format

After each step completes:

```
STEP {n} COMPLETE — {phase title}

| Metric | Value |
|--------|-------|
| Tasks | {done}/{total} completed |
| Go/No-Go | {verdict} (recorded) |
| Retries | {retry_count}/2 |
| Findings | {count} |
| Band | {confidence_band} |
| Next | Step {n+1}: {phases} via {strategy} |

{go_no_go_render output — decision matrix}

Proceed? (yes / pause / abort)
```

In `balanced` and `throughput` modes, batch consecutive high-confidence steps and present a single grouped confirmation instead of per-step.

## Go/No-Go MCP Contract

### Evaluate
When calling `go_no_go_evaluate`, pass IDs from the resolved spec tree:
- **phase_exit**: `{ projectKey, subjectType: "phase", subjectRef: { phaseId: "<phase-id>", phaseTypeKey: "<type>" }, decisionClass: "phase_exit" }`
  - `phaseTypeKey` is derived from the phase specialist role: `convergence-gate`, `db-specialist`, `security-specialist`, `ui-specialist`, `api-specialist`, or `general`. Always include it — the execution planner uses it for empirical risk adjustment.
- **check_exit**: `{ projectKey, subjectType: "check", subjectRef: { checkId: "<check-id>" }, decisionClass: "check_exit" }`

### Record (mandatory after every evaluate)
Call `go_no_go_record` immediately after evaluation to persist the verdict. This creates an immutable audit trail.

### Render (in reports)
Call `go_no_go_render` to generate the decision matrix for inter-stage and final reports. Include the rendered output in user-facing reports.

## Error Handling

- `no_go` verdict -> check blockers: if test/verification failure invoke `cellm:asclepius`; if dependency/external blocker escalate to user. Max 2 retry cycles per step.
- `conditional` verdict -> run `quality_gate`, report, ask user
- `go_no_go_evaluate` failure (API error, timeout) -> BLOCK advancement, report error, ask user for explicit decision. Never assume `go`.
- Skill fails mid-execution -> report current state, offer retry / skip / abort
- Dependency blocked -> report with blocker details, never force
- Retry exhausted (2 cycles `asclepius -> no_go`) -> escalate with full context: findings, attempted fixes, blocker details. User decides: force / skip / abort.

## Telemetry and Continuous Improvement

### Execution Gate Metrics (mandatory — recorded at Stage 2)

Track per execution run via `context_record_outcome` with deterministic keys:
- **`decomposition_source`**: which skill/flow triggered decomposition (e.g., `plan-to-spec`, `tilly`, `direct`).
- **`recommended_executor`**: CELLM recommendation from Strategy Selection Rules.
- **`selected_executor`**: user M1 choice.
- **`autonomy_level`**: user M2 choice (`direct` or `assisted`).
- **`certification_choice`**: user M3 choice (array, e.g., `["convergir", "olympus"]`).
- **`blocked_reason`**: when fail-closed activates (e.g., `M2_not_answered`, `M3_not_answered`).

### Execution Metrics (always collected)

Track per execution run via `context_record_outcome`:
- **Override rate**: user strategy overrides / total steps proposed. Target: < 15%.
- **Phase reopen rate**: phases reopened after `go` / total phases. Target: < 5%.
- **Late no_go**: `no_go` detected after next step started. Target: 0.
- **Retry rate**: asclepius retries / total steps.
- **Decision coverage**: steps with recorded go/no-go / total steps. Target: 100%.
- **Approval prompt count**: explicit Stage 2 prompts shown in run.
- **Approval prompt skipped**: Stage 2 skipped by valid ticket.
- **Approval ticket reused/rejected**: ticket acceptance quality by reason.

### Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: write feedback to `dev-cellm-feedback/entries/execute-{date}-{seq}.md`. Include:
- Risk scores per phase: structural vs empirical, and whether strategy matched expectations
- Go/no-go verdicts: `go` / `conditional` / `no_go` counts, whether they caught real issues
- User overrides: which strategies were changed, rationale, whether override improved outcome
- Confidence bands: accuracy per band (did high-confidence steps actually pass without issues?)
- Execution mode used and whether user switched mid-run
- Total steps, step durations, skill composition used
- Retry cycles: how many, which phases, root cause pattern

## NEVER

- **Execute without explicit M1/M2/M3 decisions** — fail-closed. No defaults, no assumptions.
- **Skip M2 or M3** — both are mandatory even with valid approval ticket. Ticket only skips M1.
- **Present `cellm:execute` as an executor option in M1** — execute is the gate, not an executor.
- **Auto-select certification based on priority** — priority drives CELLM recommendation in M3, user decides.
- **Duplicate menu logic in other skills** — cellm:execute owns M1/M2/M3 exclusively.
- **Execute without user approval** — always present plan first.
- **Skip Stage 2 approval without a valid ticket** — enforce `scope+session+ttl+fingerprint+priority` checks.
- **Skip go/no-go evaluation** between steps.
- **Evaluate without recording** — every `go_no_go_evaluate` must be followed by `go_no_go_record`.
- **Assume `go` on evaluation failure** — API errors or timeouts BLOCK advancement.
- **Retry more than 2 times** — escalate to user after 2 failed `asclepius -> re-evaluate` cycles.
- **Choose swarm for linear DAG** or high-risk phases.
- **Skip outcome write-back** after any step.
- **Parallelize partially-completed phases** — run them individually.
- **Hide failures or blocked transitions** from the user.
- **Build custom ranking logic** — ranking belongs to SCE.
- **Ignore confidence band** — checkpoint granularity follows the band, not intuition.
- **Change mode mid-run without user consent** — mode is user's choice.
- **Skip telemetry collection** — metrics are always recorded regardless of DEV_MODE.

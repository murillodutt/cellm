---
description: "Mandatory execution gate after spec decomposition — analyzes DAG structure, computes per-phase risk scores, selects optimal strategy (implement vs orchestrate vs orchestrate-teams vs swarm vs spec-treat), presents M1/M2/M3 approval menus via AskUserQuestion, and orchestrates with go/no-go gates between every phase. Handles partial phases, approval tickets, planner fallbacks, and degradation scenarios. Use when: 'execute spec', 'run spec', 'execute', 'execute check', 'best strategy for spec', 'after plan-to-spec', 'choose between implement and orchestrate', 'risk scoring', 'how to run this decomposed spec', 'start execution', 'which executor for this phase'. Do NOT use for: implementing a single task (cellm:implement), decomposing a plan (cellm:plan-to-spec), running certification (cellm:olympus/arena/convergir), or checking spec status (cellm:spec)."
cellm_scope: universal
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
- Guardrails contract: read `check.body.guardrailsContract` as canonical execution policy (writer: `plan-to-spec`).
  - Expected minimum schema: `docs/technical/guardrails-contract-v1.md`.
  - Missing/invalid contract handling:
    - `critical`/`high`: fail-closed (block and escalate to user).
    - `medium`/`low`: continue with safe defaults (`balanced` + blocker-only hard stop list) and emit telemetry warning.
- Evaluate `go_no_go_evaluate(phase_exit)` between execution steps.
- Evaluate `go_no_go_evaluate(check_exit)` before declaring check complete.
- **Record every evaluation**: after each `go_no_go_evaluate`, call `go_no_go_record` to persist the verdict. Render the decision matrix via `go_no_go_render` in inter-stage reports.
- Persist outcome via `context_record_outcome` after each step. Use deterministic key: `{checkId}/{phaseId}/step-{n}` for idempotent writes.
- Persist confirmation telemetry via `context_record_outcome` with deterministic keys (`approval_prompt_count`, `approval_prompt_skipped`, `approval_ticket_reused`, `approval_ticket_rejected`).
- **Retry limit**: maximum 2 cycles of `asclepius -> re-evaluate` per step. If still `no_go` after 2 retries, escalate to user with full context.
- **Degradation policy**: if `go_no_go_evaluate` itself fails (API error, timeout), BLOCK advancement and ask user for explicit decision. Never assume `go` on evaluation failure.
- Present plan and wait for user approval before executing anything.
- **Directive precedence** (when instructions conflict):
  1) explicit user directive in current session
  2) active check/ADR/WAVE locked objective
  3) this skill contract
  4) conversational style preferences
- **Escalation budget by mode**:
  - `throughput`: no proactive confirmations during Stage 3; escalate only hard blockers.
  - `balanced`: max 1 objective escalation per phase.
  - `conservative`: confirmations per step are allowed by design.
- **Loop breaker**: after 2 consecutive meta/status reports without code/test progression, execute the next safe protocol step immediately.
- **Tracking granularity default**: phase-level state in Oracle; task-level detail in journal/handoff unless audit explicitly requires per-task transitions.

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
4b. Load `guardrailsContract` from check body and validate required keys:
   - `directivePrecedence`
   - `executionModeContract`
   - `loopBreaker`
   - `hardBlockers`
   - `phaseGatePolicy`
   - `approvalInheritance`
   - `postDecomposeHandoff`
   - `trackingGranularity`
   - `evidenceRequirements`
   Record telemetry:
   - `guardrails_contract_source` (`check_body` | `safe_default`)
   - `guardrails_contract_valid` (`true|false`)
   Apply priority-aware fail-closed policy (see Policy).
5. **Deterministic planner**: Call `execution_plan_build` with the check path and desired mode. This computes DAG grouping, risk scores, and strategy selection deterministically.
   - If planner returns `source: 'planner'`: use the computed plan directly (manual Steps 6–8 are skipped — the planner owns DAG/strategy).
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
    - If `guardrailsContract.executionModeContract.mode` is stricter than the selected mode, prefer stricter mode and report enforcement in telemetry.
    - **Telemetry value**: `autonomy_level` records the execution mode value (`throughput`, `balanced`, or `conservative`), NOT the menu label (A/B).
    - **Fail-closed**: if M2 not explicitly answered, execution MUST NOT proceed.

12. **Menu 3 — Certification (M3, multiple choice)**: Ask user via `AskUserQuestion`:
    - `cellm:olympus` — Triad certification (Argus/Asclepius/Hefesto)
    - `cellm:arena` — Quality lab (prove/debug/gate/stress)
    - `cellm:convergir` — E2E convergence loop (typecheck + tests + oracle)
    - `skip` — No certification (user accepts risk)
    - User may select **one or more** options (e.g., `cellm:convergir` then `cellm:olympus` — preserve **user order** in Stage 4).
    - CELLM recommendation: based on check priority (critical -> olympus+convergir, high -> convergir, medium -> convergir, low -> skip).
    - **Fail-closed**: if M3 not explicitly answered, execution MUST NOT proceed.

13. Record telemetry via `context_record_outcome`:
    - always: `approval_prompt_count`, `decomposition_source` (see below)
    - M1: `recommended_executor`, `selected_executor`
    - M2: `autonomy_level`
    - M3: `certification_choice` (array of selected options)
    - if blocked: `blocked_reason`
    - if ticket existed but invalid: `approval_ticket_rejected` with reason.
    - **`decomposition_source`**: use `check.body.decompositionSource` when set by the decomposition flow (`plan-to-spec`, `tilly`, `spec`, etc.). If absent, record `unknown` — do **not** invent `tilly` vs `plan-to-spec` from context guesses.

### Stage 3: Execution Loop

14. For each approved step:
    a. Invoke execution skill via `Skill` tool (e.g., `cellm:implement`, `cellm:orchestrate-teams`).
    b. Run `go_no_go_evaluate` with `decisionClass: phase_exit` for completed phases.
    c. Call `go_no_go_record` to persist the verdict. Include in inter-stage report via `go_no_go_render`.
    d. If verdict is `conditional`: run `quality_gate`, report, ask user.
    e. If verdict is `no_go`: invoke `cellm:asclepius` via `Skill`, re-evaluate. Max 2 retries per step — if still `no_go`, escalate to user.
    f. If `go_no_go_evaluate` fails (error/timeout): BLOCK and ask user — never assume `go`.
    g. Present inter-stage report to user (include rendered go/no-go matrix).
    h. Apply confirmation cadence by mode, constrained by `guardrailsContract.executionModeContract` and interrupt budget:
       - `throughput`: continue automatically after report; ask only on hard blocker, band transition with increased risk, or explicit user pause request.
       - `balanced`: ask once per phase (or at meaningful band transition), not per step, and never exceed per-phase budget.
       - `conservative`: ask per step (`proceed / pause / abort`).
15. Persist step outcome via `context_record_outcome` with key `{checkId}/{phaseId}/step-{n}`.
    - Include `escalation_count` and `escalation_budget_mode`.
    - If loop-breaker threshold is hit (`maxMetaUpdatesWithoutProgress`), execute next safe step and record `loop_breaker_triggered=true`.

### Stage 4: Post-Check (respects M3 user choice)

16. Run `go_no_go_evaluate` with `decisionClass: check_exit`. Call `go_no_go_record` to persist.
17. Render full decision matrix via `go_no_go_render` — include in final report.
18. Execute certification tools **based on user M3 selection** (not automatic by priority):
    - If M3 includes `convergir`: invoke `cellm:convergir` via `Skill`.
    - If M3 includes `arena`: invoke `cellm:arena` via `Skill`.
    - If M3 includes `olympus`: invoke `cellm:olympus` via `Skill`.
    - If M3 is `skip`: skip certification (go_no_go check_exit from step 16 still runs).
    - Execute in order listed by user (e.g., selected `cellm:convergir` + `cellm:olympus` → run in the sequence the user stated).
19. Present final summary report with complete go/no-go history and certification results.

## Risk Score and Confidence Band

Read `references/risk-model.md` for factor tables, empirical adjustment, and confidence band mapping. Key: risk 0-2 = high confidence, 3-5 = medium, 6-10 = low.

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

**Rule 0 before Rule 1**: A partially completed Convergence Gate phase still matches rule 0 first — finish outstanding tasks with `cellm:implement` before treating the phase as a clean Convergence Gate for rule 1’s `spec-treat` posture.

## Execution Mode

Present mode selection to user alongside the execution plan. User chooses one:

| Mode | Behavior |
|------|----------|
| `conservative` | Confirm every step. Full `quality_gate` (typecheck + tests) at every `phase_exit`. Never batch low-risk confirmations. |
| `balanced` | Confirm per confidence band. `quality_gate` at every `phase_exit`. Batch confirmations for high-confidence steps. Default mode. |
| `throughput` | Confirm only at band transitions (high->medium, medium->low). `quality_gate` typecheck at every phase, full tests only at critical phases and `check_exit`. |

**M2 vs Execution Mode**: Menu 2 is **fail-closed** — never substitute a default for a missing M2 answer. After M2 maps (A)→`throughput` or (B)→`balanced`, optionally offer a follow-up to refine to `conservative`; until then, `autonomy_level` is that mapped value. The "Default mode" row in the table means CELLM **recommends** `balanced` as the usual baseline in narrative only — not permission to skip M2.
**Operational meaning**:
- `throughput` is execution-direct mode with blocker-only escalation.
- `balanced` is execution-assisted mode with checkpoint budget.
- `conservative` is execution-audit mode with per-step confirmations.


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

Next action follows mode cadence (auto in `throughput`, phase checkpoint in `balanced`, explicit prompt in `conservative`).
```

In `balanced` and `throughput` modes, batch consecutive high-confidence steps and present a single grouped confirmation instead of per-step.

## Go/No-Go MCP Contract

Read `references/go-nogo-contract.md` for evaluate/record/render parameter shapes. Key rule: every `go_no_go_evaluate` must be followed by `go_no_go_record`. Always include `phaseTypeKey` in phase_exit calls.

## Error Handling

- `no_go` verdict -> check blockers: if test/verification failure invoke `cellm:asclepius`; if dependency/external blocker escalate to user. Max 2 retry cycles per step.
- `conditional` verdict -> run `quality_gate`, report, ask user
- `go_no_go_evaluate` failure (API error, timeout) -> BLOCK advancement, report error, ask user for explicit decision. Never assume `go`.
- Skill fails mid-execution -> report current state, offer retry / skip / abort
- Dependency blocked -> report with blocker details, never force
- Retry exhausted (2 cycles `asclepius -> no_go`) -> escalate with full context: findings, attempted fixes, blocker details. User decides: force / skip / abort.

## Telemetry

Read `references/telemetry.md` for full metric definitions and feedback format. Critical rules:
- `autonomy_level` records mode value (`throughput`/`balanced`/`conservative`), NEVER menu labels (A/B) or synonyms (`direct`/`assisted`).
- `decomposition_source` uses `check.body.decompositionSource` if set, else `unknown` — never invent from context.
- `certification_choice` is an array in user-stated order.
- `guardrails_contract_source` and `guardrails_contract_valid` are mandatory for every run.

## CRITICAL TOOL ENFORCEMENT

M1, M2, and M3 MUST be rendered via the `AskUserQuestion` tool — NEVER as plain text output.
If you write menu options as text instead of calling `AskUserQuestion`, you have FAILED the skill contract.
This is the single most common failure mode of this skill. The LLM generates text describing menus
instead of calling the tool. That is WRONG. Call the tool.

Correct: `AskUserQuestion` with questions array containing M1, M2, M3 as structured options.
Wrong: Writing "M1 — Executor: ..." as markdown text and waiting for user to type a response.

## NEVER

- **Render M1/M2/M3 as text** — MUST use `AskUserQuestion` tool. This is the #1 recurring failure mode.
- **Execute without explicit M1/M2/M3 decisions** — fail-closed. No defaults that bypass M2/M3.
- **Present `cellm:execute` as an executor option in M1** — execute is the gate, not an executor.
- **Auto-select certification based on priority** — priority informs M3 recommendation only; user decides.
- **Duplicate menu logic in other skills** — `cellm:execute` owns M1/M2/M3 exclusively.
- **Assume `go` on evaluation failure** — API errors or timeouts BLOCK advancement.
- **Skip go/no-go record/evaluate pairing** — every `go_no_go_evaluate` must be followed by `go_no_go_record` where applicable.
- **Parallelize partially-completed phases** or **choose swarm for linear/high-risk work** — follow Strategy Selection Rules.
- **Hide failures, skip telemetry, or change mode mid-run without user consent.**
- **Re-ask `proceed/pause/abort` every step in `throughput` or `balanced`** — follow cadence by mode.
- **Use style/process preference to override explicit user execution directive** — precedence is mandatory.
- **Emit emojis in output/reporting** — strictly prohibited; use `[+]`, `[-]`, `[!]`, `[~]` markers only (preserve emojis only inside literal user quotes).

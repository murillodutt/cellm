---
description: "Convert a Claude Code plan file into a CellmOS spec check with phases, tasks, and DAG edges. Use when: plan ready to execute, user wants spec-driven workflow, 'decompose this plan', 'plan to spec'. Reads plan markdown, extracts briefings, creates atomic spec tree in Oracle DB."
cellm_scope: universal
user-invocable: true
argument-hint: "<path-to-plan.md>"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_spec_decompose, mcp__plugin_cellm_cellm-oracle__spec_decompose, mcp__plugin_cellm_cellm-oracle__spec_create_node, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__spec_add_edge, mcp__plugin_cellm_cellm-oracle__spec_add_verification, mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Write, Grep, Glob, Bash(git rev-parse *), Bash(mkdir *), AskUserQuestion, ExitPlanMode, Skill
---

# Plan-to-Spec Thinking — Before Converting

Convert a user-approved plan into a spec tree through the SCE decomposition bridge.

## Intent

- Transform plan markdown into executable CellmOS structure.
- Keep `plan-to-spec` as orchestration layer, not decomposition engine logic.

## Policy

- Always check existing specs first (`spec_search`).
- **Approval inheritance**: If the user already approved the plan in this conversation (e.g. "confirmo", "aprovado", "go", or invoked this skill after explicit plan approval), decompose immediately WITHOUT re-asking. The plan approval IS the decomposition approval. Only ask for confirmation when there is genuine ambiguity (duplicate spec found, unclear scope, missing plan file).
- Bulk decompose (`context_spec_decompose` / `decomposeSpec`) is a **single DB transaction** that can auto-activate the check (`autoStart`, default true) and insert phases immediately — there is **no** server pause between check and phases inside that call.
- Incremental creation via `spec_create_node`: new checks start `pending`; `phase` / `task` under a check require the root check to be `active` (`spec_transition`) or the API returns `CHECK_NOT_APPROVED`.
- Use `context_spec_decompose` as primary decomposition path.
- Keep plan file as input artifact; DB is source of truth after conversion.
- Right-size confirmations: avoid asking for the same decision twice in one run. Dedup confirmation is only required when a real conflict exists.
- On owner approval, create and persist `check.body.approvalTicket` to support conditional Stage 2 skip in `execute`. Required fields:
  - `ticketId`
  - `scope` (`decompose+execute-stage2`)
  - `approvedBy` (`owner`)
  - `sessionId`
  - `approvedAt` (epoch ms)
  - `ttlMinutes` (default `30`)
  - `executionMode` (`conservative` | `balanced` | `throughput`)
  - `treeFingerprint` (deterministic string from approved decomposition payload)

## Routing

1. Read plan file and detect project root.
2. Run dedup (`spec_search`). Ask user only if a real duplicate/ambiguity exists; otherwise continue.
3. **Pre-decomposition deadweight scan**: Use `Grep` and `Glob` to scan target files for deadweight patterns: `USkeleton`, `UCard` containers, `rounded-lg border-default` wrappers, `page-title`/`page-subtitle` CSS, `overflow-hidden` on `nc-bracket`, inline styles, `ds-*` legacy classes. Results feed as gap nodes into the decomposition payload. Gate behavior: WARN only (does not block decomposition).
4. **Approval gate** (context-aware):
   - If plan was already approved in this conversation → decompose immediately, default execution mode `balanced`.
   - If invoked standalone without prior approval → present one consolidated approval prompt (single ask): decompose now + desired execution mode (`conservative`/`balanced`/`throughput`).
5. Build decomposition payload from **owner-approved** plan (including deadweight scan gaps) and include `check.body.approvalTicket`. Build `treeFingerprint` deterministically from approved payload summary:
   - `phaseCount`
   - `taskCount` (recursive)
   - `edgeCount`
   - `injectConvergenceGate` (`0|1`)
   Format: `p{phaseCount}-t{taskCount}-e{edgeCount}-cg{flag}`.
6. Execute `context_spec_decompose` (fallback: `spec_decompose` / incremental `spec_create_node` only after check is `active` — never add phases/tasks under a `pending` check via incremental API).
7. **Post-decomposition validation (MANDATORY)**: Run `spec_get_tree` AND `spec_get_counters` for the new check. If tree is empty or counters show 0 tasks, the decomposition FAILED silently. Retry once via fallback path (if using incremental path, ensure check is `active`). If still empty, **ABORT and report**: "Decomposition produced 0 tasks — check exists but is hollow. Manual intervention required." Never return success with 0 tasks.
8. **Post-decomposition gate**: After successful decomposition (counters show tasks > 0), invoke `cellm:execute` via `Skill` tool with the check ID returned from decomposition (e.g., `spec-abc12345`). All execution decisions (executor, autonomy, certification) are handled by `cellm:execute` as the single mandatory gate. Do NOT present execution menus here — `cellm:execute` owns M1/M2/M3 exclusively.

## Spec Fallback YAML (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

After `context_spec_decompose` succeeds (step 5), generate a pure YAML fallback file at `.claude/specs/{check-slug}.yaml`.

| Rule | Detail |
|------|--------|
| Format | Pure YAML — no markdown code blocks, no backticks inside values |
| Multi-line | Use `\|` block scalar for action fields |
| Fields per task | id, title, action, fileRef, diffExpected, safety_notes |
| Sections | spec (id, title, briefing), decisions, gaps, dag_edges, phases with tasks, verification |
| Header | `generated_at`, `stale_after: 24h`, `source_spec_id` |
| Recovery | Include `recovery_procedure` field with instructions to recreate spec tree from this file |
| Max size | ~150 lines — condensed, IDs + actions + safety_notes only |
| Safety notes | Per-task risk notes — these do NOT exist in the DB, only in the YAML |
| Source of truth | DB is source of truth. YAML is read-only safety net for Worker crash recovery |
| Context embedding | Append ` [fallback: .claude/specs/{check-slug}.yaml]` to the check's `context` field in `spec_decompose`. This lets execution skills find the YAML path by reading the spec context |

Ensure `.claude/specs/` directory exists before writing (`mkdir -p`).

## Convergence Gate (Auto-Injected)

The `decomposeSpec()` service automatically injects a terminal **Convergence Gate** phase as the last phase of every spec. This phase:

- Collects `successCriteria` from all user phases into a single verification checklist
- Contains one task with a convergence loop protocol (verify → fix → repeat)
- Has `depends_on` edges to ALL user phases (cannot start until all complete)

**Suppression:** Pass `injectConvergenceGate: false` in the decomposition payload to skip gate injection (for trivial specs or tests).

**Content governance (v1 → v2 transition, decision spec-1a5dee34):**
- **v1 (current):** Static template with aggregated criteria + verification protocol
- **v2 (implemented):** Agent C output from the A/B/C protocol replaces the static template via `convergenceGateAction` field. Three agents with separated context (Autor → Revisor → Sintetizador) produce a validated convergence protocol per spec.

### v2 Integration (A/B/C in decomposition flow)

When the spec is `priority: critical` or `priority: high`, the skill SHOULD run the A/B/C protocol **before** calling `context_spec_decompose`:

1. **Step 4.5a (Agent A):** Pass spec metadata + successCriteria to Autor agent → `convergence-draft`
2. **Step 4.5b (Agent B):** Pass draft to Revisor agent (separated context) → `convergence-review`
3. **Step 4.5c (Agent C):** Pass draft + review to Sintetizador → extract Section 5 text
4. **Step 5:** Call `context_spec_decompose` with `convergenceGateAction: agentCOutput`

The service replaces `{{successCriteria}}` placeholder in the custom text with the aggregated criteria list.

The skill does NOT need to manually add the Convergence Gate phase — it is injected by the service after all user phases are built.

## NEVER

- **Create spec without any prior approval** — plan approval in conversation counts as decomposition approval; only re-ask when genuine ambiguity exists (duplicate found, unclear scope).
- **Use incremental `spec_create_node` to add phases/tasks under a `pending` check** — server rejects with `CHECK_NOT_APPROVED`; use `spec_transition` to `active` first.
- **Ask redundant confirmations for the same decision in the same run** — use one consolidated approval and persist `approvalTicket`.
- **Bypass SCE bridge without reason** — prefer `context_spec_decompose`.
- **Treat markdown as post-conversion source of truth** — DB state is authoritative.
- **Drop constraints/verification intent** — preserve execution-critical details.
- **Present execution menus directly** — M1/M2/M3 belong to `cellm:execute`. This skill redirects after decomposition, never duplicates menu logic.
- **Skip cellm:execute after decomposition** — mandatory gate, no exception.

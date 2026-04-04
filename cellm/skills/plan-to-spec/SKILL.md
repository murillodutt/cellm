---
description: "Convert a Claude Code plan file into a CellmOS spec check with phases, tasks, and DAG edges. Use when: plan ready to execute, user wants spec-driven workflow, 'decompose this plan', 'plan to spec'. Reads plan markdown, extracts briefings, creates atomic spec tree in Oracle DB."
user-invocable: true
argument-hint: "<path-to-plan.md>"
allowed-tools: mcp__cellm-oracle__context_spec_decompose, mcp__cellm-oracle__spec_decompose, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Write, Grep, Glob, Bash(git rev-parse *), Bash(mkdir *), AskUserQuestion, ExitPlanMode
---

# Plan-to-Spec Thinking — Before Converting

Convert a user-approved plan into a spec tree through the SCE decomposition bridge.

## Intent

- Transform plan markdown into executable CellmOS structure.
- Keep `plan-to-spec` as orchestration layer, not decomposition engine logic.

## Policy

- Always check existing specs first (`spec_search`).
- Present extracted scope to user before creating nodes.
- Use `context_spec_decompose` as primary decomposition path.
- Keep plan file as input artifact; DB is source of truth after conversion.

## Routing

1. Read plan file and detect project root.
2. Run dedup (`spec_search`) and confirm action with user.
3. **Pre-decomposition deadweight scan**: Use `Grep` and `Glob` to scan target files for deadweight patterns: `USkeleton`, `UCard` containers, `rounded-lg border-default` wrappers, `page-title`/`page-subtitle` CSS, `overflow-hidden` on `nc-bracket`, inline styles, `ds-*` legacy classes. Results feed as gap nodes into the decomposition payload. Gate behavior: WARN only (does not block decomposition). Scan findings listed in context field. User confirms before proceeding.
4. Build decomposition payload from approved plan (including deadweight scan gaps).
5. Execute `context_spec_decompose` (fallback: `spec_decompose` / `spec_create_node` path).
6. **Post-decomposition validation (MANDATORY)**: Run `spec_get_tree` AND `spec_get_counters` for the new check. If tree is empty or counters show 0 tasks, the decomposition FAILED silently. Retry once via fallback path (`spec_create_node`). If still empty, **ABORT and report**: "Decomposition produced 0 tasks — check exists but is hollow. Manual intervention required." Never return success with 0 tasks.
7. **Execution hint**: After successful decomposition, suggest: "Spec decomposed. Run `/cellm:execute` to analyze and propose optimal execution strategy."

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

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after conversion, write feedback entry to `dev-cellm-feedback/entries/plan-to-spec-{date}-{seq}.md`. Note which plan sections mapped cleanly vs required interpretation, whether DSE alignment surfaced useful constraints, and how many composite actions were split. Format and lifecycle: see `dev-cellm-feedback/README.md`.

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

- **Create spec without user confirmation** — always confirm extracted structure first.
- **Bypass SCE bridge without reason** — prefer `context_spec_decompose`.
- **Treat markdown as post-conversion source of truth** — DB state is authoritative.
- **Drop constraints/verification intent** — preserve execution-critical details.

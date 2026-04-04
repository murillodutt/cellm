---
description: "Implement code from CellmOS spec context. Loads spec tree from Oracle DB, picks next pending task, writes code, runs quality gate, transitions state on completion. Use when: 'implement next task', 'implement spec', 'pick next task'."
user-invocable: true
argument-hint: "[task description or check title]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__spec_create_node, mcp__plugin_cellm_cellm-oracle__spec_get_verifications, mcp__plugin_cellm_cellm-oracle__spec_record_verification, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__dse_search, mcp__plugin_cellm_cellm-oracle__dse_get, mcp__plugin_cellm_cellm-oracle__directive_emit, mcp__plugin_cellm_cellm-oracle__directive_emit_for_phase, mcp__plugin_cellm_cellm-oracle__directive_verify, mcp__plugin_cellm_cellm-oracle__directive_list, Read, Grep, Glob, Write, Edit, Bash(npx *), Bash(bun *), AskUserQuestion
---

# Implementation Thinking — Before Writing Code

Implement the next executable spec task as a thin consumer of SCE context.

## Intent

- Use this skill to execute one task (or the next pending leaf task) from a CellmOS check.
- Treat SCE as the single source for context ranking and merge decisions.

## Policy

- `context_preflight` is mandatory before implementation (`flow='implement'`).
- Use `spec_get_tree` to load check/phase/task context and constraints.
- Respect active directives and project constraints; do not bypass server gates.
- Record meaningful outcomes through `context_record_outcome` for the learning loop.
- Escalate to the user when blocked by dependency, directive escalation, or ambiguous requirements.

## Routing

1. Resolve project and check (`spec_search` + `spec_get_tree`).
2. **Empty tree guard**: If `spec_get_tree` returns empty YAML/JSON for an `active` check, run `spec_get_counters`. If counters also show 0 tasks, **STOP and escalate**: "Check is active but has 0 tasks — decomposition likely failed. Run /cellm:plan-to-spec to recreate." Do NOT execute work outside the spec tree.
3. Run `context_preflight` and consume `renderedMarkdown`/envelope as-is.
4. Execute task and required verification commands.
5. Register verification state (`spec_get_verifications` + `spec_record_verification`).
6. Transition task state with `spec_transition`.
7. **Post-execution reconciliation**: Run `spec_get_counters` and verify `completed` count incremented. If the task transition succeeded but counters did not change, warn: "Task transitioned but counters stale — possible DB inconsistency."
8. Emit outcome via `context_record_outcome`.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after implementation, write feedback entry to `dev-cellm-feedback/entries/implement-{date}-{seq}.md`. Note which DSE decisions influenced code, whether reuse search found matches, and which quality gate failures required iteration. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before implementing, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML. Worker crash = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only.

## NEVER

- **Skip preflight** — never implement without `context_preflight`.
- **Build custom ranking in-skill** — ranking/merge belongs to SCE.
- **Bypass spec transitions** — task state must be persisted in CellmOS.
- **Skip outcome write-back** — reusable outcomes must be recorded.
- **Ignore hard failures** — dependency/directive/certify blockers must be escalated.

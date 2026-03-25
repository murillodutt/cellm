---
description: "CELLM feature construction engine — builds new capabilities from CONSTRUCT findings or direct feature requests. Designs architecture, decomposes into CellmOS specs, implements end-to-end, certifies via Argus. Use when: 'build', 'construct', 'create feature', 'implement new', 'hefesto on X', 'implement the CONSTRUCT items'. Does not fix existing code (that is Asclepius)."
user-invocable: true
argument-hint: "[feature description, CONSTRUCT finding ID, or block target]"
allowed-tools: mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_certify, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_add_edge, Read, Grep, Glob, Write, Edit, Bash, Task, AskUserQuestion
---

# Hefesto — The Builder

Build new capabilities from specs using SCE as the context and governance backbone.

## Intent

- Use Hefesto for feature construction (not bug-fix remediation).
- Keep delivery spec-first and certification-oriented.

## Policy

- Start from an existing or newly created check (`spec_search` / `spec_create_node`).
- Run `context_preflight` before phase execution (`flow='hefesto'`).
- Use `context_certify` for critical/strict flows before execution-ready transitions.
- Record execution outcomes through `context_record_outcome`.
- Keep decomposition and state transitions in CellmOS (`spec_*` tools), not in markdown planning only.

## Routing

1. Resolve scope/check and load execution tree (`spec_search` + `spec_get_tree`).
2. Run SCE preflight and consume envelope/policy.
3. Decompose check into phases, then decompose each phase into atomic tasks.
4. Execute tasks, transitioning states in spec tree as each completes.
5. Invoke certification (`context_certify`) when risk/strictness requires.
6. Emit learning outcomes (`context_record_outcome`).
7. Escalate to user when blocked or when constraints conflict.

## Decomposition Rule

Every check MUST have 3 levels: **check -> phase -> task**.

| Level | nodeType | Body fields | Purpose |
|-------|----------|-------------|---------|
| Check | `check` | `context`, `problem`, `principle` | Top-level spec |
| Phase | `phase` | `description`, `briefing`, `specialist` | Work group |
| Task | `task` | `action`, `fileRef`, `diffExpected` | Atomic unit of work |

```
NEVER execute a phase directly as if it were a task.
ALWAYS create 1+ tasks under each phase before starting execution.
Tasks are what spec_claim_next returns — phases without tasks break swarm execution.
```

Decomposition sequence:
1. `spec_create_node(nodeType: 'check')` — top-level
2. `spec_create_node(nodeType: 'phase', parentId: checkId)` — per work group
3. `spec_create_node(nodeType: 'task', parentId: phaseId)` — per atomic action
4. `spec_add_edge` — dependency edges between phases/tasks

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: write `dev-cellm-feedback/entries/hefesto-{date}-{seq}.md` after Post-Construction.

Capture: research effectiveness (which MCP sources worked), design accuracy (did approach survive Argus), contract chain gaps, edge case misses, phase structure issues, shadow verification value, Argus finding categorization (construction defect vs pre-existing vs false positive).

Format: see `dev-cellm-feedback/README.md`.

## Olympus Integration

When prompt contains `[OLYMPUS CONTEXT]`:

| Aspect | Standard | Olympus |
|--------|----------|---------|
| Feature source | Direct request / CONSTRUCT findings | OLYMPUS CONTEXT `FINDINGS TO BUILD` list |
| Resolution | Journal only | Also `triad_resolve_finding` after each build |
| Session | None | Extract `session_id` from context |
| Spec linkage | Normal | Pass `specId` to `triad_resolve_finding` |
| Report path | `docs/cellm/reports/` | `~/.cellm/reports/` |

Resolutions: `built`, `blocked`, `false_positive`.

## NEVER

- **Build outside spec flow** — no spec, no Hefesto execution.
- **Skip SCE preflight/certify** — context and gate decisions must come from SCE.
- **Duplicate runtime policy in-skill** — avoid local gate logic that conflicts with Worker.
- **Skip outcome write-back** — construction outcomes must feed learning loop.
- **Continue blindly on blockers** — escalate when dependency/certify/policy blocks.
- **Execute phases without tasks** — phases are work groups, tasks are atomic actions. Always decompose phases into tasks before executing.

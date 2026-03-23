---
description: "Execute CellmOS spec tasks using Agent Teams with parallel phase execution. Creates a coordinated team of specialist agents (implementer, reviewer, auditor) that work simultaneously on independent DAG phases in isolated worktrees. Use when: 'orchestrate-teams', 'run with teams', 'parallel execution', 'agent teams', 'swarm execute'. Prefer over /cellm:orchestrate when the spec has 3+ independent phases or when maximum throughput is desired."
user-invocable: true
argument-hint: "[spec check ID or search term]"
---

# Orchestrate Teams — Parallel Spec Execution via Agent Teams

The spec tree is the execution plan. This skill uses Claude Code's Agent Teams to execute **independent phases in parallel** while respecting DAG dependencies.

## How This Differs from `/cellm:orchestrate`

| Aspect | `/cellm:orchestrate` | `/cellm:orchestrate-teams` |
|--------|---------------------|---------------------------|
| Execution | Sequential — 1 phase at a time | Parallel — independent DAG phases simultaneously |
| Agents | Generic subagents, no coordination | Named team members with shared task list |
| Isolation | Optional worktree | Mandatory worktree per agent |
| Communication | None between agents | SendMessage for coordination |
| Best for | Small specs (< 10 tasks) | Large specs (10+ tasks), multi-phase DAGs |

## Framework

### 1. Detect and Load

```
git rev-parse --show-toplevel → project name
spec_get_tree → phases, tasks, states
spec_get_counters → progress
```

### 2. Analyze DAG for Parallelism

Read the spec tree edges to identify **parallelism groups** — sets of phases that can execute simultaneously because they have no blocking dependencies between them.

```
Example DAG:
A (infrastructure)
├── B (DB layer)      ← blocks C
├── D (non-null)      ← independent of B,C
├── E (error handling) ← independent
├── F (migration)      ← independent
└── G (final sweep)    ← depends on ALL

Parallelism groups:
  Group 0: [A]           ← must complete first
  Group 1: [B, D, E, F]  ← all independent, run in parallel
  Group 2: [C]           ← depends on B
  Group 3: [G]           ← depends on all
```

Algorithm:
1. Find all phases with no unsatisfied `blocks`/`depends_on` edges → these form the current parallel group
2. Execute the group
3. After completion, re-evaluate edges to find the next group
4. Repeat until all phases complete

### 3. Create Team

Before executing the first parallel group, create the team:

```
TeamCreate({
  team_name: "v5-hardening",
  description: "Runtime Hardening V5 — parallel phase execution"
})
```

Then create tasks in the team's task list corresponding to spec phases using TaskCreate.

### 4. Execute Parallel Group

For each phase in the current parallel group, spawn a teammate:

```
Agent({
  description: "Phase B: DB Layer",
  team_name: "v5-hardening",
  name: "phase-b-implementer",
  subagent_type: <guild-mapped-type>,
  isolation: "worktree",
  mode: "bypassPermissions",
  prompt: <context-envelope>
})
```

**Spawn ALL phases in the group in a SINGLE message** — this is critical for true parallelism. Do not wait for one to finish before spawning the next.

### 5. Guild-to-Agent-Type Mapping

Map the phase's `specialist.role` to the appropriate `subagent_type`:

| specialist.role | subagent_type | Rationale |
|----------------|---------------|-----------|
| `frontend` | `gdu:gdu-implementer` | Has GDU framework knowledge, Nuxt UI MCP access |
| `backend` | `cellm:implementer` | Has Drizzle, Zod, H3 patterns |
| `database` | `cellm:implementer` | Same toolset, different briefing |
| `audit` | `cellm:reviewer` | Read-only, quality focus |
| `fullstack` | `cellm:implementer` | General implementation |

If the project has custom agents in `.claude/agents/` that match the role better, prefer those.

### 6. Context Envelope (Same as orchestrate)

Each agent prompt MUST include the full Context Envelope:

1. **Check Briefing**: context, problem, principle (verbatim)
2. **Phase Briefing**: objective, successCriteria, keyFiles, constraints (verbatim)
3. **Predecessor Type Contracts**: Inline exported types from completed predecessor phases (max 200 lines)
4. **DSE Decisions**: From `dse_search` for the phase domain
5. **Active Directives**: From `directive_list` after Stage 0 emit
6. **Guild Mindset**: Role-specific instructions

The agent starts with an empty context window. File paths alone are insufficient — inline the actual type definitions and constraints.

### 7. Director Stage 0 (Pre-Flight)

Before spawning ANY phase's agent, complete Stage 0 for ALL phases in the parallel group:

```
For each phase in group:
  1. directive_list(specNodeId, state='active')
  2. If zero active AND role has Director → directive_emit_for_phase(...)
  3. Collect directives for the Context Envelope
```

Do this BEFORE spawning agents — the directives go into the prompt.

### 8. Monitor and Merge

After spawning a parallel group:

1. **Wait for notifications** — teammates send idle notifications when done
2. **Read results** — check each agent's output for success/failure
3. **Merge worktrees** — if agents used worktree isolation, merge branches:
   ```
   git merge <worktree-branch> --no-edit
   ```
   Resolve conflicts if needed (unlikely for independent phases)
4. **Directive verify** — `directive_verify(specNodeId)` for each completed phase
5. **Transition states** — `spec_transition(completed)` for each task/phase
6. **Handle failures** — if an agent failed, create gap nodes and reassign

### 9. Inter-Group Checkpoint

After a parallel group completes:

1. Show progress: `spec_get_counters`
2. Show which phases completed, which failed
3. Ask user: "Group N complete (X/Y phases passed). Continue to next group?"
4. On confirmation, re-analyze DAG for next parallel group

### 10. Completion

When all phases complete:

1. `spec_get_counters` — final summary
2. `spec_transition(completed)` on the check
3. Clean up team: send shutdown to all teammates
4. Report total time, tokens, phases parallelized

## Parallelism Safety Rules

1. **Never parallelize phases with `blocks` edges between them** — the DAG is law
2. **Worktree isolation is mandatory** — parallel agents editing the same files without isolation causes corruption
3. **Merge after each group** — do not start the next group until all worktrees from the current group are merged
4. **Typecheck after merge** — run `npx nuxt typecheck` after merging a group to catch cross-phase conflicts
5. **Director emit BEFORE spawn** — directives must be in the prompt, not fetched by the agent (agents cannot access MCP in background)

## Error Recovery

| Situation | Action |
|-----------|--------|
| Agent fails with error | Mark task as `failed`, log reason, continue with remaining agents |
| Merge conflict | Resolve manually, then continue |
| Typecheck fails after merge | Identify conflicting phases, fix inline, re-verify |
| Agent timeout | Send shutdown, mark as `blocked`, reassign to new agent |
| All agents in group fail | Stop, escalate to user with findings |

## Re-entry

If resuming a previous orchestration:
1. Read team config from `~/.claude/teams/{team-name}/config.json`
2. Check spec counters for progress
3. Skip completed phases
4. Resume from first pending parallel group
5. Show: "Resuming: X/Y completed. Next parallel group: [phase names]"

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: write feedback to `dev-cellm-feedback/entries/orchestrate-teams-{date}-{seq}.md`. Include:
- Parallelism achieved: how many phases ran simultaneously per group
- Wall-clock time vs sequential estimate
- Merge conflicts encountered
- Agent failures and recovery actions
- Director metrics: emitCount, verifyCount, skipCount
- Which guild activations were effective
- Whether context materialization was sufficient

## Fallback Verification (CELLM_DEV_MODE only)

When `CELLM_DEV_MODE: true` (verify via `get_status` MCP -> `config.devMode`):

Before launching teams, extract the fallback path from the check's `context` field (look for `[fallback: .claude/specs/...]`). If not in context, try `.claude/specs/{check-slug}.yaml`. Check if the file exists:
- If EXISTS: `[+] Fallback YAML found: {path} — Worker crash recoverable`
- If MISSING: `[!] No fallback YAML. Worker crash during team execution = unrecoverable spec loss. Generate with /cellm:plan-to-spec or create manually.`

Do NOT block execution if missing — warn only.

## NEVER

- **Parallelize dependent phases** — DAG edges are inviolable
- **Skip worktree isolation** — parallel writes to same files = corruption
- **Skip Director Stage 0** — emit directives BEFORE spawning, not after
- **Spawn agents one at a time** — launch the entire parallel group in ONE message
- **Skip merge verification** — typecheck after every group merge
- **Auto-continue between groups** — always checkpoint with user
- **Lose progress** — transition states in DB after each phase completes
- **Skip Context Envelope** — agents start empty, inline everything
- **Defer feedback** — write before final message, there is no later

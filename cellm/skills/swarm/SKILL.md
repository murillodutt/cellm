---
description: "Execute CellmOS specs with autonomous agent swarm — N parallel Claude instances claiming tasks from a shared backlog via spec_claim_next. Inspired by Anthropic's C compiler pattern. Each agent loops independently: claim task, execute in worktree, commit, claim next. No central orchestrator bottleneck. Use when: 'swarm', 'swarm execute', 'parallel swarm', 'autonomous agents', 'agent army', 'max throughput'. Premium execution mode — higher token cost, dramatically faster completion."
user-invocable: true
argument-hint: "[spec check ID or path] [--agents N] [--model sonnet|opus|haiku]"
---

# Swarm Execution — Autonomous Agent Army

> Inspired by [Anthropic's C compiler approach](https://www.anthropic.com/engineering/building-c-compiler): "Most of my effort went into designing the environment around Claude so that it could orient itself without me."

This skill launches N autonomous Claude instances that independently pull tasks from the CellmOS spec tree, execute them in isolated worktrees, and commit results. There is no central orchestrator — the spec tree IS the coordination mechanism.

## How It Works

```
┌─────────────────────────────────────────┐
│          CellmOS Spec Tree              │
│  (shared backlog via spec_claim_next)   │
│                                         │
│  [ ] Task A1    [~] Task B2 (agent-2)   │
│  [~] Task A2 (agent-1)    [ ] Task C1   │
│  [+] Task A3 (done)       [ ] Task D1   │
└──────┬──────────┬──────────┬────────────┘
       │          │          │
  ┌────▼────┐ ┌───▼────┐ ┌──▼─────┐
  │ Agent 1 │ │Agent 2 │ │Agent 3 │
  │ worktree│ │worktree│ │worktree│
  │  /wt-1  │ │ /wt-2  │ │ /wt-3  │
  └─────────┘ └────────┘ └────────┘
       │          │          │
       └──────────┴──────────┘
                  │
            git merge to main
```

## Why This Is Different

| Traditional Orchestrate | Swarm |
|------------------------|-------|
| 1 orchestrator manages N agents | N agents self-coordinate via spec tree |
| Sequential phases with parallel batches | Full parallelism — every agent independent |
| Orchestrator is bottleneck (context window, latency) | No bottleneck — spec_claim_next is O(1) |
| ~3-5 agents per batch | 5-20+ agents simultaneously |
| Orchestrator must materialize context | Each agent builds own context from task body |

## Framework

### 1. Parse Arguments

```
/cellm:swarm spec-0a807063 --agents 5 --model sonnet
```

| Arg | Default | Description |
|-----|---------|-------------|
| First positional | Required | Spec check ID or search term |
| `--agents` | 5 | Number of parallel agents |
| `--model` | sonnet | Model for agents (sonnet, opus, haiku) |

### 2. Validate Prerequisites

Before launching the swarm:

1. **Resolve spec** — `spec_get_node` or `spec_search` to find the check
2. **Get counters** — `spec_get_counters` to show current progress
3. **Verify pending tasks exist** — if all done, nothing to swarm
4. **Confirm with user** — show the plan:
   ```
   Swarm Launch Plan:
   - Check: Runtime Hardening V5 (32/49 pending)
   - Agents: 5 parallel Claude instances
   - Model: sonnet
   - Isolation: git worktree per agent
   - Cost estimate: ~$X based on Y pending tasks

   Each agent will autonomously:
   1. Call spec_claim_next to get next available task
   2. Read task body (action, fileRef, constraints)
   3. Read phase briefing (objective, keyFiles, specialist)
   4. Execute the task
   5. Commit to worktree branch
   6. Transition task to completed
   7. Loop back to step 1

   Continue? [Y/n]
   ```

### 3. Build Agent Prompt

The agent prompt is the soul of the swarm. It must be self-contained — the agent cannot ask questions or access the orchestrator's context.

```markdown
# Autonomous CellmOS Agent

You are an autonomous agent executing tasks from a CellmOS spec tree.
Your loop is: CLAIM → EXECUTE → COMMIT → REPEAT.

## Your Identity
- Project: {project}
- Check: {checkTitle}
- Check path: {checkPath}
- Agent ID: {agentId}

## Your Loop

1. **CLAIM**: Call `spec_claim_next({ project: "{project}", checkPath: "{checkPath}", actor: "implementer", metadata: { agent: "{agentId}" } })`
   - If `claimed: false` → all work is done. Exit cleanly.
   - If `claimed: true` → you have a task. Proceed.

2. **UNDERSTAND**: Read the claimed task:
   - `node.body.action` — what to do (imperative instruction)
   - `node.body.fileRef` — primary file to modify
   - `node.body.diffExpected` — whether you're modifying existing or creating new
   - Get parent phase: `spec_get_node({ nodeId: node.parentId })` for briefing, keyFiles, constraints

3. **DIRECTIVES**: Check for active directives on the parent phase:
   `directive_list({ project: "{project}", specNodeId: parentPhaseId, state: "active" })`
   - If directives exist, treat them as mandatory constraints (no @ts-ignore, no as any, etc.)
   - If the parent phase's specialist.role is "frontend" or "backend" and NO directives exist,
     call `directive_emit_for_phase` to generate them before proceeding
   - Include directive rules in your mental checklist for step 4 (EXECUTE)

4. **EXECUTE**: Follow the action precisely.
   - Read keyFiles from the phase briefing BEFORE making changes
   - Respect all constraints listed in the phase briefing
   - Respect all active directives from step 3
   - If the task says "Run typecheck" or "Run tests" — do it via Bash
   - If the task is verification-only (no fileRef), just run the checks

5. **VERIFY**: Before completing:
   - If the task modified TypeScript files, run: `npx nuxt typecheck 2>&1 | tail -5`
   - If tests are relevant: `cd oracle && bun test 2>&1 | tail -5`
   - If directives exist, call `directive_verify({ project: "{project}", specNodeId: parentPhaseId })` to check compliance
   - Fix any errors or violations you introduced (not pre-existing ones)

6. **COMPLETE**: Transition the task:
   `spec_transition({ nodeId: "{taskId}", event: "completed", project: "{project}", actor: "implementer", metadata: { agent: "{agentId}" } })`
   If verification failed and you cannot fix it:
   `spec_transition({ nodeId: "{taskId}", event: "failed", project: "{project}", metadata: { reason: "..." } })`

7. **LOOP**: Go back to step 1. Claim the next task.

## Rules
- NEVER skip the claim step — spec_claim_next handles dependencies and locking
- NEVER modify files outside your task's scope (fileRef + keyFiles)
- ALWAYS commit your changes before completing a task
- If you encounter a merge conflict, mark the task as failed with the conflict details
- If spec_claim_next returns no work, exit — do NOT idle or poll
- On FAILURE: always call spec_transition(failed) AND SendMessage to the team lead explaining what went wrong

## Check Context
{checkContext}
{checkProblem}
{checkPrinciple}
```

### 4. Launch Agents

**Pre-flight:** Check if `TeamCreate` is available. Report mode to user.

#### Team Mode Launch

```typescript
// Step 1: Create team
TeamCreate({ team_name: "swarm-v5", description: "Autonomous swarm for V5" })

// Step 2: Spawn ALL agents in ONE message (critical for parallelism)
Agent({
  description: "Swarm agent 1",
  team_name: "swarm-v5",
  name: "agent-1",
  subagent_type: "cellm:implementer",
  isolation: "worktree",
  mode: "bypassPermissions",
  prompt: agentPrompt.replace("{agentId}", "agent-1")
})
Agent({
  description: "Swarm agent 2",
  team_name: "swarm-v5",
  name: "agent-2",
  ...same pattern...
})
// ... up to N agents
```

#### Headless Mode Launch

```typescript
// No TeamCreate — spawn agents directly in ONE message
Agent({
  description: "Swarm agent 1",
  name: "agent-1",
  subagent_type: "cellm:implementer",
  isolation: "worktree",
  mode: "bypassPermissions",
  prompt: agentPrompt.replace("{agentId}", "agent-1")
})
Agent({
  description: "Swarm agent 2",
  name: "agent-2",
  ...same pattern...
})
// ... up to N agents
```

In both modes, all agents launch simultaneously. Each claims different tasks via `spec_claim_next` atomic locking. The only difference is whether `team_name` is passed.

### 5. Monitor Progress and Handle Failures

#### Team Mode Monitoring

1. **Idle notifications arrive automatically** — no polling needed. Each notification includes a summary of what the agent did.
2. **Check spec counters** — `spec_get_counters` periodically to see global progress
3. **Detect failures** via two signals:
   - **Agent sends explicit message** — when an agent calls `spec_transition(failed)`, it also sends `SendMessage` to the lead: `"Task {taskId} failed: {reason}"`
   - **Stuck detection** — if `spec_get_counters` shows `in_progress` tasks with no corresponding active agent, the task is stuck. Mark as `failed` and let another agent claim it.

#### Headless Mode Monitoring

Without SendMessage, the lead relies on:

1. **Agent completion notifications** — the Agent tool notifies when each agent finishes (returns result or errors)
2. **`spec_get_counters`** — the primary coordination mechanism. Poll after each agent notification to see progress.
3. **Stuck detection** — same as team mode: `in_progress` tasks with no active agent = stuck.

#### Failure Handling (both modes)

- **Recoverable** (test failure, typecheck error): `spec_transition({ nodeId, event: "reopened" })` to reset to pending. Another agent will claim it next loop.
- **Blocked** (dependency issue, merge conflict): `spec_transition({ nodeId, event: "blocked", metadata: { reason } })`. Report to user.
- **Needs human** (architectural decision, ambiguous spec): Report to user via AskUserQuestion.

### 6. Merge and Verify

After all agents have gone idle with no more work:

1. **Merge all worktree branches** into main:
   ```bash
   for branch in $(git branch | grep worktree-agent); do
     git merge $branch --no-edit
   done
   ```
2. **Run full verification**:
   ```bash
   npx nuxt typecheck
   cd oracle && bun test
   ```
3. **Fix any merge conflicts or cross-agent type errors**
4. **Commit the merge**

### 7. Report

Show final results:
```
Swarm Complete:
- Tasks completed: 45/49
- Tasks failed: 2 (blocked by dependency)
- Tasks remaining: 2
- Agents used: 5
- Wall-clock time: ~15 minutes
- Sequential estimate: ~2 hours
- Speedup: ~8x
```

## Cost Estimation

| Model | ~Cost per task | 49 tasks | 5 agents wall-clock |
|-------|---------------|----------|---------------------|
| Haiku | ~$0.05 | ~$2.50 | ~5 min |
| Sonnet | ~$0.30 | ~$15 | ~15 min |
| Opus | ~$1.50 | ~$75 | ~30 min |

These are rough estimates. Actual cost depends on task complexity and context window usage.

## When NOT to Use Swarm

- **< 5 tasks** — overhead of team creation exceeds benefit. Use `/cellm:implement`
- **Highly sequential DAG** — if every phase depends on the previous, no parallelism is possible. Use `/cellm:orchestrate`
- **Schema-changing tasks** — Phase B of V5 (Drizzle JSON mode) changes types that cascade. Better done sequentially with typecheck between each table
- **Budget-constrained** — swarm multiplies token cost by agent count. Use `/cellm:orchestrate` for sequential execution

## Execution Modes

The swarm operates in two modes depending on whether Agent Teams is available. **Detection is automatic** — the skill checks for `TeamCreate` tool availability at launch.

### Team Mode (Agent Teams active)

**Requires:** `TeamCreate` tool available (Claude Code with Agent Teams feature enabled)

**How to enable Agent Teams:**
- Set environment variable: `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
- Or enable in Claude Code settings if available as a feature flag

**Benefits:**
- Named team with shared task list
- `SendMessage` between agents and lead for failure reporting
- Idle notifications when agents finish turns
- Team config at `~/.claude/teams/{name}/config.json` for member discovery

### Headless Mode (no Agent Teams)

**Requires:** Only the `Agent` tool (available in all Claude Code versions)

**How it works:** Each agent is spawned via `Agent({ isolation: "worktree" })` without `team_name`. Agents are fully independent — no SendMessage, no shared task list. Coordination happens ONLY through `spec_claim_next` (the spec tree is the backlog).

**Trade-offs vs Team Mode:**

| Aspect | Team Mode | Headless Mode |
|--------|-----------|---------------|
| Failure reporting | SendMessage to lead | Lead polls `spec_get_counters` |
| Agent discovery | Team config file | None — lead tracks spawn results |
| Coordination | Task list + messages | `spec_claim_next` only |
| Works on | Claude Code with Agent Teams | Any Claude Code version |

Both modes produce identical results — the same tasks get claimed, executed, and completed. The difference is observability and coordination richness.

### Pre-flight Detection

At launch, before spawning agents:

```
1. Check if TeamCreate tool is available (try to resolve it)
2. If YES → Team Mode: create team, spawn with team_name
3. If NO  → Headless Mode: spawn agents directly with worktree isolation
4. Report mode to user: "Launching in [Team/Headless] mode with N agents"
```

## Safety

- **Worktree isolation** — each agent works in a separate git worktree. No file conflicts during execution.
- **Atomic task claiming** — `spec_claim_next` uses database-level idempotency guards. Two agents cannot claim the same task.
- **DAG enforcement** — `spec_claim_next` checks dependencies before claiming. Blocked tasks are skipped automatically.
- **State machine** — `spec_transition` validates all state changes. Invalid transitions are rejected.
- **Merge verification** — full typecheck + test suite after merge catches cross-agent conflicts.

## NEVER

- **Skip user confirmation** — always show launch plan and get approval before spawning
- **Launch without pending tasks** — check counters first
- **Run more agents than pending tasks** — waste of resources
- **Skip merge verification** — typecheck + tests after merge are mandatory
- **Use for sequential specs** — if DAG is linear, use `/cellm:orchestrate` instead
- **Ignore failed tasks** — every failure must be reported and addressed

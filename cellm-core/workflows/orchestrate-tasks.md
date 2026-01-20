---
id: WF-ORCHESTRATE-TASKS
version: v1.1.0
status: OK
workflow: orchestrate-tasks
phase: implementation
agent: project-manager
budget: ~350 tokens
---

# Task Orchestration

## Pre-conditions

- tasks.md exists
- Tasks have group markers (##)

## Flow

1. Parse task groups from tasks.md
2. Validate dependencies between groups
3. For each group:
   - Execute /implement for each task
   - Run /verify if critical
   - Checkpoint on completion
4. Generate summary report

## Scale Detection

Detect level from tasks.md:

| Tasks | Level | Checkpoint | Mode |
 | ------- |------- | ------------ |------|
| 1-2 | 0-1 | After completion | standard |
| 3-5 | 2 | Per task | standard |
| 6-10 | 3 | Per group | resilient |
| 10+ | 4 | Per phase | interactive |

## Adaptive Behavior

**Level 0-1 (Micro):**

- Execute all tasks sequentially
- Single checkpoint at end
- No intermediate verification

**Level 2 (Small):**

- Execute tasks in order
- Checkpoint after each task
- Continue on non-critical failures

**Level 3 (Medium):**

- Group tasks by dependency
- Checkpoint after each group
- Run /verify on critical groups
- Pause on blocking failures

**Level 4 (Large):**

- Break into phases (setup, core, integration, polish)
- Interactive confirmation between phases
- Full /verify after each phase
- Generate progress report per phase

## Failure Handling

| Failure Type | Level 0-2 | Level 3-4 |
 | -------------- |----------- | ----------- |
| Type error | Fix and continue | Pause, ask user |
| Test failure | Log and continue | Block until fixed |
| Missing dependency | Skip task | Block group |
| Critical error | Stop | Stop + rollback guidance |

## Validation

- [ ] All groups completed
- [ ] No blocking failures
- [ ] Summary generated
- [ ] tasks.md updated

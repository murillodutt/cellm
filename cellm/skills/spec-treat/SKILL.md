---
name: spec-treat
description: Treat a spec check — work through phases and tasks sequentially, transitioning states, executing actions, recording gaps, and running verifications.
argument-hint: "query: check title or search term"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_counters, AskUserQuestion, Read, Edit, Write, Bash, Grep, Glob
---

# Spec Treat — Work Through a Check

Take a spec check and systematically work through each phase and task.

## Process

### 1. Find the Check

Search for the check using the argument:

```
spec_search({
  project: <detected>,
  query: <argument>,
  nodeType: "check",
  limit: 5
})
```

If multiple matches, use AskUserQuestion to let user pick.
If no matches, report and stop.

### 2. Load the Full Tree

```
spec_get_tree({
  project: <detected>,
  path: <check.path>,
  format: "json"
})
```

### 3. Show Briefing

Display the check's Context / Problem / Principle:

```
CHECK: Update @nuxt/ui 4.4.0 -> 4.5.0
Context:  @nuxt/ui was updated from 4.4.0 to 4.5.0 via Stack Tracker.
Problem:  Watch items require review: breaking changes, security fixes.
Principle: Every dependency update that impacts project code must have verified tasks.

Progress: 0/3 tasks (0%)
Phases: 1
```

### 4. Transition Check to Active

If check state is `pending`:

```
spec_transition({ nodeId: <check.id>, event: "started", actor: "implementer" })
```

### 5. Work Through Each Phase

For each phase (in sort order):

#### 5a. Transition Phase to Active/In-Progress

```
spec_transition({ nodeId: <phase.id>, event: "started" })
spec_transition({ nodeId: <phase.id>, event: "started" })  // active -> in_progress
```

#### 5b. For Each Task in the Phase

For each task (in sort order):

1. **Show the task:**
   ```
   Phase 1/1: Review and Update
   Task 1/3: Evaluate: breaking changes
   Action: Check if "breaking changes" affects project code
   File: (none)
   ```

2. **Transition to in_progress:**
   ```
   spec_transition({ nodeId: <task.id>, event: "started" })
   spec_transition({ nodeId: <task.id>, event: "started" })
   ```

3. **Execute the action:**
   - If task has `fileRef`: Read the file, analyze, make changes if needed
   - If task has `action` in body: Execute the described action
   - If task is evaluation: Research, analyze, and report findings
   - Use Read, Edit, Grep, Bash as needed

4. **Report result to user and ask:**
   Use AskUserQuestion:
   - "Task completed successfully" → transition to `completed`
   - "Task needs more work" → keep `in_progress`
   - "Task is blocked" → transition to `blocked`, ask for reason
   - "Skip this task" → transition to `cancelled`
   - "Found a gap" → create gap node, keep task state

5. **Transition based on answer:**
   ```
   spec_transition({ nodeId: <task.id>, event: "completed" })
   ```

6. **If gap discovered:**
   ```
   spec_create_node({
     project: <detected>,
     parentId: <phase.id>,
     nodeType: "gap",
     title: <gap description>,
     body: { discovery: <what was found>, discoveredDuring: <task.path> }
   })
   ```

#### 5c. After All Tasks in Phase

1. Check if all tasks are completed
2. If yes, transition phase to completed:
   ```
   spec_transition({ nodeId: <phase.id>, event: "completed" })
   ```
3. Run phase verifications if any exist

### 6. After All Phases

1. Get final counters:
   ```
   spec_get_counters({ project: <detected>, path: <check.path> })
   ```

2. Show summary:
   ```
   CHECK COMPLETE: Update @nuxt/ui 4.4.0 -> 4.5.0

   | Phase | Done | Total |
   |-------|------|-------|
   | Review and Update | 3 | 3 |

   Total: 3/3 tasks completed
   Gaps found: 0
   Verifications: 1 pass, 0 fail
   ```

3. If all tasks done, transition check to completed:
   ```
   spec_transition({ nodeId: <check.id>, event: "started" })  // active -> in_progress
   spec_transition({ nodeId: <check.id>, event: "completed" })
   ```

### 7. Handle Interruption

If the user wants to stop mid-check:
- Keep current states as-is (in_progress tasks stay in_progress)
- Show progress so far
- Suggest: "Use `/spec treat <check>` again to continue where you left off"

The system automatically skips completed tasks on re-entry (state = completed means already done).

## Task Execution Patterns

| Task Type | How to Execute |
|-----------|---------------|
| Evaluate: X | Research X, check if it affects project code, report findings |
| Review breaking changes | Read changelog, grep for affected APIs in codebase |
| Update file:line | Read file, make the change, verify with grep |
| Run migration | Execute the migration command |
| Add/modify code | Write or Edit the file |
| Verify endpoint | Use Bash with curl |
| Run tests | Use Bash with bun test |

## Re-entry Behavior

When treating a check that was partially completed:

1. Skip tasks with state `completed` (show as done)
2. Resume from first `pending` or `in_progress` task
3. Show progress: "Resuming: 5/12 tasks already completed"

---
id: WF-CREATE-TASKS
version: v1.1.0
status: OK
workflow: create-tasks
phase: specification
agent: project-manager
budget: ~300 tokens
---

# Create Tasks

## Pre-conditions

- spec.md exists and is approved

## Steps

### 1. Analyze Spec

- Read full spec.md
- Identify user stories
- Identify technical requirements

### 2. Decompose into Task Groups

Group by:

1. Layer (DB → Backend → Frontend)
2. Dependency
3. Specialty

### 3. Sort

- Database tasks first
- Backend before frontend
- Dependencies resolved

### 4. Estimate

| Size | Description |
 | --------- |-----------|
| S | < 1 hour |
| M | 1-4 hours |
| L | > 4 hours (consider splitting) |

### 5. Generate tasks.md

```markdown
# Tasks: {Feature}

## Task Group 1: Database Schema

**Specialty:** backend
**Estimation:** M
**Dependencies:** none

### Tasks
- [ ] Create users table
- [ ] Create sessions table
- [ ] Add indexes

## Task Group 2: API Endpoints
...
```

## Output

specs/{current}/tasks.md

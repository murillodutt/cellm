---
command: create-tasks
agent: project-manager
---

# /create-tasks

## Load

- rules/core/*
- specs/{current}/spec.md

## Steps

1. Analyze spec.md
2. Decompose into task groups
3. Sort by dependency (DB → Backend → Frontend)
4. Estimate complexity
5. Assign specialty
6. Document in tasks.md

## tasks.md Structure

```markdown
# Tasks: {Feature Name}

## Task Group 1: {Name}

**Specialty:** backend | frontend | fullstack
**Estimation:** S | M | L
**Dependencies:** none | Task Group X

### Tasks
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Task Group 2: {Name}
...
```

## Grouping Strategy

1. By technical layer (DB → Backend → Frontend)
2. By user flow
3. By dependency

## Output

specs/{current}/tasks.md

---
id: TPL-TASKS
version: v0.10.0
status: OK
template: true
budget: ~250 tokens
---

# tasks.md Template

```markdown
# Tasks: {Feature Name}

> Spec: {link to spec.md}
> Created: {date}

## Task Group 1: {Group Name}

**Specialty:** backend | frontend | fullstack
**Estimation:** S | M | L
**Dependencies:** none | Task Group X

### Tasks
- [ ] {Task 1 - clear and actionable description}
- [ ] {Task 2}
- [ ] {Task 3}

---

## Task Group 2: {Group Name}

**Specialty:** backend
**Estimation:** M
**Dependencies:** Task Group 1

### Tasks
- [ ] {Task 1}
- [ ] {Task 2}

---

## Task Group 3: {Group Name}

**Specialty:** frontend
**Estimation:** L
**Dependencies:** Task Group 2

### Tasks
- [ ] {Task 1}
- [ ] {Task 2}
- [ ] {Task 3}
- [ ] {Task 4}

---

## Summary

| Group | Specialty | Estimation | Status |
|-------|---------------|------------|--------|
| 1 | backend | M | [...] |
| 2 | backend | M | [...] |
| 3 | frontend | L | [...] |

**Estimated Total:** {sum}
```

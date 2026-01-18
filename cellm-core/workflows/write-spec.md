---
workflow: write-spec
phase: specification
agent: architect
---

# Write Spec

## Pre-conditions

- requirements.md exists
- tech-stack.md exists

## Steps

### 1. Analyze Requirements

- Read full requirements.md
- Check visuals (if they exist)

### 2. Generate User Stories

```markdown
### US-001: {Title}
**As** {persona}
**I want** {action}
**So that** {benefit}

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2
```

### 3. Define Technical Approach

- Affected layers (DB, API, UI)
- Components to create
- Components to modify

### 4. Search for Reuse

- Perform mental /reuse-check
- List reusable components

### 5. Define Scope

- Explicitly list OUT of scope
- Avoid scope creep

### 6. Generate spec.md

## Output

specs/{current}/spec.md

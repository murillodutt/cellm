---
workflow: shape-spec
phase: specification
agent: architect
---

# Shape Spec

## Pre-conditions

- mission.md exists
- roadmap.md exists

## Steps

### 1. Select Feature

- Consult roadmap.md
- Identify the next feature

### 2. Create Structure

```
specs/{YYYY-MM-DD}-{feature}/
  planning/
    requirements.md
    visuals/
```

### 3. Research

Mandatory questions:
- What problem does it solve?
- Who uses it?
- Acceptance criteria?
- Dependencies?
- Technical constraints?
- Existing similar components?

### 4. Document Requirements

```markdown
# Requirements: {Feature}

## Problem
{description}

## Functional Requirements
- RF-001: {req}

## Non-Functional Requirements
- RNF-001: {req}

## Acceptance Criteria
- [ ] Criterion 1

## Dependencies
- {dep}

## Constraints
- {constraint}
```

## Output

specs/{date}-{feature}/planning/requirements.md

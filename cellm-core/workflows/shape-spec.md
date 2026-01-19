---
id: WF-SHAPE-SPEC
version: v0.10.0
status: OK
workflow: shape-spec
phase: specification
agent: architect
budget: ~350 tokens
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

```text
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

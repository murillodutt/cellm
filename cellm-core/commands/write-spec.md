---
id: CMD-WRITE-SPEC
version: v0.10.0
status: OK
command: write-spec
agent: architect
budget: ~300 tokens
---

# /write-spec

## Load

- rules/core/*
- patterns/anti/*
- specs/{current}/planning/requirements.md
- project/product/tech-stack.md

## Steps

1. Read full requirements.md
2. Analyze visuals (if any)
3. Generate user stories
4. Define technical approach
5. Identify reusable components
6. Define scope boundaries
7. Document in spec.md

## spec.md Structure

```markdown
# {Feature Name}

## Summary
Brief description of the feature.

## User Stories

### US-001: {Title}
**As** {persona}
**I want** {action}
**So that** {benefit}

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

## Functional Requirements
- RF-001: {requirement}

## Non-Functional Requirements
- RNF-001: {requirement}

## Technical Approach
Implementation description.

## Reusable Components
- {component}: {reason}

## Out of Scope
- {excluded item}
```

## Output

specs/{current}/spec.md

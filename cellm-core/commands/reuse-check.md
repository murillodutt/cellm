---
command: reuse-check
agent: architect
---

# /reuse-check

## Objective

Identify reusable code before implementing.

## Steps

### 1. Intent Analysis

Ask:
- What do you intend to create?
- What is the main functionality?

### 2. Layered Search

Search order:
1. shared/ → Shared utils and types
2. app/composables/ → Existing composables
3. app/components/ → Existing components
4. server/services/ → Existing services
5. server/utils/ → Server utils

### 3. Match Criteria

- Functional similarity > 70%
- Same problem domain
- Compatible signature
- No conflicting side effects

### 4. Decision

```
IF match >= 90%:
  → REUSE directly
  → Import and use

IF match 70-89%:
  → EXTEND existing module
  → Add parameters/configuration

IF match < 70%:
  → CREATE new module
  → Document decision
```

## Output

Recommendation with justification:
- Module found (if any)
- Match percentage
- Recommended action
- Example code

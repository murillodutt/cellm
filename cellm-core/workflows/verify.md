---
workflow: verify
phase: implementation
agent: reviewer
---

# Verify

## Pre-conditions

- All tasks marked [x]
- Code implemented

## Checklist

### Code Quality

- [ ] TypeScript compiles without errors
- [ ] No usage of `any`
- [ ] No console.log
- [ ] No commented-out code
- [ ] Within limits (lines, functions)

### Spec Compliance

- [ ] All user stories met
- [ ] All functional requirements
- [ ] Non-functional requirements
- [ ] Acceptance criteria

### Standards

- [ ] Naming conventions followed
- [ ] Import order correct
- [ ] File structure correct
- [ ] Conventional commits

### Patterns

- [ ] Anti-patterns respected
- [ ] Stack patterns followed
- [ ] Semantic tokens used

### Tests

- [ ] Unit tests exist
- [ ] Tests passing
- [ ] Adequate coverage

## Output

```markdown
# Verification: {Feature}

## Status: [+] APPROVED | [!] WITH CAVEATS | [-] REJECTED

## Checklist
[results]

## Issues Found
- {issue 1}
- {issue 2}

## Recommendations
- {rec 1}
```

Save to: specs/{current}/verification/final.md

---
id: CMD-VERIFY
version: v1.1.0
status: OK
command: verify
agent: reviewer
budget: ~200 tokens
---

# /verify

## Load

- rules/core/*
- patterns/anti/*
- specs/{current}/spec.md
- specs/{current}/tasks.md

## Checklist

### Quality

- [ ] TypeScript no errors
- [ ] No `any`
- [ ] No console.log
- [ ] Limits respected

### Compliance

- [ ] User stories met
- [ ] Requirements implemented

### Standards

- [ ] Naming OK
- [ ] Imports OK
- [ ] Structure OK

## Output

specs/{current}/verification/final.md

---
id: CMD-SHAPE-SPEC
version: v0.10.0
status: OK
command: shape-spec
agent: architect
budget: ~200 tokens
---

# /shape-spec

## Load

- rules/core/*
- patterns/anti/*
- project/product/roadmap.md
- project/product/tech-stack.md

## Steps

1. Consult roadmap for the next feature
2. Create folder specs/{date}-{feature}/
3. Conduct research dialogue
4. Collect functional requirements
5. Collect non-functional requirements
6. Identify necessary visuals
7. Document in requirements.md

## Research Questions

- What problem does this feature solve?
- Who are the affected users?
- What are the acceptance criteria?
- Are there dependencies on other features?
- Are there technical constraints?
- Are there similar components in the codebase?

## Output

- specs/{date}-{feature}/planning/requirements.md
- specs/{date}-{feature}/planning/visuals/ (if any)

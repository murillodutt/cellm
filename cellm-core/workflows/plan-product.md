---
id: WF-PLAN-PRODUCT
version: v1.1.0
status: OK
workflow: plan-product
phase: planning
agent: architect
budget: ~350 tokens
---

# Plan Product

## Pre-conditions

- Project initialized
- CLAUDE.md exists

## Steps

### 1. Collect Vision

Ask:

- What is the product name?
- What problem does it solve?
- Who are the target users?

### 2. Define Mission

Generate mission.md:

```markdown
# {Product}

## Vision
{description}

## Mission
{objective}

## Users
- {persona 1}
- {persona 2}

## Differentiators
- {differentiator 1}
```

### 3. Create Roadmap

Generate roadmap.md:

```markdown
# Roadmap

## MVP
- [ ] Feature 1
- [ ] Feature 2

## V1.0
- [ ] Feature 3

## Future
- [ ] Feature 4
```

### 4. Confirm Stack

Generate/validate tech-stack.md

## Output

- project/product/mission.md
- project/product/roadmap.md
- project/product/tech-stack.md

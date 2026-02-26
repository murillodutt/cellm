---
name: write-spec
description: Create a detailed technical specification from shaping output. Formalizes requirements into data models, API contracts, component structure, and acceptance criteria.
argument-hint: "[spec-folder-path]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

Formalize shaping output into `spec.md`. Reads shape.md + plan.md from a spec folder created by `/cellm:shape`.

## Thinking Framework

1. **Locate** — Argument or most recent folder in `cellm-core/specs/`. Ask via AskUserQuestion if ambiguous.
2. **Absorb** — Read shape.md, plan.md, patterns.md, references.md.
3. **Clarify** — For each applicable area, ask via AskUserQuestion: Data Models, API Contracts, Components, State. Skip irrelevant areas.
4. **Constrain** — Search `cellm-core/patterns/` and Oracle for prior decisions.
5. **Write** — Generate `spec.md` with: Overview, Data Models, API Contracts, Components, State, Acceptance Criteria, Constraints.

## Spec Template

```markdown
# Spec: {Feature Name}
## Overview — Brief description
## Data Models — Schema with types, constraints, relations
## API Contracts — Method, path, request, response, errors
## Components — Tree with props, emits, slots
## State — Stores, shapes, computed
## Acceptance Criteria — Numbered testable requirements
## Constraints — Performance, security, accessibility
```

## NEVER

- **Write without shaping context** — always read shape.md first
- **Invent requirements** — every item traces to shaping or user confirmation
- **Include implementation details** — spec defines WHAT, not HOW
- **Skip acceptance criteria** — every feature needs testable criteria

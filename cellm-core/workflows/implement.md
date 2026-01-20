---
id: WF-IMPLEMENT
version: v1.1.0
status: OK
workflow: implement
phase: implementation
agent: implementer
budget: ~250 tokens
---

# Implementation

## Pre-conditions

- spec.md exists
- tasks.md exists

## Flow

1. Load context
2. Identify incomplete task
3. Search for reuse
4. Implement
5. Validate (no any, limits)
6. Mark task [x]

## Scale Detection

Detect complexity level from task scope:

| Level | Scope | Checkpoint | Verification |
 | ------- |------- | ------------ |--------------|
| 0 | Bug fix (1-2 lines) | None | Quick review |
| 1 | Small change (1 file) | After completion | Type check |
| 2 | Medium feature (2-3 files) | Per file | Type + lint |
| 3 | Large feature (4+ files) | Per component | Full verify |
| 4 | System change | Per phase | /verify command |

## Adaptive Behavior

**Level 0-1:** Execute directly, minimal validation
**Level 2:** Checkpoint after each file, validate types
**Level 3:** Checkpoint per component, run /verify on critical paths
**Level 4:** Break into sub-tasks, full /verify between phases

## Validation

- [ ] TypeScript OK
- [ ] No any
- [ ] No hardcoded colors
- [ ] Within limits

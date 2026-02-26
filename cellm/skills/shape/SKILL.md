---
description: Gather context and structure planning for significant work. Must run in plan mode. Collects scope, visuals, references, patterns, and produces a timestamped spec folder with plan, shape, and references docs.
argument-hint: "[feature description]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

**Requires plan mode.** If not in plan mode, stop and tell the user.

## Thinking Framework

1. **Scope** — What are we building? Clarify with 1-2 questions via AskUserQuestion.
2. **Visuals** — Ask for mockups, wireframes, screenshots, examples.
3. **References** — Ask about similar code in the codebase.
4. **Product context** — Read `cellm-core/project/product/` if it exists. Summarize relevant points.
5. **Patterns** — Read `cellm-core/patterns/index.yml`. Confirm which apply.
6. **Structure** — Generate folder `YYYY-MM-DD-HHMM-{feature-slug}/`. Task 1 is always "Save spec documentation".
7. **Present** — Full plan for approval.

## Output

```
cellm-core/specs/{YYYY-MM-DD-HHMM-feature-slug}/
  plan.md         # Full plan
  shape.md        # Shaping decisions
  patterns.md     # Applicable patterns
  references.md   # Similar code pointers
  visuals/        # Mockups, screenshots
```

## NEVER

- **Run outside plan mode** — stop immediately if not in plan mode
- **Batch questions** — one topic at a time, offer suggestions
- **Over-document** — this is shaping, not exhaustive specification

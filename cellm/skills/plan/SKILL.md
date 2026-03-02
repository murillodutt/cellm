---
description: Establish foundational product documentation through interactive conversation. Creates mission.md, roadmap.md, and tech-stack.md in cellm-core/project/product/ via guided Q&A.
user-invocable: true
argument-hint: "[product name]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

Gather product vision through AskUserQuestion (one question at a time) and generate docs in `cellm-core/project/product/`.

## Thinking Framework

1. **Check existing** — If `cellm-core/project/product/` has files, ask: start fresh, update, or cancel?
2. **Vision** (→ mission.md) — Problem? Users? Differentiator?
3. **Roadmap** (→ roadmap.md) — MVP features? Post-launch features?
4. **Stack** (→ tech-stack.md) — Check `cellm-core/patterns/core/` first. If patterns exist, confirm. If not, ask.
5. **Generate** — Write the 3 files. Report paths.

## Output

```
cellm-core/project/product/
  mission.md      # Problem, Target Users, Solution
  roadmap.md      # Phase 1 (MVP), Phase 2 (Post-Launch)
  tech-stack.md   # Frontend, Backend, Database, Other
```

## NEVER

- **Batch questions** — one at a time via AskUserQuestion
- **Over-document** — lightweight, not exhaustive
- **Ignore existing patterns** — check patterns/core/ before asking tech stack

---
name: plan
description: Establish foundational product documentation through interactive conversation. Creates mission.md, roadmap.md, and tech-stack.md in cellm-core/project/product/ via guided Q&A.
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

# Plan Product

Establish foundational product documentation through an interactive conversation. Creates mission, roadmap, and tech stack files in `cellm-core/project/product/`.

## Important Guidelines

- **Always use AskUserQuestion tool** when asking the user anything
- **Keep it lightweight** — gather enough to create useful docs without over-documenting
- **One question at a time** — don't overwhelm with multiple questions

## Process

### Step 1: Check for Existing Product Docs

Check if `cellm-core/project/product/` exists and contains any of these files:
- `mission.md`
- `roadmap.md`
- `tech-stack.md`

**If any files exist**, use AskUserQuestion to ask whether to start fresh, update specific files, or cancel.

**If no files exist**, proceed to Step 2.

### Step 2: Gather Product Vision (for mission.md)

Use AskUserQuestion for each question, one at a time:

1. **What problem does this product solve?**
2. **Who is this product for?**
3. **What makes your solution unique?**

### Step 3: Gather Roadmap (for roadmap.md)

Use AskUserQuestion:

1. **What are the must-have features for launch (MVP)?**
2. **What features are planned for after launch?**

### Step 4: Establish Tech Stack (for tech-stack.md)

First, check if `cellm-core/patterns/core/` contains any tech stack patterns.

**If patterns exist**, ask if the project uses the same tech stack.
**If no patterns exist**, ask them to specify their tech stack.

### Step 5: Generate Files

Create `cellm-core/project/product/` directory if needed, then generate:
- `mission.md` — Problem, Target Users, Solution
- `roadmap.md` — Phase 1 (MVP), Phase 2 (Post-Launch)
- `tech-stack.md` — Frontend, Backend, Database, Other

### Step 6: Confirm Completion

Report created files:

```
[+] Product documentation created:

  cellm-core/project/product/mission.md
  cellm-core/project/product/roadmap.md
  cellm-core/project/product/tech-stack.md
```

## Integration with CELLM

- **cellm-core/patterns/** — Pattern files inform tech stack detection
- **/cellm:shape** — Reads product docs when planning features
- **Oracle** — Can record product metadata for future reference

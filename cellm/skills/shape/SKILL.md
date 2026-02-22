---
name: shape
description: Gather context and structure planning for significant work. Must run in plan mode. Collects scope, visuals, references, patterns, and produces a timestamped spec folder with plan, shape, and references docs.
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

# Shape Spec

Gather context and structure planning for significant work. **Run this command while in plan mode.**

## Important Guidelines

- **Always use AskUserQuestion tool** when asking the user anything
- **Offer suggestions** — Present options the user can confirm, adjust, or correct
- **Keep it lightweight** — This is shaping, not exhaustive documentation

## Prerequisites

This command **must be run in plan mode**.

**Before proceeding, check if you are currently in plan mode.**

If NOT in plan mode, **stop immediately** and tell the user:

```
Shape-spec must be run in plan mode. Please enter plan mode first, then run /cellm:shape again.
```

Do not proceed with any steps below until confirmed to be in plan mode.

## Process

### Step 1: Clarify What We're Building

Use AskUserQuestion to understand the scope. Based on their response, ask 1-2 clarifying questions if the scope is unclear.

### Step 2: Gather Visuals

Use AskUserQuestion to ask for mockups, wireframes, screenshots, or examples.

### Step 3: Identify Reference Implementations

Use AskUserQuestion to ask about similar code in the codebase to study.

### Step 4: Check Product Context

Check if `cellm-core/project/product/` exists and read key files. If it exists, summarize relevant points and ask about alignment.

### Step 5: Surface Relevant Patterns

Read `cellm-core/patterns/index.yml` to identify relevant patterns. Use AskUserQuestion to confirm which to include.

### Step 6: Generate Spec Folder Name

Create a folder name using this format:
```
YYYY-MM-DD-HHMM-{feature-slug}/
```

### Step 7: Structure the Plan

Build the plan with **Task 1 always being "Save spec documentation"**.

Present structure to user for confirmation.

### Step 8: Complete the Plan

Build out remaining implementation tasks based on feature scope, reference implementations, and pattern constraints.

### Step 9: Ready for Execution

When the full plan is ready, present it for approval.

## Output Structure

The spec folder will contain:

```
cellm-core/specs/{YYYY-MM-DD-HHMM-feature-slug}/
  plan.md           # The full plan
  shape.md          # Shaping decisions and context
  patterns.md       # Which patterns apply and key points
  references.md     # Pointers to similar code
  visuals/          # Mockups, screenshots (if any)
```

## Integration with CELLM

- **cellm-core/patterns/** — Pattern files for context injection
- **cellm-core/project/product/** — Product context (roadmap, tech-stack)
- **Oracle** — Can record spec metadata for future reference
- **/cellm:inject** — Uses same index.yml for pattern discovery

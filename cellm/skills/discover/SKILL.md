---
description: "Extract tribal knowledge from a codebase into CELLM pattern files in cellm-core/patterns/. Analyzes code for unusual, opinionated, or tribal conventions. Use when: 'discover patterns', 'extract conventions', 'what patterns exist here'."
user-invocable: true
argument-hint: "[focus area]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

Scan for tribal knowledge — conventions that are unusual, opinionated, or invisible to newcomers. Write as pattern files in `cellm-core/patterns/`.

## Discovery Loop

1. **Focus** — User specified area? Use it. Otherwise: analyze structure, present 3-5 areas via AskUserQuestion.
2. **Scan** — Read 5-10 representative files. Look for unusual, opinionated, tribal, consistently repeated patterns.
3. **Select** — Present findings via AskUserQuestion. User picks which to document.
4. **Per pattern** (one at a time, full loop):
   - Ask 1-2 "why" questions
   - Draft incorporating answer
   - Confirm via AskUserQuestion
   - Create/append in `cellm-core/patterns/core/` or `anti/`
5. **Index** — Update `cellm-core/patterns/index.yml` (alphabetized).
6. **Oracle** — If available, create observation (type: `pattern`).
7. **Continue** — Ask to discover another area.

## Writing Rules

Lead with the rule. Show code examples. Skip the obvious. One concept per pattern. Scannable > readable.

## NEVER

- **Batch questions** — one pattern, full loop, then next
- **Duplicate patterns** — check existing files first
- **Verbose patterns** — every word costs tokens
- **Skip the "why"** — tribal knowledge without rationale is arbitrary rules

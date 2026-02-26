---
name: orchestrate
description: Execute tasks systematically from tasks.md. Identifies the next executable group, delegates to the implementer agent, updates task status, and reports progress.
argument-hint: "[spec-folder-path]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion, Task
---

Read tasks.md, identify next executable group, delegate to implementer, track progress.

## Execution Loop

1. **Load** — Read tasks.md. Determine completed groups, next group, progress %.
2. **Show status** — Completed groups, next group, pending groups.
3. **For each task** in next group:
   - Mark `[~]` → read spec sections + patterns → delegate implementation → mark `[x]` or `[!]` → update tasks.md
4. **Group done** — Ask "Continue to next group?" via AskUserQuestion.
5. **All done** — Report totals. Suggest `/cellm:verify`.

## NEVER

- **Skip dependency order** — never execute before dependencies complete
- **Implement without spec context** — always provide spec + patterns to implementer
- **Silent failures** — every blocked task gets reason + user notification
- **Auto-continue** — always confirm before next group

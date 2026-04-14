---
description: "Create foundational product docs through guided Q&A and persist planning outcomes to Oracle knowledge. Use when: 'plan product', 'define mission', 'create roadmap'."
cellm_scope: universal
user-invocable: true
argument-hint: "[product name]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__knowledge_add, mcp__plugin_cellm_cellm-oracle__context_record_outcome, Read, Grep, Glob, Write, Edit, AskUserQuestion
---

# plan

Thin skill contract:

1. Intent
- Capture product intent, roadmap, and stack decisions through guided questions.
- Produce portable docs and persist plan-level knowledge atoms.

2. Policy
- Ask one question at a time.
- If docs already exist, ask whether to refresh, extend, or cancel.
- Persist key planning decisions with `knowledge_add` (`source: "plan"`).

3. Routing
- Conversation flow: mission -> roadmap -> stack.
- Docs output: write under `docs/product/` (`mission.md`, `roadmap.md`, `tech-stack.md`).
- Persistence: `knowledge_add` atoms + `context_record_outcome` run summary.

## NEVER

- Depend on repository-specific legacy paths.
- Skip confirmation when replacing existing docs.
- Produce exhaustive specs; keep this stage lightweight.

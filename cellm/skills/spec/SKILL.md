---
description: CELLM OS command center. List pending specs, create new checks, view status, and manage the atomic spec-driven system. Entry point for all spec operations.
argument-hint: "[action]: (empty) | create <title> | status | treat <check>"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_counters, AskUserQuestion
---

# Spec Thinking — Before Action

Every spec is an atomic puzzle in the database. Never a markdown file.

## Routing

| Argument | Action |
|----------|--------|
| (empty) | `spec_get_counters` + `spec_search(state: "pending"\|"in_progress")` → compact table |
| `create <title>` | Briefing → check → phases → tasks (all in DB) |
| `status` | All checks → counters per check → `[x] [~] [ ] [!]` summary |
| `treat <query>` | Delegate to `/cellm:spec-treat` |

## Create: The Briefing

Before any node exists, commit to a direction:

1. **Context** — Where are we? What exists? One sentence.
2. **Problem** — What is wrong or missing? One sentence.
3. **Principle** — The rule that guides every decision. One sentence.

These three sentences ARE the spec. Everything else is decomposition.

After the check: decompose into phases (work groups) and tasks (atomic actions). Each task has an imperative `action`, optional `fileRef`, optional `diffExpected`. Phases form the dependency DAG.

Project: always `git rev-parse --show-toplevel` → last segment.

## NEVER

- **Markdown files** — specs live in compass.db, never in cellm-core/specs/
- **Create without all 3 briefing fields** — Context, Problem, Principle are mandatory
- **Skip project detection** — always derive from git root
- **Vague tasks** — every task action is imperative and atomic
- **Write in any language other than English** — all titles, briefings, actions, and descriptions must be in English for optimal LLM processing and tokenization efficiency

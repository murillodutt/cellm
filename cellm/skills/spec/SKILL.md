---
description: CELLM OS command center. List pending specs, create new checks, view status, and manage the atomic spec-driven system. Entry point for all spec operations.
argument-hint: "[action]: (empty) | create <title> | status | treat <check>"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_counters, AskUserQuestion
---

Entry point for the atomic spec system. Project detected from `git rev-parse --show-toplevel`.

## Routing

| Argument | Action |
|----------|--------|
| (empty) | `spec_get_counters` + `spec_search(state: "pending"\|"in_progress")` → compact table |
| `create <title>` | Gather briefing (Context, Problem, Principle) via AskUserQuestion → `spec_create_node` → offer to add phases/tasks |
| `status` | Fetch all checks → counters per check → summary with `[x] [~] [ ] [!]` markers |
| `treat <query>` | Delegate to `/cellm:spec-treat` |

## Create Briefing Fields

1. Context — Where are we, what exists
2. Problem — What is wrong or incomplete
3. Principle — The rule that guides decisions

After check creation, ask to add phases. For each phase: title → tasks (comma-separated) → `spec_create_node`.

## NEVER

- **Create without all 3 briefing fields** — Context, Problem, Principle are mandatory
- **Skip project detection** — always derive from git root or cwd

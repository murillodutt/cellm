---
name: spec
description: CELLM OS command center. List pending specs, create new checks, view status, and manage the atomic spec-driven system. Entry point for all spec operations.
argument-hint: "[action]: (empty) | create <title> | status | treat <check>"
allowed-tools: mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_add_verification, mcp__cellm-oracle__spec_get_counters, AskUserQuestion
---

# CELLM OS — Spec Command Center

Entry point for the atomic spec-driven operating system.

## Routing

Parse the argument to determine action:

| Argument | Action |
|----------|--------|
| (empty) | Show pending checks with counters |
| `create <title>` | Interactive check creation |
| `status` | Overview: total checks, tasks, progress |
| `treat <query>` | Delegate to `/cellm:spec-treat` |

## Action: (empty) — Show Pending

1. Call `spec_get_counters` for the current project root path
2. Call `spec_search` with `state: "pending"` or `state: "in_progress"`
3. Display results as a compact table:

```
CELLM OS — Spec Status

| Check | Progress | State | Priority |
|-------|----------|-------|----------|
| Update @nuxt/ui 4.4.0 -> 4.5.0 | 0/3 | pending | medium |
| Migrate Stack Tracker | 23/47 | active | high |

Total: 10 tasks pending, 3 in progress, 0 blocked
```

4. If treats are available, suggest: "Use `/spec treat <check>` to work on a check."

## Action: create — Interactive Check Creation

Use AskUserQuestion to gather the 3 briefing fields:

1. Ask: "What is the context? (Where are we, what exists)"
2. Ask: "What is the problem? (What is wrong or incomplete)"
3. Ask: "What is the guiding principle? (The rule that guides decisions)"

Then create the check:

```
spec_create_node({
  project: <detected from cwd>,
  nodeType: "check",
  title: <from argument>,
  body: {
    context: <answer 1>,
    problem: <answer 2>,
    principle: <answer 3>
  },
  sourceRef: "human"
})
```

After creation, ask: "Want to add phases and tasks now?"

If yes, for each phase:
1. Ask phase title
2. Ask for tasks (one per line, or comma-separated)
3. Create phase + tasks via `spec_create_node`

## Action: status — Overview

1. Fetch all checks for the project
2. For each check, get counters
3. Display summary:

```
CELLM OS — Project Status

Checks: 4 | Tasks: 47 | Done: 23 | Failed: 0 | Blocked: 2

By Check:
  [x] DSE Copilot Panel          36/36  100%
  [~] Auth Migration              23/47   49%
  [ ] Stack Tracker Refactor       0/12    0%
  [!] API Rate Limiting            3/8    37%  (2 blocked)
```

## Action: treat — Delegate

Extract the check query from the argument (everything after "treat").
Invoke `/cellm:spec-treat` with the query.

## Project Detection

Detect project from cwd:

```bash
PROJECT=$(basename "$(git rev-parse --show-toplevel 2>/dev/null || pwd)")
```

Use this as the `project` parameter for all MCP calls.

---
description: "Orchestrate Stitch bridge with SCE contracts: analyze, compose, invoke, consume, and sync. Use when: 'stitch bridge', 'analyze stitch', 'sync stitch'."
cellm_scope: universal
user-invocable: true
argument-hint: "[analyze|compose-prompt|invoke|consume|sync]"
allowed-tools: Read, Glob, Grep, AskUserQuestion, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify, mcp__stitch__list_projects, mcp__stitch__get_project, mcp__stitch__list_screens, mcp__stitch__get_screen, mcp__stitch__generate_screen_from_text, mcp__stitch__edit_screens, mcp__stitch__generate_variants, mcp__stitch__list_design_systems, mcp__stitch__create_design_system, mcp__stitch__update_design_system, mcp__stitch__apply_design_system
---

# stitch-bridge

Thin skill contract:

1. Intent
- Route Stitch design operations through a predictable and auditable flow.

2. Policy
- Start each subcommand with `context_preflight`.
- Require explicit user confirmation for cost-incurring actions.
- Certify and record operation outcomes with source degradation notes when needed.

3. Routing
- Stitch artifact analysis and command execution: local/stitch tools.
- Context policy, budget, and learning loop: SCE `context_*`.

## Subcommands

- `analyze`: detect gaps in `.stitch/` artifacts.
- `compose-prompt`: produce context-grounded prompt.
- `invoke`: run Stitch generation/editing (explicit confirmation required).
- `consume`: ingest generated assets to repository artifacts.
- `sync`: trigger downstream conversion pipeline.

### Tool Mapping

| Subcommand | Native MCP Tools Used |
|------------|----------------------|
| `analyze` | `mcp__stitch__get_project` + `mcp__stitch__list_screens` + `mcp__stitch__get_screen` + local `.stitch/` read |
| `compose-prompt` | local logic only (no MCP) |
| `invoke` | `mcp__stitch__generate_screen_from_text`, `mcp__stitch__edit_screens`, or `mcp__stitch__generate_variants` (user confirmation required) |
| `consume` | `mcp__stitch__get_screen` (for `htmlCode.downloadUrl` + `screenshot.downloadUrl`) |
| `sync` | local triggers only (DSE/GDU pipeline) |

## NEVER

- Auto-trigger costed Stitch operations.
- Skip certification and write-back after invoke/consume/sync.

---
name: inject
description: Inject relevant patterns into the current context. Analyzes work context to suggest matching patterns, or directly injects specified pattern files.
argument-hint: "[pattern-path...]"
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

Inject patterns from `cellm-core/patterns/` into the active context. Without arguments, analyze the conversation and **suggest** relevant patterns. With arguments, **directly inject** the specified files.

## Auto-Suggest Mode (no arguments)

1. Read `cellm-core/patterns/index.yml` for available patterns
2. Analyze conversation: what type of work, technologies, goal
3. If Oracle MCP available, also search semantically
4. Present 2-5 focused suggestions via AskUserQuestion

## Explicit Mode (with arguments)

Arguments: folder name (`core`), folder/file (`core/typescript-core`), or multiple paths. Validate existence — if not found, suggest available patterns.

## Scenario Detection

Detect the current scenario to format output appropriately:

| Scenario | Detection | Output format |
|----------|-----------|---------------|
| **Conversation** | Regular chat, implementing code | Full pattern content inline |
| **Creating a Skill** | Building a `.claude/skills/` file | Ask: References (file paths) vs Copy (full content) |
| **Shaping/Planning** | Plan mode, running `/cellm:shape` | Ask: References vs Copy |

If scenario unclear, ask via AskUserQuestion.

In conversation scenario, also surface related skills for awareness (don't invoke them).

## Anti-patterns Note

Anti-patterns in `cellm-core/patterns/anti/` are **always loaded automatically**. Use `/cellm:inject anti` only to review them explicitly.

## NEVER

- **Overwhelm with suggestions** — max 5 patterns per injection
- **Auto-invoke skills** — surface related skills, don't execute them
- **Inject without scenario detection** — format depends on context
- **Skip index** — always read `index.yml` first in auto-suggest mode

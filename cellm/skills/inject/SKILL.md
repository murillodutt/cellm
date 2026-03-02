---
description: Inject relevant patterns into the current context. Analyzes work context to suggest matching patterns, or directly injects specified pattern files.
user-invocable: true
argument-hint: "[pattern-path...]"
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

Without arguments → analyze conversation, suggest patterns. With arguments → inject specified files.

## Modes

| Mode | Behavior |
|------|----------|
| Auto-suggest | Read `index.yml` → analyze conversation → Oracle semantic search (if available) → present 2-5 suggestions |
| Explicit | Validate path (folder or folder/file). Not found → suggest available. |

## Scenario Detection

| Scenario | Output |
|----------|--------|
| Conversation / implementing | Full pattern content inline + surface related skills |
| Creating a skill / shaping | Ask: References (paths) vs Copy (full content) |

Anti-patterns (`patterns/anti/`) are always loaded automatically. Use `/cellm:inject anti` only to review explicitly.

## NEVER

- **Overwhelm** — max 5 patterns per injection
- **Auto-invoke skills** — surface, don't execute
- **Skip scenario detection** — format depends on context
- **Skip index** — always read `index.yml` first in auto-suggest

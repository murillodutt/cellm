---
name: journal
description: Generate a comprehensive JOURNAL.md documenting project structure and architecture. Detects project type, extracts metadata from package.json and conveyor, and produces a single-file onboarding overview.
argument-hint: "[output-path]"
paths:
  - "**/.claude/docops.json"
  - "**/package.json"
  - "**/project-conveyor.md"
---

Generate a **JOURNAL.md** that documents the project structure and architecture from code evidence. Default output: project root. Custom: `/docops:journal docs/JOURNAL.md`.

## Workflow

1. **Detect project type** — nuxt.config.ts (Nuxt), next.config.js (Next), plugin.json (Claude Code plugin), etc.
2. **Extract metadata** — from package.json (name, version, deps, scripts), project-conveyor.md (purpose, components, invariants), directory structure
3. **Generate sections** — Overview, Tech Stack, Directory Structure, Key Components, APIs/Routes, Configuration, Scripts
4. **Write** — JOURNAL.md with YAML header (`Version`, `Generated` date)

## Sections

| Section | Source |
|---------|--------|
| Overview | project-conveyor.md Section 1, or package.json description |
| Tech Stack | dependencies + devDependencies |
| Directory Structure | tree view of main directories (max depth 2) |
| Key Components | project-conveyor.md Section 4, or auto-detected |
| APIs / Routes | server/api/, pages/ directories |
| Configuration | config files found |
| Scripts | package.json scripts |

## NEVER

- **Guess purpose** — if unsure, mark as "TODO: describe"
- **Invent content** — only document what exists in code evidence
- **Skip conveyor** — reference project-conveyor.md when available
- **Include node_modules** — always exclude node_modules, .git, .nuxt from directory scans

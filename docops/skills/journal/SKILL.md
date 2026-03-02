---
description: Generate a comprehensive JOURNAL.md documenting project structure and architecture. Detects project type, extracts metadata from package.json and conveyor, and produces a single-file onboarding overview.
user-invocable: true
argument-hint: "[output-path]"
paths:
  - "**/.claude/docops.json"
  - "**/package.json"
  - "**/project-conveyor.md"
---

## Process

1. Detect project type (Nuxt/Next/Claude plugin/etc.) from config files
2. Extract: package.json (name, version, deps, scripts), project-conveyor.md (purpose, components, invariants), directory structure
3. Generate sections: Overview, Tech Stack, Directory Structure, Key Components, APIs/Routes, Configuration, Scripts
4. Write JOURNAL.md with YAML header (Version, Generated date)

Output defaults to project root. Use `/docops:journal docs/JOURNAL.md` for custom path.

## NEVER

- **Guess purpose** — mark uncertain sections as "TODO: describe"
- **Invent content** — document only what exists in code
- **Skip conveyor** — reference it when available
- **Include node_modules** — exclude node_modules, .git, .nuxt

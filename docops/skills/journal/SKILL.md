---
description: "Docops: generate a comprehensive JOURNAL.md documenting project structure and architecture. Detects project type, extracts metadata, produces a single-file onboarding overview. Use when: 'generate journal', 'create project overview', 'onboarding doc'."
cellm_scope: universal
user-invocable: true
argument-hint: "[output-path]"
---

# Journal

Generate a comprehensive JOURNAL.md documenting project structure and architecture.

## Intent

- Produce a single-file onboarding overview by detecting project type and extracting metadata from existing artifacts.
- Provide a read-to-understand document that documents only what provably exists in the codebase.

## Policy

- `context_preflight` optional; skip if unavailable, proceed regardless.
- Never invent content — document only what exists in code; mark uncertain sections as "TODO: describe".
- Reference `project-conveyor.md` when available.
- Output defaults to project root; custom path via argument.

## Routing

1. Optionally run `context_preflight` with `flow='generic'`; proceed whether it succeeds or not.
2. Detect project type (Nuxt/Next/Claude plugin/etc.) from config files (`nuxt.config.ts`, `next.config.js`, etc.).
3. Extract metadata:
   - `package.json`: name, version, dependencies, scripts.
   - `project-conveyor.md`: purpose, components, invariants (if present).
   - Directory structure (exclude `node_modules`, `.git`, `.nuxt`).
4. Generate JOURNAL.md with the following sections: Overview, Tech Stack, Directory Structure, Key Components, APIs/Routes, Configuration, Scripts.
5. Add YAML header: Version, Generated date.
6. Write to resolved output path (defaults to project root `JOURNAL.md`).

## NEVER

- **Guess purpose** — mark uncertain sections as "TODO: describe"
- **Invent content** — document only what exists in code
- **Skip conveyor** — reference it when available
- **Include node_modules** — exclude node_modules, .git, .nuxt

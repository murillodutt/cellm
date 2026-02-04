---
description: Bootstrap a clean documentation structure with LLM-first templates
argument-hint: "[docRoot]"
---

# DocOps Init

## Goal
Bootstrap a clean documentation structure with LLM-first templates.

## Inputs
- `docRoot` argument or `.claude/docops.json` (preferred).
- Defaults:
  - `docRoot`: `docs/technical`
  - `conveyorFile`: `project-conveyor.md`
  - `language`: `en` (align with project `CLAUDE.md`)

## Steps
1) Resolve config
- Read `.claude/docops.json` if present.
- If missing, use defaults.

2) Create structure under `docRoot`
- `index.md`
- `glossary.md`
- `specs/`
- `reference/`
- `reference/code-evidence/`
- `reference/conveyor-gaps.md`
- `howto/`
- `runbooks/`
- `decisions/`
- `<conveyorFile>`

3) Apply templates
- Copy templates from `${CLAUDE_PLUGIN_ROOT}/templates/<language>/`.
- If a file already exists, DO NOT overwrite.

4) Fill placeholders
- If evidence is missing, write: `Not found by evidence`.
- Do NOT invent behavior.

## Output
- A minimal documentation base ready for `/docops:sync`.

---
description: "Docops: scaffold LLM-first documentation structure, templates, and docops.json for a project. Creates directory hierarchy without overwrite. Use when: 'init docs', 'setup documentation', 'create docops structure'. Not for Oracle setup (use cellm:init)."
user-invocable: true
argument-hint: "[docRoot]"
---

## Decision Framework

- If `.claude/docops.json` exists, use it as docRoot
- If not, read docRoot from argument (required)
- Copy only where files don't exist (no overwrites)
- Use templates from `${CLAUDE_PLUGIN_ROOT}/templates/<language>/`

## Structure

Create this hierarchy (skip existing directories):

```
{docRoot}/
  index.md              # Entry point
  glossary.md           # Terms and definitions
  project-conveyor.md   # Source of truth
  specs/                # .spec.md files
  reference/            # .ref.md files
    code-evidence/      # Auto-extracted code
    conveyor-gaps.md    # Drift tracking
  howto/                # .howto.md files
  runbooks/             # .runbook.md files
  decisions/            # ADR-YYYYMMDD-slug.md files
```

Naming: `<name>.spec.md`, `<name>.ref.md`, `<name>.howto.md`, `<name>.runbook.md`, `ADR-YYYYMMDD-slug.md`

## NEVER

- **Overwrite existing files** — templates go only where nothing exists
- **Invent behavior** — write "Not found by evidence" for missing data
- **Skip docops.json** — check existing config before building structure

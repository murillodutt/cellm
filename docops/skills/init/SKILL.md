---
description: "Docops: scaffold LLM-first documentation structure, templates, and docops.json for a project. Creates directory hierarchy without overwrite. Use when: 'init docs', 'setup documentation', 'create docops structure'. Not for Oracle setup (use cellm:init)."
user-invocable: true
argument-hint: "[docRoot]"
---

# Init

Scaffold LLM-first documentation structure, templates, and docops.json for a project.

## Intent

- Create the standard documentation directory hierarchy and seed it with templates.
- Establish `docops.json` config as the single source of docRoot for subsequent docops skills.

## Policy

- `context_preflight` recommended but failure does NOT block execution; if preflight fails, warn and proceed without context.
- Never overwrite existing files — templates go only where nothing exists.
- If `.claude/docops.json` exists, use its `docRoot`; otherwise require docRoot argument.
- Use templates from `${CLAUDE_PLUGIN_ROOT}/templates/<language>/`.
- Write back `docops.json` after scaffold is complete (mandatory write-back).

## Routing

1. Run `context_preflight` with `flow='generic'`; if it fails, log a warning and continue without context (do not block).
2. Check for existing `.claude/docops.json`; if present, read `docRoot` from it. Otherwise, use the argument (fail if neither exists).
3. Create the following hierarchy, skipping any directory or file that already exists:

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

   Naming conventions: `<name>.spec.md`, `<name>.ref.md`, `<name>.howto.md`, `<name>.runbook.md`, `ADR-YYYYMMDD-slug.md`.

4. Write `.claude/docops.json` with resolved `docRoot` (create or update).
5. Emit outcome via `context_record_outcome`.

## NEVER

- **Overwrite existing files** — templates go only where nothing exists
- **Invent behavior** — write "Not found by evidence" for missing data
- **Skip docops.json** — check existing config before building structure

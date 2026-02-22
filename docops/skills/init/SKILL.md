---
name: init
description: Initialize documentation structure and LLM-first templates for a project. Creates directory hierarchy, copies templates without overwrite, and sets up docops.json configuration.
argument-hint: "[docRoot]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
---

Create a predictable documentation base using DocOps templates from `${CLAUDE_PLUGIN_ROOT}/templates/<language>/`. Read `docRoot` from argument or `.claude/docops.json`.

## Directory Structure

```
{docRoot}/
  index.md              # Entry point
  glossary.md           # Terms and definitions
  project-conveyor.md   # Source of truth
  specs/                # Specifications (.spec.md)
  reference/            # Reference docs (.ref.md)
    code-evidence/      # Auto-extracted from code
    conveyor-gaps.md    # Drift tracking
  howto/                # How-to guides (.howto.md)
  runbooks/             # Operational runbooks (.runbook.md)
  decisions/            # ADRs (ADR-YYYYMMDD-slug.md)
```

## Naming Convention

| Type | Suffix | Example |
|------|--------|---------|
| Specification | `.spec.md` | `auth.spec.md` |
| Reference | `.ref.md` | `env-vars.ref.md` |
| How-to | `.howto.md` | `deploy.howto.md` |
| Runbook | `.runbook.md` | `incident.runbook.md` |
| Decision | `ADR-YYYYMMDD-<slug>.md` | `ADR-20260203-auth-method.md` |

## NEVER

- **Overwrite existing files** — copy templates only where files don't exist
- **Invent behavior** — if evidence is missing, write "Not found by evidence"
- **Skip docops.json** — always check for existing config before creating structure

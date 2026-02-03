---
name: docops-init
description: |
  Initialize documentation structure and LLM-first templates for a project.
  Use when: setting up new project docs, creating doc structure, initializing docops.
  Triggers: /docops-init, missing docs folder, new project setup.
argument-hint: "[docRoot]"
allowed-tools: Read, Edit, Write, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
---

# DocOps Init

## Purpose
Create a predictable documentation base using the DocOps templates.

## Inputs
- `docRoot` (optional)
- `.claude/docops.json` (preferred)

## Output
- Directory structure under `docRoot`
- Template files copied without overwrite

## Rules
- Use templates from `${CLAUDE_PLUGIN_ROOT}/templates/<language>/`.
- If evidence is missing, write: `Not found by evidence`.
- Do NOT invent behavior.

## Naming Convention

When creating files, use these suffixes:

| Type | Suffix | Example |
|------|--------|---------|
| Specification | `.spec.md` | `auth.spec.md` |
| Reference | `.ref.md` | `env-vars.ref.md` |
| How-to | `.howto.md` | `deploy.howto.md` |
| Runbook | `.runbook.md` | `incident.runbook.md` |
| Decision | `ADR-YYYYMMDD-<slug>.md` | `ADR-20260203-auth-method.md` |

## Directory Structure

Create under `{docRoot}`:

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

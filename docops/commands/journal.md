---
id: CMD-DOCOPS-JOURNAL
version: v1.0.0
status: OK
name: journal
budget: ~200 tokens
---

# DocOps Journal

Generate a comprehensive JOURNAL.md documenting the project structure and architecture.

## Usage

```
/docops:journal              # Generate JOURNAL.md in project root
/docops:journal docs/        # Generate in docs/ directory
/docops:journal --force      # Regenerate even if exists
```

## What it generates

- Project metadata (name, version, description)
- Tech stack from dependencies
- Directory structure overview
- Key components and their purposes
- API routes and endpoints
- Configuration files
- Available scripts

## When to use

- Setting up project documentation
- Onboarding new team members
- Creating architecture overview
- After significant structural changes

## Related

- `/docops:sync` - Keep docs aligned with code
- `/docops:init` - Bootstrap documentation structure

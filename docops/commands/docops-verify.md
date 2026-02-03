---
name: docops-verify
description: Validate documentation structure, links, and normative vocabulary.
usage: /docops-verify [docRoot]
arguments:
  - name: docRoot
    description: Optional documentation root (overrides .claude/docops.json)
    required: false
agent: none
budget: ~150
---

# DocOps Verify

## Goal
Validate structure, required sections, and drift control artifacts.

## Checks
1) Structure exists
- `index.md`, `glossary.md`, `reference/`, `specs/`, `howto/`, `runbooks/`, `decisions/`.

2) Source of truth
- `<conveyorFile>` exists and is referenced by specs/refs.

3) Evidence links
- SPECs/REFs include links to code evidence where applicable.

4) Normative vocabulary
- Use only: **DEVE**, **NÃO DEVE**, **DEVERIA**, **PODE**.
- Avoid vague adjectives.

5) Gaps
- `reference/conveyor-gaps.md` exists and is updated.

## Output
- A short report with pass/fail per check and next actions.

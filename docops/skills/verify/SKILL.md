---
name: verify
description: Validate documentation structure, required sections, evidence links, normative vocabulary, and drift control artifacts. Reports missing files, broken references, and vocabulary violations.
argument-hint: "[docRoot]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
---

Validate documentation **structure**, **required sections**, and **drift control artifacts**.

## Checks

1. Required folders and files exist (specs/, reference/, howto/, index.md, glossary.md)
2. Source of truth (project-conveyor.md) referenced by specs/refs
3. Evidence links present in derived documents
4. Normative vocabulary usage (DEVE, NAO DEVE, DEVERIA, PODE)
5. Gaps file (conveyor-gaps.md) exists and is current

## NEVER

- **Pass with missing source of truth** — project-conveyor.md must exist
- **Skip evidence link validation** — SPECs/REFs must link to evidence
- **Ignore normative vocabulary violations** — flag non-standard language

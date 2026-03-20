---
description: "Docops: validate documentation structure, required sections, evidence links, normative vocabulary, and drift control artifacts. Reports missing files, broken references, vocabulary violations. Use when: 'verify docs', 'check doc structure', 'validate documentation'."
user-invocable: true
argument-hint: "[docRoot]"
---

## Validation Checks

Run these in order:

1. **Structure exists**: specs/, reference/, howto/, index.md, glossary.md
2. **Source of truth**: project-conveyor.md referenced by SPECs/REFs
3. **Evidence links**: all derived docs link to evidence files
4. **Vocabulary**: correct normative language (DEVE, NAO DEVE, DEVERIA, PODE)
5. **Gaps file**: conveyor-gaps.md present and dated

Report what's missing. Stop on source-of-truth failure.

## NEVER

- **Pass without project-conveyor.md** — it's mandatory
- **Skip evidence link validation** — SPECs/REFs must link evidence
- **Ignore vocabulary violations** — flag non-standard language

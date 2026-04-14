---
description: "Docops: validate documentation structure, required sections, evidence links, normative vocabulary, and drift control artifacts. Reports missing files, broken references, vocabulary violations. Use when: 'verify docs', 'check doc structure', 'validate documentation'."
user-invocable: true
argument-hint: "[docRoot]"
---

# Verify

Validate documentation structure, evidence links, normative vocabulary, and drift control artifacts.

## Intent

- Run a comprehensive structural and content validation pass over the documentation tree.
- Report all issues found; do not modify any files.

## Policy

- `context_preflight` optional; skip if unavailable, proceed regardless.
- Read-only operation — this skill never writes or modifies documentation files.
- Stop further checks and report immediately on source-of-truth failure (`project-conveyor.md` missing).

## Routing

1. Optionally run `context_preflight` with `flow='generic'`; proceed whether it succeeds or not.
2. Run validation checks in order:
   1. **Structure exists**: `specs/`, `reference/`, `howto/`, `index.md`, `glossary.md` present.
   2. **Source of truth**: `project-conveyor.md` present and referenced by SPECs/REFs — stop here if missing.
   3. **Evidence links**: all derived docs (SPEC/REF) link to evidence files in `reference/code-evidence/`.
   4. **Vocabulary**: correct normative language used (MUST, MUST NOT, SHOULD, MAY); flag non-standard language.
   5. **Gaps file**: `conveyor-gaps.md` present and contains dated entries.
3. Compile and report all findings; distinguish errors (blocking) from warnings (advisory).

## NEVER

- **Pass without project-conveyor.md** — it's mandatory
- **Skip evidence link validation** — SPECs/REFs must link evidence
- **Ignore vocabulary violations** — flag non-standard language
- **Modify any file** — read-only; report only

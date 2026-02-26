---
description: Detect redundant and duplicate content across documentation files. Compares heading structures (Jaccard similarity), extracts topic keywords, and reports consolidation opportunities ranked by severity.
argument-hint: "[docRoot] [--threshold N]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/specs/**"
  - "**/reference/**"
---

## Detection

- **Structural similarity**: Jaccard index on normalized headings (>70% = flag)
- **Topic keywords**: extract from titles, metadata, first paragraphs
- **Content hashing**: find exact duplicates across files

Severity: >90% critical, 70-90% high, 50-70% medium, <50% none.

## Consolidation Strategies

- Near-duplicate SPECs: merge
- SPEC overlaps REF: keep both, clarify (what vs how)
- HOWTO overlaps RUNBOOK: keep both (learn vs operate)
- Duplicated paragraphs: replace with link

## NEVER

- **Auto-merge** — report only
- **Discard content** — preserve all, consolidate structure
- **Mandate consolidation** — suggest only
- **Ignore document purpose** — SPEC/REF/HOWTO have different audiences

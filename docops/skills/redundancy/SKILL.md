---
name: redundancy
description: Detect redundant and duplicate content across documentation files. Compares heading structures (Jaccard similarity), extracts topic keywords, and reports consolidation opportunities ranked by severity.
argument-hint: "[docRoot] [--threshold N]"
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/specs/**"
  - "**/reference/**"
---

Identify **redundant, duplicate, or overlapping** documentation by comparing heading structures, topic keywords, and content hashes. Report consolidation opportunities without auto-merging.

## Detection

- **Structural similarity** — Jaccard index on normalized headings: `|A intersect B| / |A union B|`
- **Topic detection** — extract keywords from titles, metadata, first paragraphs; group by topic
- **Content hashing** — hash normalized paragraphs to find exact duplicates across files

## Severity

| Level | Similarity | Action |
|-------|------------|--------|
| Critical | >90% | Must consolidate |
| High | 70-90% | Should consolidate |
| Medium | 50-70% | Review recommended |
| Low | <50% | No action |

## Consolidation Strategies

| Finding | Strategy |
|---------|----------|
| Near-duplicate SPECs | Merge into one |
| SPEC overlaps REF | Keep both, clear boundaries (what vs how) |
| HOWTO overlaps RUNBOOK | Keep both, different purpose (learn vs operate) |
| Duplicated paragraph | Replace with link to source |

## NEVER

- **Auto-merge** — report only, never auto-merge documents
- **Discard information** — preserve all content, consolidate structure
- **Mandate consolidation** — suggest, don't mandate
- **Ignore document purpose** — SPEC vs REF vs HOWTO serve different audiences

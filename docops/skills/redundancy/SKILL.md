---
description: "Docops: detect redundant and duplicate content across documentation files. Compares heading structures (Jaccard similarity), extracts topic keywords, reports consolidation opportunities. Use when: 'find duplicates', 'redundancy check', 'consolidate docs'."
user-invocable: true
argument-hint: "[docRoot] [--threshold N]"
---

# Redundancy

Detect redundant and duplicate content across documentation files and report consolidation opportunities.

## Intent

- Identify structural overlap and exact duplicates across the documentation tree using Jaccard similarity on headings.
- Report consolidation strategies without making any changes.

## Policy

- `context_preflight` optional; skip if unavailable, proceed regardless.
- Read-only operation — this skill never modifies, merges, or deletes documentation files.
- Report findings at severity tiers; never mandate consolidation — suggest only.
- Respect document purpose when evaluating overlap: SPEC/REF/HOWTO/RUNBOOK serve different audiences.

## Routing

1. Optionally run `context_preflight` with `flow='generic'`; proceed whether it succeeds or not.
2. Run detection passes:
   - **Structural similarity**: compute Jaccard index on normalized headings across all files; flag pairs above threshold (default 70%).
   - **Topic keywords**: extract from titles, frontmatter metadata, and first paragraphs; cluster by topic.
   - **Content hashing**: find exact duplicate paragraphs or sections across files.
3. Classify severity by structural similarity score:
   - >90%: critical
   - 70-90%: high
   - 50-70%: medium
   - <50%: none
4. For each flagged pair, suggest an appropriate consolidation strategy:
   - Near-duplicate SPECs: merge.
   - SPEC overlaps REF: keep both, clarify scope (what vs how).
   - HOWTO overlaps RUNBOOK: keep both (learn vs operate).
   - Duplicated paragraphs: replace with link.
5. Compile and present the full report with severity, pairs, and suggestions.

## NEVER

- **Auto-merge** — report only
- **Discard content** — preserve all, consolidate structure
- **Mandate consolidation** — suggest only
- **Ignore document purpose** — SPEC/REF/HOWTO have different audiences

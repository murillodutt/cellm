---
name: docops-redundancy
description: Detect redundant and duplicate content across documentation files.
usage: /docops-redundancy [docRoot] [--threshold N]
arguments:
  - name: docRoot
    description: Optional documentation root (overrides .claude/docops.json)
    required: false
  - name: --threshold
    description: Similarity threshold 0.5-1.0 (default 0.7)
    required: false
agent: docops-writer
budget: ~300
---

# DocOps Redundancy

## Goal
Identify redundant, duplicate, or overlapping content across documentation to enable consolidation.

## Rules
- Detection only; never auto-merge content.
- Report findings for human decision.
- Suggest consolidation strategies.
- Preserve all information during merge recommendations.

## Detection Methods

### 1. Structural Similarity
Compare heading structures between documents:
- Extract all `##` and `###` headings.
- Calculate Jaccard similarity coefficient.
- Flag pairs with similarity > threshold (default 0.7).

### 2. Topic Overlap
Detect documents covering the same subject:
- Parse document titles and first paragraphs.
- Identify common keywords and phrases.
- Flag potential topic duplicates.

### 3. Content Duplication
Find repeated text blocks:
- Extract paragraphs and list items.
- Identify verbatim or near-verbatim matches.
- Report duplicated content locations.

### 4. Reference Redundancy
Detect multiple docs referencing same source:
- Parse `Code evidence:` and `Source of truth:` links.
- Identify multiple docs pointing to same evidence.
- Suggest single authoritative source.

## Steps

1) Resolve config
- Read `.claude/docops.json` for `gcConfig.redundancyThreshold`.
- Default: 0.7 (70% similarity).

2) Index all documents
- Scan `specs/`, `reference/`, `howto/`, `runbooks/`.
- Extract: title, headings, keywords, evidence links.

3) Calculate structural similarity
- For each document pair, compute heading similarity.
- Formula: `similarity = |A ∩ B| / |A ∪ B|`

4) Detect topic overlap
- Group documents by primary topic/keyword.
- Flag groups with >1 document.

5) Find content duplication
- Hash paragraphs and list items.
- Report matches across different files.

6) Generate report
```
Redundancy Analysis Report
==========================

Structural Similarity (>70%):
-----------------------------
[!] auth.spec.md <-> authentication.ref.md (82%)
    Common headings: Overview, Configuration, Errors
    Suggestion: Merge into single auth.spec.md

[!] deploy.howto.md <-> deployment.runbook.md (75%)
    Common headings: Prerequisites, Steps, Troubleshooting
    Suggestion: Keep howto for guide, runbook for operations

Topic Overlap:
--------------
[i] Topic "environment variables":
    - env.ref.md (primary)
    - config.ref.md (mentions env vars)
    - deploy.howto.md (env section)
    Suggestion: Single env.ref.md, others link to it

Content Duplication:
--------------------
[-] Duplicated paragraph found:
    Source: env.ref.md:15-20
    Duplicate: config.ref.md:45-50
    Action: Remove duplicate, add link

Reference Redundancy:
---------------------
[i] Evidence file: code-evidence/env.md
    Referenced by: env.ref.md, config.ref.md, deploy.howto.md
    Suggestion: env.ref.md as authoritative, others link

Summary:
--------
- High similarity pairs: N
- Topic overlaps: N
- Content duplications: N
- Reference redundancies: N
```

7) Suggest consolidation
- For each finding, provide actionable recommendation.
- Options: Merge, Link, Keep separate (with justification).

## Output
- Detailed redundancy report.
- Consolidation recommendations.
- No automatic changes (human review required).

## Similarity Calculation

```
Jaccard Similarity for headings:
- Document A headings: {H1, H2, H3, H4}
- Document B headings: {H2, H3, H5, H6}
- Intersection: {H2, H3} = 2
- Union: {H1, H2, H3, H4, H5, H6} = 6
- Similarity: 2/6 = 0.33 (33%)

Threshold check:
- 0.33 < 0.70 = No flag
- 0.75 > 0.70 = Flag for review
```

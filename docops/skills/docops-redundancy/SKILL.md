---
name: docops-redundancy
description: |
  Detect redundant and duplicate content across documentation files.
  Use when: finding duplicates, consolidating docs, reducing redundancy.
  Triggers: /docops-redundancy, duplicate content, similar docs, consolidate.
argument-hint: "[docRoot] [--threshold N]"
allowed-tools: Read, Glob, Grep
model: inherit
paths:
  - "**/.claude/docops.json"
  - "**/docs/**"
  - "**/technical/**"
  - "**/specs/**"
  - "**/reference/**"
---

# DocOps Redundancy Detection

## Purpose
Identify redundant, duplicate, or overlapping documentation content for consolidation.

## Detection Algorithms

### Structural Similarity (Jaccard)

```
similarity(A, B) = |headings(A) ∩ headings(B)| / |headings(A) ∪ headings(B)|
```

Extract headings:
```markdown
## Heading Level 2    -> "Heading Level 2"
### Heading Level 3   -> "Heading Level 3"
```

Normalize:
- Lowercase
- Remove numbers and special chars
- Stem common words

### Topic Detection

Keywords extraction:
```markdown
# Document Title          -> primary topic
## Metadata > Related:    -> related topics
First paragraph           -> context keywords
```

Grouping:
```
Topic "authentication":
  - auth.spec.md (primary: title match)
  - login.howto.md (secondary: content match)
  - security.ref.md (tertiary: section match)
```

### Content Hashing

```python
# Pseudocode for content deduplication
def hash_content(doc):
    paragraphs = extract_paragraphs(doc)
    return {hash(normalize(p)): p for p in paragraphs}

def find_duplicates(docs):
    all_hashes = {}
    duplicates = []
    for doc in docs:
        for h, content in hash_content(doc).items():
            if h in all_hashes:
                duplicates.append((all_hashes[h], doc, content))
            else:
                all_hashes[h] = doc
    return duplicates
```

## Report Format

### Severity Levels

| Level | Similarity | Icon | Action |
|-------|------------|------|--------|
| Critical | >90% | `[-]` | Must consolidate |
| High | 70-90% | `[!]` | Should consolidate |
| Medium | 50-70% | `[i]` | Review recommended |
| Low | <50% | - | No action |

### Consolidation Strategies

| Finding | Strategy | Example |
|---------|----------|---------|
| Near-duplicate SPECs | Merge into one | auth.spec.md + authentication.spec.md |
| SPEC overlaps REF | Keep both, clear boundaries | auth.spec.md (what) + auth.ref.md (how) |
| HOWTO overlaps RUNBOOK | Keep both, different purpose | deploy.howto.md (learn) + deploy.runbook.md (operate) |
| Duplicated paragraph | Link to source | "See [env.ref.md](../reference/env.ref.md)" |

## Rules
- Never auto-merge; report only
- Preserve all information
- Suggest, don't mandate
- Consider document purpose (SPEC vs REF vs HOWTO)
- Link is often better than duplicate

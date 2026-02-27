---
description: Passive work classifier — routes each action to trivial, query, or spec path before execution. Complements the spec command, does not replace it.
user-invocable: false
---

# Work Routing — Before Action

Before executing, classify:

| Signal | Classification | Action |
|--------|---------------|--------|
| < 5 lines, single file | TRIVIAL | Execute directly |
| Question, lookup, explanation | QUERY | Answer directly |
| Bug fix, feature, refactor, multi-file | SPEC | Search or create spec |

## SPEC Path

1. `spec_search(project, query)` — match found? Resume it. No match? Create check.
2. During work: `spec_transition` per task. Discoveries become `gap` nodes. Choices become `decision` nodes.
3. All tasks done: `spec_transition(check, "completed")`.

## NEVER

- **Skip classification** — every non-trivial action goes through the funnel
- **Create duplicate specs** — always `spec_search` first
- **Force specs on trivial work** — the funnel is a filter, not a tax
- **Create specs as markdown** — specs live in compass.db only
- **Non-English spec content** — when creating checks, all content must be in English

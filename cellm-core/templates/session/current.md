---
id: TPL-SESSION
version: v1.1.0
status: OK
template: true
budget: ~50 tokens
---

# Session Template

Template for managing session state in CELLM projects.

## Usage

Copy this template to your project's session directory and customize as needed.

## Template Content

```markdown
# Current Session

## Date

[YYYY-MM-DD]

## Focus

[Main topic or task being worked on]

## Decisions (@persist)

<!-- Decisions marked with @persist are kept across sessions -->

- Decision 1: [Description]
- Decision 2: [Description]

## Metrics

- pattern_hits: []
- anti_pattern_prevents: []
- token_usage: 0

## Context (@temporary)

<!-- Ephemeral context, discarded at session end -->

### Files Modified

- [file1.md]
- [file2.md]

### Pending Tasks

- [ ] Task 1
- [ ] Task 2

## Notes

[Additional notes for context]
```

## Session Lifecycle

1. **Start**: Copy template or resume from previous session
2. **During**: Update metrics, decisions, context as you work
3. **End**: Mark @temporary content for cleanup, persist decisions

## Integration with Journal

This template works with the journal system in `.claude/journal/`:

- `index.json`: Quick context injection (~200 tokens)
- `JOURNAL.md`: Detailed history
- `current-session.md`: Active session state

## Related

- [CLAUDE.md Template](../CLAUDE.md)
- [Tasks Template](../tasks.md)

---
id: ANTI-NAV
version: v0.10.0
status: OK
severity: critical
alwaysApply: true
budget: ~100 tokens
---

# Prohibited Navigation Patterns

## Navigation Bans

| Ban | Fix |
| --- | --- |
| Orphaned page | Add entry in sidebar menu |
| URL-only access | Add to global search |
| Misplaced route | Move to correct semantic group |

## Route Organization

Every page must be:

- Accessible via sidebar menu OR global search
- In correct semantic group
- Protected by middleware

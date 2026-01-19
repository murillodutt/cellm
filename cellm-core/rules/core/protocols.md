---
id: PROTO-001
version: v0.10.0
status: OK
alwaysApply: true
budget: ~200 tokens
---

# Protocols

## Communication

- Responses in PT-BR
- Professional and technical tone
- Straight to the point

## Before Creating Code

1. Check if a similar one exists (reuse-check)
2. Consult tech-stack.md
3. Check anti-patterns

## When Creating Code

1. Strict TypeScript
2. Explicit types (never any)
3. Document non-obvious decisions

## When Modifying Code

1. Maintain existing style
2. Do not break functionality
3. Update tests if necessary

## Commits

```text
{type}({scope}): {description}

feat(auth): add login endpoint
fix(ui): correct button alignment
refactor(api): extract validation logic
```

## Documentation

- Self-documented code > comments
- Comments explain "why", not "what"
- README updated with significant changes

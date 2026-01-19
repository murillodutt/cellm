---
id: CONV-001
version: v0.10.0
status: OK
alwaysApply: true
budget: ~150 tokens
---

# Conventions

## Naming

| Type | Pattern | Example |
|------|--------|---------|
| Variables | camelCase | userName |
| Functions | camelCase | fetchUser() |
| Components | PascalCase | UserCard.vue |
| Composables | use* | useAuth() |
| Types | PascalCase | User |
| Constants | SCREAMING_SNAKE | MAX_RETRIES |
| Files | kebab-case | user-service.ts |

## Imports

1. External (vue, nuxt)
2. Absolute (~/components)
3. Relative (./types)
4. Types

## Language

- Code: English
- Commits: English (conventional)

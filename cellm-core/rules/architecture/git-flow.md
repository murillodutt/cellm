---
id: GIT-001
version: v1.1.0
status: OK
paths: ["**"]
budget: ~300 tokens
---

# Git Flow

## Branches

| Type | Pattern | Example |
 | ------ |--------- | --------- |
| main | main | Production |
| feature | feat/{scope}/{desc} | feat/auth/login |
| fix | fix/{scope}/{desc} | fix/ui/button-align |
| release | release/v{version} | release/v1.2.0 |

## Commits

Conventional Commits mandatory:

```text
{type}({scope}): {description}

Types:
- feat: New functionality
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Refactoring
- test: Tests
- chore: Maintenance
```

Examples:

```text
feat(auth): add password reset flow
fix(api): handle null response from stripe
refactor(components): extract UserCard logic
```

## Pull Requests

Title: same format as commit

Description:

```markdown
## Description
What was done and why.

## Change Type
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change

## Checklist
- [ ] Code follows conventions
- [ ] Self-review performed
- [ ] Tests added
```

## Merge

- Squash merge for features
- Linear history (rebase)
- Delete branch after merge

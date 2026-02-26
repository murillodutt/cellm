---
description: Quality gate validation. Reviews code against spec compliance, mandatory rules, security checklist, and pattern adherence. Produces a verification report with findings by severity.
argument-hint: "[spec-folder-path or file path]"
allowed-tools: Read, Grep, Glob, Bash(npx *), Bash(bun *), AskUserQuestion
---

Spec folder → verify all files from spec. File path → verify one file. No argument → verify `git diff HEAD~1`.

## Verification Pipeline

1. **Automated** — `npx tsc --noEmit` or `npx nuxt typecheck`. Lint if configured.
2. **Quality** — No `any`, no `console.log`, limits (1000/file, 50/function), explicit return types.
3. **Spec compliance** — Acceptance criteria, data models, API contracts, component props/emits.
4. **Standards** — Composition API, semantic tokens, dark mode, mobile-first, error handling.
5. **Patterns** — Anti-patterns avoided (`patterns/anti/`), project patterns followed (`patterns/core/`), no duplicated shared logic.
6. **Security** — Zod on external input, no raw SQL, no unsanitized v-html, no client-exposed secrets, auth on protected endpoints.

## Report Format

```
# Verification Report
## Summary — Files: X | Issues: Y | Status: PASS/CONDITIONAL/FAIL
## [CRITICAL] — file:line, rule, description, recommendation
## [WARNING] — file:line, description, recommendation
## [INFO] — file:line, suggestion
```

## Verdict

| Status | Condition |
|--------|-----------|
| PASS | Zero CRITICAL + zero WARNING |
| CONDITIONAL | Zero CRITICAL + has WARNINGs |
| FAIL | Has CRITICAL |

## NEVER

- **Pass with CRITICAL** — CRITICAL always means FAIL
- **Skip typecheck** — automated first, manual second
- **Invent findings** — every finding has file:line reference
- **Skip security** — always part of verification

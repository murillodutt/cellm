---
description: Quality gate validation. Reviews code against spec compliance, mandatory rules, security checklist, and pattern adherence. Produces a verification report with findings by severity.
argument-hint: "[spec-folder-path or file path]"
allowed-tools: Read, Grep, Glob, Bash(npx *), Bash(bun *), AskUserQuestion
---

Spec folder → verify all files from spec. File path → verify one file. No argument → verify `git diff HEAD~1`.

## Verification Pipeline

1. **Automated (baseline diffing)** — Run typecheck via `quality_gate({ scope: 'typecheck' })` (Oracle offline → fallback to `npx nuxt typecheck` or `npx tsc --noEmit`):
   - Typecheck on HEAD → capture error list A.
   - `git stash && quality_gate({ scope: 'typecheck' })` on HEAD~1 → capture error list B. `git stash pop`.
   - Diff: errors in A but NOT in B = **NEW errors** → findings (CRITICAL).
   - Errors in both A and B = **pre-existing** → INFO ("X pre-existing typecheck errors, not introduced by this change").
   - Edge case: first commit or no HEAD~1 → all errors are findings.
   - Lint if configured.
2. **Quality** — No `any`, no `console.log`, limits (1000/file, 50/function), explicit return types.
3. **Spec compliance (fileRef-scoped)** — Acceptance criteria, data models, API contracts, component props/emits. When the spec node has `fileRefs`, scope all greps to those specific files — never glob globally when fileRefs are available. Each fileRef gets its own verification pass.
4. **Usage context** — When verifying a component, also check parent pages that render it: `grep -rn "<ComponentName" pages/`. A feature can be architecturally split across parent + child — verify both before claiming "missing". If a feature is found in the parent page but not the component itself, it is NOT missing.
5. **Standards** — Composition API, semantic tokens, dark mode, mobile-first, error handling.
6. **Framework Event Gotchas** — Grep scoped files for incorrect event bindings. These compile and render but silently fail at runtime:

| Component | Wrong event | Correct event |
|-----------|-------------|---------------|
| USwitch | `@change` | `@update:model-value` |
| UCheckbox | `@change` | `@update:model-value` |
| USelect | `@change` | `@update:model-value` |
| UDropdownMenu | `@click` (on items) | `onSelect` |
| UModal | `@close` | `@update:open` |

   For each entry: grep the wrong event in scoped files. Match = CRITICAL finding ("silent behavioral bug — handler never fires").
7. **Patterns** — Anti-patterns avoided (`patterns/anti/`), project patterns followed (`patterns/core/`), no duplicated shared logic.
8. **Security** — Zod on external input, no raw SQL, no unsanitized v-html, no client-exposed secrets, auth on protected endpoints.

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
- **Global grep when fileRefs are available** — scope to specific files from the spec node

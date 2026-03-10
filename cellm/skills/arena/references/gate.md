# Gate Mode — Reference

Quality verdict on code changes. Produces PASS / CONDITIONAL / FAIL report.

## Input

`gate [path]` — spec folder (verify all fileRefs), file path (verify one file), or empty (verify `git diff HEAD~1`).

## Pipeline

1. **Typecheck baseline diff** — typecheck HEAD to get current errors. Before creating a worktree, check for orphans from prior interrupted sessions: `git worktree list` — if any entry points to a `/tmp/` or missing directory, remove it with `git worktree remove --force <path>`. Then create a temporary worktree (`GATE_DIR=$(mktemp -d)` then `git worktree add "$GATE_DIR" HEAD~1`), typecheck there with `timeout 300` (5 min), and diff errors. Clean up with `git worktree remove "$GATE_DIR"`. Cleanup is best-effort — if the session is interrupted, the worktree persists. Recovery: `git worktree list` to find orphans, `git worktree remove <path>` to clean. New errors = CRITICAL. Pre-existing = INFO. Never use `git stash` for this — a failed process would lose the developer's working state.
2. **Code quality** — no `any` casts, no `console.log` in committed code, file limits (1000 lines/file, 50 lines/function), explicit return types on exports.
3. **Security** — Zod on external input, no raw SQL interpolation, no unsanitized `v-html`, no client-exposed secrets.
4. **DSE compliance** (if Oracle online) — `dse_search` for decisions relevant to modified files. Verify `avoid` rules respected.
5. **Nuxt UI event gotchas** (if `.vue` files modified) — grep for silent event bugs:

| Component | Wrong | Correct |
|-----------|-------|---------|
| USwitch, UCheckbox, USelect | `@change` | `@update:model-value` |
| UDropdownMenu | `@click` (on items) | `onSelect` |
| UModal | `@close` | `@update:open` |

## Report Format

```
# Quality Gate Report
## Summary — Files: X | Issues: Y | Status: PASS/CONDITIONAL/FAIL
## [CRITICAL] — file:line, rule, description
## [WARNING] — file:line, description
## [INFO] — file:line, suggestion
```

## Verdict

| Status | Condition |
|--------|-----------|
| PASS | Zero CRITICAL + zero WARNING |
| CONDITIONAL | Zero CRITICAL + has WARNINGs |
| FAIL | Has CRITICAL |

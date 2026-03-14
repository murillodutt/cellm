---
description: Execute stack update specs — verify typecheck and tests after dependency updates, batch-complete passing specs, investigate failures. Use when stack tracker specs need closing, dependency updates need verification, or 'stack update' is mentioned.
user-invocable: true
argument-hint: "'all' to batch-process, package name, or check ID"
allowed-tools: mcp__plugin_cellm_cellm-oracle__spec_search, mcp__plugin_cellm_cellm-oracle__spec_get_tree, mcp__plugin_cellm_cellm-oracle__spec_get_node, mcp__plugin_cellm_cellm-oracle__spec_transition, mcp__plugin_cellm_cellm-oracle__spec_get_counters, mcp__plugin_cellm_cellm-oracle__quality_gate, Read, Grep, Glob, Bash(npx vue-tsc *), Bash(bun run test *)
---

# Stack Update — Dependency Update Verification

Verify dependency updates via quality gate and batch-complete specs proportionally to risk.

## Framework

1. **Detect** — `git rev-parse --show-toplevel` last segment = project name.
2. **Search** — Route by argument:

| Argument | Action |
|----------|--------|
| `all` | `spec_search(query: "dependency update", state: "pending", limit: 50)` filter by tag `stack-tracker` |
| `<package>` | `spec_search(query: <package>, state: "pending", limit: 5)` filter by tag `stack-tracker` |
| `<check-id>` | `spec_get_tree(path: <id>)` directly |

3. **Gate** — `quality_gate({ scope: 'all' })` — run ONCE for the entire project. Fallback: `npx vue-tsc --noEmit` + `bun run test` if Oracle offline.
4. **Route** — Based on gate result and `body.updateType` from each check:

| Gate | updateType | Action |
|------|-----------|--------|
| PASS | patch | Batch-complete ALL tasks via `spec_transition(event: "completed")` |
| PASS | minor | Complete all tasks (review + verify) |
| PASS | major | Complete verify + evaluate tasks. Leave "Review breaking changes" if not yet investigated. |
| FAIL | patch/minor | Report errors. Investigate typecheck output. Attempt fix if trivial. |
| FAIL | major | Report errors. Delegate: `"[!] Gate failed. Use /cellm:implement to fix."` |

5. **Batch** — When `all`:
   - Gate runs ONCE (typecheck + tests validate the whole project)
   - If PASS: iterate specs, complete tasks sequentially. Progress: `"[n/total] package from -> to (type)"`
   - If FAIL: stop batch, report which stage failed
   - Sort: patch first, then minor, then major

6. **Legacy** — If `body.updateType` is missing (specs created before type-aware generation): infer from title pattern `Update {pkg} {from} -> {to}` using version delta.

7. **Complete** — `spec_transition(event: "completed", project)` on each task. Auto-rollup propagates to phase and check.

## Task Decision Table

| Task title pattern | Gate PASS | Gate FAIL |
|--------------------|-----------|-----------|
| `Verify typecheck and tests pass` | auto-complete | report error |
| `Review breaking changes` | complete if updateType != major; leave for human if major | leave for human |
| `Review changelog` | auto-complete | auto-complete (independent of gate) |
| `Evaluate: {item}` | auto-complete (typecheck validates) | investigate |
| `Update project code` | auto-complete (no change needed) | delegate to implement |

## NEVER

- Complete specs without running quality_gate first
- Run quality_gate PER SPEC in batch mode — run ONCE
- Edit source code — if fixes needed, delegate to `/cellm:implement`
- Auto-complete "Review breaking changes" tasks for major updates without evidence
- Forget `project` param on spec_transition calls
- Leave specs in intermediate states — either complete or report why not

---
description: "Execute a real convergence loop — test the complete end-to-end pipeline with real data, identify failures, fix them, and repeat until total convergence. Concludes with full typecheck + root tests + Oracle tests. Use when: 'convergir', 'convergence loop', 'testar pipeline completo', 'e2e convergence', 'rodar tudo ate passar', 'loop de qualidade', 'validar tudo'. Also use proactively after large refactors, multi-file changes, or spec implementations that touch Oracle server code."
cellm_scope: internal
user-invocable: true
argument-hint: "[optional: specific phase to start from, e.g. 'phase 4']"
allowed-tools: Bash, Read, Grep, Glob, AskUserQuestion
---

# convergir — Real Convergence Loop

Real convergence loop — not a single test run, but an iterative cycle that finds failures, fixes them, and proves the system works end-to-end.

## Why This Exists

A single `bun test` pass proves nothing about system health after significant changes. Real convergence means every layer — validation, types, unit tests, Oracle tests, AND live E2E with real data — passes simultaneously with zero workarounds. This skill enforces that discipline.

## Convergence Protocol

Execute these phases in order. Each phase must reach zero errors before advancing. If a phase fails, diagnose and fix before retrying — never skip ahead.

### Phase 0: Pre-Flight

Check working tree status:

```bash
git status --porcelain
```

Working tree must be clean or have only expected staged changes. Merge conflicts, detached HEAD, or untracked sensitive files (.env, credentials) are blockers — resolve before proceeding.

Then check Oracle health:

```bash
curl -sf http://localhost:31415/api/health | head -1
```

| Oracle Status | Action |
|---------------|--------|
| Online (200) | Continue |
| Offline | Start with `cd oracle && CELLM_DEV_MODE=true bun run dev &`, wait 10s, re-check |
| Won't start | Report to user — infrastructure blocker |

**Dev server awareness:** The Oracle dev server dies during pre-commit hooks when `package.json` changes (Nitro hot-reload restarts the process). If convergence runs after a version bump, expect to restart the server between phases. This is normal, not a bug.

### Phase 1: Structural Validation

```bash
bun run validate
```

This runs `scripts/validate.sh` — checks directory structure, schemas, frontmatter, unique IDs, boundary enforcement, and cross-references. Fix every reported error before proceeding.

### Phase 2: Oracle Schema Validation

```bash
cd oracle && bun run validate:schema
```

Confirms DB schema definitions match runtime expectations. Schema drift here means silent data corruption downstream.

### Phase 3: Markdown Lint

```bash
bun run lint:md
```

Validates markdown formatting across cellm-core/, docs/, oracle/, cellm-plugin/. This aligns with the pre-commit pipeline — skipping it here means the commit will fail later anyway.

### Phase 4: TypeCheck

Run the Nuxt typecheck from the Oracle directory:

```bash
cd oracle && npx nuxt typecheck
```

Zero type errors required. Do not suppress with `@ts-ignore` or `any` casts — fix the actual types. If a type error reveals a real bug, that is convergence working.

### Phase 5: Root Tests

```bash
bun test
```

Runs validation + integration test suites at root level. These verify cellm-core structure, schemas, and cross-references.

### Phase 6: Oracle Tests

```bash
cd oracle && bun run test
```

Runs the full Oracle vitest suite (unit + nuxt projects). This is the heaviest gate — covers server routes, MCP tools, services, composables, and packages.

**Flaky test policy:** Integration tests in `tests/integration/pattern-stress.test.ts` (L1: Sync & Ingest) require a live Oracle server with stable timing. Timeouts (5s) on these tests are a known flaky — they do NOT block convergence if:
1. The failure is `Error: Test timed out` or `ECONNREFUSED`
2. All other tests pass
3. The test passes when Oracle is freshly started (not mid hot-reload)

If a non-timeout failure appears in these tests, it IS a real regression — investigate.

### Phase 7: E2E Smoke Test (if Oracle online)

Static tests miss integration gaps between components. This phase tests the live system with real data.

**Only run when Oracle is online.** Skip with `[~] E2E skipped — Oracle offline` if it is not.

Pick ONE of these smoke tests based on what changed:

| Changed Area | Smoke Test |
|-------------|-----------|
| changelog/* | `curl -X POST localhost:31415/api/changelog/submit -H 'Content-Type: application/json' -d '{"project":"test-convergence","version":"v0.0.1","entries":[{"commitHash":"conv1234","category":"fixed","title":"convergence smoke test"}]}'` — expect `{"ingested":1}` |
| spec-service/* | `curl -X POST localhost:31415/api/spec/nodes -H 'Content-Type: application/json' -d '{"project":"test-convergence","nodeType":"check","title":"convergence smoke","body":{"context":"test","problem":"test","principle":"test"}}'` — expect 200 with node ID |
| MCP tools | Verify tool count: `curl -s localhost:31415/api/health` — check healthy=true |
| General / unknown | Run the health check only |

**After E2E:** Clean up test data if created (delete test-convergence project entries).

### Phase 8: Convergence Verdict

After all phases pass with zero errors:

1. Report a convergence summary table:

| Phase | Result | Details |
|-------|--------|---------|
| Pre-Flight | [+] / [-] | git clean, Oracle status |
| Structural Validation | [+] / [-] | N checks, N errors |
| Oracle Schema | [+] / [-] | - |
| Markdown Lint | [+] / [-] | N errors |
| TypeCheck | [+] / [-] | N errors |
| Root Tests | [+] / [-] | N passed, N failed |
| Oracle Tests | [+] / [-] | N passed, N failed (N flaky skipped) |
| E2E Smoke | [+] / [-] / [~] | endpoint, result |

2. If ALL phases show [+] or [~]: declare **CONVERGENCE ACHIEVED**.
3. If ANY phase shows [-]: the loop is not complete — fix and re-run the failing phase.

## Iteration Rules

- **Max 5 iterations per phase.** If a phase fails 5 times, stop and report the blocker to the user — something architectural may need human decision.
- **Fix forward, not around.** Suppress nothing. Each fix must address root cause.
- **One phase at a time.** Do not run Phase 6 if Phase 4 still has errors. Earlier phases catch issues that would cascade into later ones.
- **Log each iteration.** Before retrying, state what was fixed and why.
- **Restart Oracle if needed.** After fixing server code, the dev server may need a restart before E2E. Check health before Phase 7.

## When to Abort

- Circular dependency between fixes (fixing A breaks B, fixing B breaks A)
- Infrastructure issue (DB offline after 3 restart attempts, missing dependencies, port conflict)
- Ambiguous requirement needing human decision
- Flaky test fails on non-timeout error (real regression discovered)

In these cases, report the situation clearly and ask the user.

The goal is not green checkmarks — it is a system that actually works.

## NEVER

- **Skip phases** — each phase catches issues the next one would cascade.
- **Suppress with ts-ignore or any** — fix the actual types.
- **Declare convergence with [-] phases** — all must be [+] or [~].
- **Retry more than 5 times** — escalate to user.
- **Run E2E without Oracle online** — skip with [~] instead.

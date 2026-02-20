---
name: arena
description: Run ARENA quality checks — test suites, typecheck, health verification
argument-hint: "[scope]: all | labs | typecheck | health | file <path>"
allowed-tools: Bash, Read, Grep
model: inherit
---

# ARENA — Quality Command Center

Run ARENA quality checks for the CELLM Oracle.

## Scope Resolution

Parse the argument to determine scope:

| Argument | Scope |
|----------|-------|
| (empty) or `all` | Full suite |
| `labs` | Strategy Labs only |
| `typecheck` | TypeScript typecheck only |
| `health` | Health + endpoints only |
| `file <path>` | Tests related to a specific file |

## Execution

### `/arena` or `/arena all` — Full Suite

Run all three checks sequentially. Report consolidated results.

```bash
# 1. Vitest (full suite)
cd /Users/murillo/Dev/cellm-private/oracle && npx vitest run

# 2. TypeScript typecheck
cd /Users/murillo/Dev/cellm-private/oracle && npx nuxt typecheck

# 3. Health check (only if Oracle is running)
curl -s http://127.0.0.1:31415/health
```

### `/arena labs` — Strategy Labs Only

```bash
cd /Users/murillo/Dev/cellm-private/oracle && npx vitest run --reporter=verbose tests/unit/*-arena.test.ts tests/integration/*-arena.test.ts
```

### `/arena typecheck` — TypeScript Only

```bash
cd /Users/murillo/Dev/cellm-private/oracle && npx nuxt typecheck
```

### `/arena health` — Health + Endpoints

```bash
curl -s http://127.0.0.1:31415/health
curl -s http://127.0.0.1:31415/api/ai-status
curl -s http://127.0.0.1:31415/api/arena/pending
```

If any endpoint fails to connect, report it as `[-] Oracle not running` and skip remaining health checks.

### `/arena file <path>` — Tests for a Specific File

1. Extract the basename from the provided path
2. Use Grep to find test files that import or reference that basename:
   ```bash
   cd /Users/murillo/Dev/cellm-private/oracle && grep -rl "<basename>" tests/ --include="*.test.ts"
   ```
3. Run only the matched test files:
   ```bash
   cd /Users/murillo/Dev/cellm-private/oracle && npx vitest run <matched-files>
   ```
4. If no tests found, report `[!] No tests found for <path>`

## Reporting Format

Report results using ASCII status markers:

```
[+] Vitest: 2209 tests passed (0 failed)
[+] Typecheck: no errors
[+] Health: all endpoints responding
```

Or on failure:

```
[-] Vitest: 2207 passed, 2 FAILED
    FAIL tests/unit/compass-arena.test.ts > ARENA A > test name
[-] Typecheck: 3 errors found
[+] Health: all endpoints responding
```

## On Failure

When tests fail:
1. Read the failing test file and the source file it tests
2. Analyze the root cause
3. Propose a fix with specific code changes
4. Ask before applying the fix

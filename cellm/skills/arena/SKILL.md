---
name: arena
description: Run ARENA quality checks for any Node.js/Bun project. Detects test runner, runs test suites, typecheck, and health verification with trend reporting via Oracle.
argument-hint: "[scope]: all | labs | typecheck | health | file <path>"
allowed-tools: Bash(bun test *), Bash(npx *), Bash(curl *), Bash(cd *), Bash(timeout *), Bash(find *), Read, Grep
context: fork
---

# ARENA — Diagnostic Layer

Run ARENA quality checks for the current project. Works with any Node.js/Bun project.

## Setup

Detect project root and tooling:

```bash
PROJECT_ROOT="$(git rev-parse --show-toplevel)"
```

### Detect Test Runner

Read `package.json` to determine the test runner:

```bash
TEST_RUNNER=$(node -e "
  const pkg = require('$PROJECT_ROOT/package.json');
  const scripts = pkg.scripts || {};
  const deps = { ...pkg.devDependencies, ...pkg.dependencies };
  if (deps['vitest'] || (scripts.test && scripts.test.includes('vitest'))) console.log('vitest');
  else if (deps['jest'] || (scripts.test && scripts.test.includes('jest'))) console.log('jest');
  else if (scripts.test && scripts.test.includes('bun test')) console.log('bun');
  else if (scripts.test) console.log('script');
  else console.log('none');
")
```

Test run commands by runner:

| Runner | Command |
|--------|---------|
| `vitest` | `npx vitest run` |
| `jest` | `npx jest` |
| `bun` | `bun test` |
| `script` | `npm test` |
| `none` | Report `[!] No test runner detected` and skip |

### Detect Typecheck Command

```bash
TYPECHECK_CMD=""
if [ -f "$PROJECT_ROOT/nuxt.config.ts" ] || [ -f "$PROJECT_ROOT/nuxt.config.js" ]; then
  TYPECHECK_CMD="npx nuxt typecheck"
elif [ -f "$PROJECT_ROOT/tsconfig.json" ]; then
  TYPECHECK_CMD="npx tsc --noEmit"
fi
```

### Detect Oracle (optional)

```bash
ORACLE_PORT=31415
ORACLE_ONLINE=$(curl -sf --max-time 2 --connect-timeout 1 http://127.0.0.1:${ORACLE_PORT}/health 2>/dev/null && echo "yes" || echo "no")
```

## Scope Resolution

Parse the argument to determine scope:

| Argument | Scope |
|----------|-------|
| (empty) or `all` | Full suite |
| `labs` | Strategy Labs only |
| `typecheck` | TypeScript typecheck only |
| `health` | Health + endpoints only |
| `file <path>` | Tests related to a specific file |
| `debug <error>` | Runtime debug session |

## Delegation

### `/arena debug <error>` — Runtime Debug Session

If scope is `debug`, delegate to the `/arena-debug` skill with the remaining argument:
- Extract everything after `debug ` as the error description
- Invoke `/arena-debug <error description>`
- Do NOT execute any other arena checks

## Execution

### `/arena` or `/arena all` — Full Suite

Run all checks sequentially. Report consolidated results.

```bash
# 1. Tests (using detected runner)
cd $PROJECT_ROOT && <TEST_RUN_CMD>

# 2. TypeScript typecheck (if TYPECHECK_CMD detected)
cd $PROJECT_ROOT && $TYPECHECK_CMD

# 3. Health check (only if Oracle online)
# Skip silently if Oracle not running
```

### `/arena labs` — Strategy Labs Only

Search for arena test files across the entire project:

```bash
cd $PROJECT_ROOT && find . -name '*-arena.test.ts' -not -path '*/node_modules/*' -not -path '*/.nuxt/*'
```

If no arena test files found, report `[!] No arena lab files (*-arena.test.ts) found` and stop.

Run only matched files with the detected test runner:

| Runner | Command |
|--------|---------|
| `vitest` | `npx vitest run --reporter=verbose <matched-files>` |
| `jest` | `npx jest <matched-files>` |
| `bun` | `bun test <matched-files>` |

### `/arena typecheck` — TypeScript Only

Use the detected `TYPECHECK_CMD`. If no TypeScript config found, report `[!] No tsconfig.json or nuxt.config found` and stop.

```bash
cd $PROJECT_ROOT && $TYPECHECK_CMD
```

### `/arena health` — Health + Endpoints

```bash
curl -s --connect-timeout 3 http://127.0.0.1:31415/health
curl -s --connect-timeout 3 http://127.0.0.1:31415/api/ai-status
curl -s --connect-timeout 3 http://127.0.0.1:31415/api/arena/pending
```

If any endpoint fails to connect, report it as `[-] Oracle not running` and skip remaining health checks.

### `/arena file <path>` — Tests for a Specific File

1. Extract the basename from the provided path
2. Use Grep to find test files that import or reference that basename across the whole project:
   ```bash
   cd $PROJECT_ROOT && grep -rl "<basename>" --include="*.test.ts" --include="*.spec.ts" --exclude-dir=node_modules --exclude-dir=.nuxt
   ```
3. Run only the matched test files using the detected test runner
4. If no tests found, report `[!] No tests found for <path>`

## Reporting Format

Report results using ASCII status markers:

```
[+] Tests: 42 tests passed (0 failed) [vitest]
[+] Typecheck: no errors
[+] Health: all endpoints responding
```

Or on failure:

```
[-] Tests: 40 passed, 2 FAILED [vitest]
    FAIL tests/unit/my-test.ts > describe > test name
[-] Typecheck: 3 errors found
[+] Health: all endpoints responding
```

## After Test Run: Ingest + Trend

After tests complete (only if Oracle is online):

1. Ingest snapshots:
   ```bash
   curl -s -X POST http://127.0.0.1:31415/api/arena/ingest 2>/dev/null || true
   ```

2. Get trends:
   ```bash
   TRENDS=$(curl -s http://127.0.0.1:31415/api/arena/trends 2>/dev/null || echo '{}')
   ```

3. If trends available (TRENDS contains `"trends"`), append diagnostic report:
   ```
   --- ARENA DIAGNOSTIC ---
   [+] confidence-arena: 95.0 — stable (5 runs)
   [!] write-gate-arena: 72.0 (was 100.0) — REGRESSION (delta: -28.0)
   [+] importance-decay-arena: 93.5 — improving (delta: +8.2)
   [+] search-strategy-arena: 90.0 — first-run
   ```

   Status mapping:
   - `stable`: delta between -10 and +5
   - `improving`: delta > +5
   - `regression`: delta < -10 (use `[!]` marker)
   - `first-run`: no previous data

If Oracle is not running or trends is empty, skip trend section silently.

## On Failure

When tests fail:
1. Read the failing test file and the source file it tests
2. Analyze the root cause
3. Propose a fix with specific code changes
4. Ask before applying the fix

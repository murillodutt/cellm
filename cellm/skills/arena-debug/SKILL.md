---
name: arena-debug
description: Runtime debugging — automated iterative log-and-restart diagnostic agent. Instruments code with console.log markers, reproduces errors, analyzes output, and iterates up to 3 times before generating a diagnostic report.
argument-hint: "[--mode auto|interactive|observe] [--resume <id>] <error description or stack trace>"
allowed-tools: Bash(timeout *), Bash(grep *), Bash(kill *), Bash(lsof *), Bash(git *), Bash(curl *), Bash(cd *), Bash(npx *), Bash(sleep *), Bash(rm *), Read, Grep, Glob, Edit, Write, AskUserQuestion
context: fork
---

Diagnose runtime errors by instrumenting code with `[CELLM-DBG]` markers, reproducing the error, analyzing output, and iterating if inconclusive. Max **3 iterations**, max **5 instrumentation points** per iteration across max **3 files**.

## Modes

| Mode | Detection signal | Behavior |
|------|-----------------|----------|
| `auto` (default) | Stack trace with file:line | Instrument, restart app, capture output, analyze autonomously |
| `interactive` | "UI", "click", "visual", "button", "form" in description | Instrument, ask dev to reproduce, capture, analyze |
| `observe` | App already running (port active via `lsof`) | Instrument running app (no restart), monitor N seconds |
| `resume` | `--resume <id>` flag | Load previous session context, continue from HYPOTHESIZE |

Explicit `--mode` flag always overrides auto-detection.

## Phase Flow

```
GATHER -> HYPOTHESIZE -> INSTRUMENT -> REPRODUCE/PAUSE/MONITOR -> ANALYZE -> [ITERATE?] -> REPORT -> CLEANUP
                                                                    |              |
                                                                    +-- inconclusive? back to HYPOTHESIZE (max 3x)
```

**Safety invariant:** CLEANUP always executes. Wrap phases 3-6 in try/finally.

## State Variables

```
ITERATION=1  MAX_ITERATIONS=3  SESSION_START=$(date +%s)
REFUTED_HYPOTHESES=()  ALL_ITERATIONS=()  MODE="auto"
SESSION_ID=$(uuidgen)  PARENT_ID=null
```

## Phase 0: RESUME (only with --resume)

Load previous run via `GET /api/arena/debug-runs/${RESUME_ID}`. Reconstruct session ID, mode, error description, refuted hypotheses, iteration count. Skip to Phase 2. If run not found, report `[-] Cannot resume: run #<id> not found` and exit.

## Phase 1: GATHER

1. Parse error description, mode flag, stack trace from argument
2. Recent logs: `ls ~/.cellm/logs/*.log 2>/dev/null | tail -3 | xargs tail -50`
3. Recent git: `git log --oneline -10` and `git diff --stat HEAD~3..HEAD`
4. Search codebase for error message/type using Grep
5. Process info: `lsof -i :3000 2>/dev/null || lsof -i :31415 2>/dev/null`
6. **Oracle** (best-effort, 2s timeout): query `/api/arena/debug-runs` for similar errors, `/api/knowledge/search` for domain context

## Phase 2: HYPOTHESIZE

Generate **3-5 ranked hypotheses**. Format: `H1 (85%): <description> — evidence: <source>`.

**NEVER regenerate a hypothesis in `REFUTED_HYPOTHESES`**. Each iteration produces new hypotheses informed by what previous iterations revealed. Past confirmed root causes from Oracle get +15% confidence boost. Select top 2-3 for instrumentation.

## Phase 3: INSTRUMENT

Insert diagnostic logs. Every line ends with `// CELLM-DBG` marker, uses `[CELLM-DBG][HN]` prefix.

```typescript
console.log('[CELLM-DBG][H1] varName:', varName) // CELLM-DBG
```

**Before instrumenting (first iteration, auto/interactive only):** `git stash -m "cellm-debug-session-$(date +%s)"`. Mode observe: NO stash.

**After instrumenting:** verify with `npx tsc --noEmit 2>&1 | head -20 || true`. Fix or remove points that break typecheck.

## Phase 4: REPRODUCE / PAUSE / MONITOR

**Auto:** Detect runtime (nuxt.config.ts -> `npx nuxt dev`, else package.json scripts). Start with `timeout 30`, capture output, trigger scenario, capture for 10s, terminate. Filter: `grep '[CELLM-DBG]'`.

**Interactive:** Inform dev of instrumentation points. AskUserQuestion: "Reproduce the error, select Done when finished." / "Cancel — abort." On cancel, report `inconclusive`.

**Observe:** Monitor running app for N seconds (default 30, max 120) via `tail -f` on detected log file. Filter `[CELLM-DBG]` lines.

## Phase 5: ANALYZE

For each hypothesis, check if `[CELLM-DBG][HN]` markers appeared. Determine: `confirmed` (clear root cause), `inconclusive` (ambiguous), or `refuted` (no match). Record iteration. Add refuted hypotheses to `REFUTED_HYPOTHESES`.

## Phase 5.5: ITERATE

**Entry:** ANALYZE returned inconclusive/refuted AND `ITERATION < MAX_ITERATIONS` AND elapsed < 8 minutes.

Clean previous instrumentation (`sed -i '' '/CELLM-DBG/d'`), clean temp files, increment iteration, state what was learned, return to Phase 2.

## Phase 6: REPORT

Output diagnostic report with: session ID, mode, error, result, duration, all iterations with hypotheses/evidence, root cause + suggested fix (if confirmed).

If `inconclusive` and iterations < MAX: `[i] Resume with: /arena-debug --resume <RUN_ID>`.

**Persist to Oracle:** `POST /api/arena/debug-runs` with full session data. If Oracle offline: `[!] Could not persist (Oracle offline)` and continue.

## Phase 7: CLEANUP (always executes)

1. Remove all `CELLM-DBG` lines: `grep -rn "CELLM-DBG" --include="*.ts" --include="*.js" --include="*.vue" -l | while read f; do sed -i '' '/CELLM-DBG/d' "$f"; done`
2. Verify: `grep -rn "CELLM-DBG" ... || echo "[+] All instrumentation removed"`
3. Restore stash (auto/interactive only): `git stash pop` the cellm-debug-session stash
4. Clean temp files: `rm -f /tmp/cellm-debug-*.log`

## Limits

| Constraint | Value |
|------------|-------|
| Max iterations | 3 |
| Instrumentation per iteration | 5 points, 3 files |
| Instrumentation total | 15 points, 5 files |
| Output capture per iteration | 10 KB |
| App startup timeout | 30s |
| Monitor duration (observe) | 30s default, 120s max |
| Total session timeout | 10 minutes |

## NEVER

- **Instrument production** — if `NODE_ENV=production`, refuse and exit
- **Retest refuted hypotheses** — once refuted, permanently excluded
- **Skip CLEANUP** — always executes, even on error (try/finally)
- **Block on Oracle** — all Oracle calls best-effort with 2s timeout
- **Multi-line instrumentation** — one `console.log` per point, single line
- **Exceed limits** — hard caps on iterations, points, files, and time

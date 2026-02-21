---
name: arena-debug
description: Runtime debugging — automated iterative log-and-restart diagnostic agent
argument-hint: "[--mode auto|interactive|observe] [--resume <id>] <error description or stack trace>"
allowed-tools: Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion
model: inherit
---

# ARENA Debug — Runtime Diagnostic Agent (v2.0)

Automated iterative log-and-restart debugging for Node.js/Bun applications. Instruments code, reproduces errors, analyzes output, iterates if inconclusive, and generates diagnostic reports. Supports three operation modes and persistent sessions.

## Syntax

```
/arena-debug <error description>
/arena-debug --mode interactive "UI button does not respond"
/arena-debug --mode observe "intermittent 503 errors"
/arena-debug --resume 47
```

## Operation Modes

| Mode | When to use | Behavior |
|------|-------------|----------|
| `auto` (default) | Bugs reproducible by test or command | Instruments, restarts app, captures output, analyzes — fully autonomous |
| `interactive` | UI bugs, scenarios requiring human action | Instruments, asks dev to reproduce, captures output, analyzes |
| `observe` | App already running, intermittent errors | Instruments active app (no restart), monitors for N seconds |

## Mode Detection

If no `--mode` is specified, detect automatically:

| Signal | Suggested mode |
|--------|----------------|
| Error has stack trace with file:line | `auto` |
| Error mentions "UI", "click", "visual", "render", "button", "form" | `interactive` |
| App is already running (port active via lsof) | `observe` |
| Dev specifies mode explicitly | Always respected |

```bash
# Detection logic
APP_RUNNING=$(lsof -i :3000 2>/dev/null || lsof -i :31415 2>/dev/null)
ERROR_IS_UI=$(echo "$ERROR_DESCRIPTION" | grep -iE 'UI|click|visual|render|button|form|display|layout')

if [ -n "$RESUME_ID" ]; then
  MODE="resume"
elif [ -n "$EXPLICIT_MODE" ]; then
  MODE="$EXPLICIT_MODE"
elif [ -n "$ERROR_IS_UI" ]; then
  MODE="interactive"
elif [ -n "$APP_RUNNING" ]; then
  MODE="observe"
else
  MODE="auto"
fi
```

## Phases

### Mode: auto (default)

```
GATHER -> HYPOTHESIZE -> INSTRUMENT -> REPRODUCE -> ANALYZE -> [ITERATE?] -> REPORT -> CLEANUP
                                                       |            |
                                                       +-- if inconclusive, back to HYPOTHESIZE
                                                           (max 3 iterations)
```

### Mode: interactive

```
GATHER -> HYPOTHESIZE -> INSTRUMENT -> PAUSE -> ANALYZE -> [ITERATE?] -> REPORT -> CLEANUP
                                         |
                                         +-- asks dev to reproduce, waits for confirmation
```

### Mode: observe

```
GATHER -> HYPOTHESIZE -> INSTRUMENT (no restart) -> MONITOR -> ANALYZE -> [ITERATE?] -> REPORT -> CLEANUP
                                                       |
                                                       +-- watches logs for N seconds (default 30, max 120)
```

### Mode: resume

```
[Load session context] -> HYPOTHESIZE -> INSTRUMENT -> REPRODUCE/PAUSE/MONITOR -> ANALYZE -> [ITERATE?] -> REPORT -> CLEANUP
```

**Safety invariant:** CLEANUP always executes, even on error. Wrap phases 3-6 in try/finally.

**State tracking:** Maintain these variables across all phases:

```
ITERATION=1              # current iteration (1-based)
MAX_ITERATIONS=3         # hard cap
SESSION_START=$(date +%s) # for timeout enforcement
REFUTED_HYPOTHESES=()    # hypothesis IDs that have been refuted — NEVER retest
ALL_ITERATIONS=()        # JSON records of each iteration for the final report
MODE="auto"              # auto | interactive | observe
SESSION_ID=$(uuidgen)    # persistent session identifier
PARENT_ID=null           # ID of previous run in same session (for --resume)
```

---

## Phase 0: RESUME (only when --resume is used)

**Entry condition:** `--resume <id>` flag present.

1. **Load previous run:**
   ```bash
   PREV_RUN=$(curl -sf --max-time 2 \
     "http://127.0.0.1:31415/api/arena/debug-runs/${RESUME_ID}" \
     2>/dev/null || echo '{}')
   ```

2. **Load session history:**
   ```bash
   PREV_SESSION_ID=$(echo "$PREV_RUN" | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.run?.sessionId||'')")
   SESSION_RUNS=$(curl -sf --max-time 2 \
     "http://127.0.0.1:31415/api/arena/debug-runs?session=${PREV_SESSION_ID}" \
     2>/dev/null || echo '{"runs":[]}')
   ```

3. **Reconstruct context:**
   - Set `SESSION_ID` to previous session's ID (continue same session)
   - Set `PARENT_ID` to the resumed run's ID
   - Set `MODE` to the previous run's mode
   - Extract `ERROR_DESCRIPTION` from previous run
   - Extract all tested hypotheses and their results
   - Add all refuted hypotheses to `REFUTED_HYPOTHESES`
   - Set `ITERATION` to previous run's iteration count + 1

4. **Skip to Phase 2: HYPOTHESIZE** with accumulated context.

If Oracle is offline or run not found, report `[-] Cannot resume: run #<id> not found` and exit.

---

## Phase 1: GATHER

Collect context about the error being investigated.

```bash
REPO_ROOT="$(git rev-parse --show-toplevel)"
PROJECT=$(basename "$REPO_ROOT")
```

1. **Parse argument**: Extract error description, mode flag, and/or stack trace from the skill argument.

2. **Recent logs** (if available):
   ```bash
   ls ~/.cellm/logs/*.log 2>/dev/null | tail -3 | xargs tail -50
   ```

3. **Recent git changes**:
   ```bash
   cd $REPO_ROOT && git log --oneline -10
   cd $REPO_ROOT && git diff --stat HEAD~3..HEAD
   ```

4. **Search for error in codebase** using Grep:
   - Search for the error message/type in source files
   - Read relevant files around the error location

5. **Collect process info** (if app is running):
   ```bash
   lsof -i :3000 2>/dev/null || lsof -i :31415 2>/dev/null || echo "No process found"
   ```

6. **Consult Oracle — previous debug runs** (optional, graceful fallback):
   ```bash
   ERROR_SHORT=$(echo "$ERROR_DESCRIPTION" | head -c 100 | sed 's/ /%20/g')
   PREV_RUNS=$(curl -sf --max-time 2 \
     "http://127.0.0.1:31415/api/arena/debug-runs?project=${PROJECT}&error=${ERROR_SHORT}&limit=5" \
     2>/dev/null || echo '{"runs":[]}')
   ```
   If previous runs exist, extract confirmed root causes and refuted hypotheses to avoid repeating work.

7. **Consult Oracle — knowledge base** (optional, graceful fallback):
   ```bash
   KNOWLEDGE=$(curl -sf --max-time 2 \
     "http://127.0.0.1:31415/api/knowledge/search?q=$(echo "$ERROR_DESCRIPTION" | head -c 100 | sed 's/ /%20/g')&project=${PROJECT}&limit=3" \
     2>/dev/null || echo '{"atoms":[]}')
   ```
   Knowledge atoms provide domain-specific context about modules, patterns, and known issues.

**Oracle queries are best-effort.** If Oracle is offline or returns empty, proceed normally. Never block on Oracle.

Output: A structured summary of all gathered context, including Oracle findings (if any).

---

## Phase 2: HYPOTHESIZE

Generate 3-5 ranked hypotheses based on gathered context.

**Constraint:** NEVER generate a hypothesis that appears in `REFUTED_HYPOTHESES`. Each iteration must produce NEW hypotheses informed by what previous iterations revealed.

**Context-informed generation:** Before generating hypotheses, review Oracle context from Phase 1:

1. **Previous debug runs**: If the same error (or similar) was investigated before:
   - Hypotheses confirmed in past runs get a **confidence boost** (+15%)
   - Hypotheses refuted in past runs are **skipped** (treated as REFUTED)
   - Root causes from past runs inform new hypotheses directly
2. **Knowledge atoms**: If the knowledge base has information about the affected module/file, use it as context for more precise hypotheses
3. **Known patterns**: If the error matches a known pattern (e.g., "ECONNREFUSED on cold start" = known race condition), prioritize that hypothesis

Format each hypothesis with **source attribution**:
```
H1 (85%): Cache not warmed on startup — evidence: similar to debug-run #42 (confirmed), knowledge atom "cold-start-patterns"
H2 (60%): Database connection pool exhausted — evidence: stack trace shows timeout in db/client.ts
H3 (30%): Circular import at startup — evidence: recent git changes in server/index.ts
```

Ranking criteria:
- Stack trace specificity (exact file/line = higher confidence)
- Recency of changes (recently modified files = more likely)
- Error type patterns (TypeError suggests null access, ECONNREFUSED suggests service down)
- **Oracle context**: Past confirmed root causes for similar errors
- **Iteration > 1**: What the previous iteration's logs revealed or ruled out

Select top 2-3 hypotheses for instrumentation.

---

## Phase 3: INSTRUMENT

Insert diagnostic `console.log` statements to validate hypotheses.

**Rules:**
- Maximum **5 instrumentation points** across maximum **3 files** per iteration
- Every inserted line MUST end with `// CELLM-DBG` comment marker
- Every log MUST use `[CELLM-DBG][HN]` prefix where N is hypothesis number
- Single line per instrumentation point (no multi-line)

**Format:**
```typescript
console.log('[CELLM-DBG][H1] varName:', varName) // CELLM-DBG
```

**Before instrumenting (first iteration only, mode auto and interactive only):**
```bash
cd $REPO_ROOT && git stash -m "cellm-debug-session-$(date +%s)"
```

**Mode observe: do NOT git stash** — app is running with developer's changes.

**After instrumenting, verify no breakage:**
```bash
cd $REPO_ROOT && npx tsc --noEmit 2>&1 | head -20 || true
```

If typecheck fails due to instrumentation, fix or remove the offending point.

Track all instrumentation points for the report:
```
[{ file: "src/foo.ts", line: 42, hypothesis: "H1" }, ...]
```

---

## Phase 4: REPRODUCE (mode: auto)

Restart the application and trigger the error scenario.

**Detect runtime and entrypoint:**
```bash
# Check for common entrypoints
if [ -f "$REPO_ROOT/nuxt.config.ts" ] || [ -f "$REPO_ROOT/nuxt.config.js" ]; then
  RUNTIME="nuxt"
  START_CMD="npx nuxt dev"
elif [ -f "$REPO_ROOT/package.json" ]; then
  # Check package.json scripts
  START_CMD=$(node -e "const p=require('$REPO_ROOT/package.json'); console.log(p.scripts?.dev || p.scripts?.start || 'node .')")
  RUNTIME="node"
fi
```

**Start application and capture output:**
```bash
cd $REPO_ROOT && timeout 30 $START_CMD 2>&1 | tee /tmp/cellm-debug-output.log &
APP_PID=$!

# Wait for startup (watch for common ready signals)
sleep 5

# Trigger scenario (adapt based on error context)
# Example: curl -s http://localhost:3000/path-that-fails || true

# Capture for N seconds
sleep 10

# Terminate
kill $APP_PID 2>/dev/null || true
wait $APP_PID 2>/dev/null || true
```

**Capture output:**
```bash
grep '[CELLM-DBG]' /tmp/cellm-debug-output.log > /tmp/cellm-debug-filtered.log 2>/dev/null || true
```

This phase is **fully autonomous** — no user confirmation needed for restart.

---

## Phase 4i: PAUSE (mode: interactive)

Instead of restarting the app, ask the developer to reproduce the error.

1. **Inform the developer** what was instrumented:
   ```
   [i] Instrumented <N> points across <M> files:
     - src/components/Button.vue:42 (H1: click handler)
     - src/composables/useAuth.ts:15 (H2: auth state)

   Please reproduce the error and confirm when done.
   ```

2. **Wait for confirmation** using AskUserQuestion:
   - Question: "Reproduce the error in your application. When done, select 'Done' so I can analyze the logs."
   - Options: "Done — I reproduced the error" / "Cancel — abort debug session"

3. **After confirmation**, capture output:
   ```bash
   grep '[CELLM-DBG]' /tmp/cellm-debug-output.log > /tmp/cellm-debug-filtered.log 2>/dev/null || true
   ```
   If the app writes to stdout, read from there. If the app writes to a log file, detect and read from the log file.

4. If the developer selects "Cancel", skip to REPORT with status `inconclusive` and note "cancelled by user".

---

## Phase 4o: MONITOR (mode: observe)

Monitor the already-running application for N seconds without restart.

1. **Detect app output source:**
   ```bash
   # Check common log locations
   APP_LOG=$(ls -t /tmp/*.log ~/.pm2/logs/*.log 2>/dev/null | head -1)
   if [ -z "$APP_LOG" ]; then
     APP_LOG="/dev/stdout"
   fi
   ```

2. **Monitor for N seconds** (default 30, max 120):
   ```bash
   MONITOR_DURATION=${OBSERVE_DURATION:-30}
   timeout $MONITOR_DURATION tail -f "$APP_LOG" > /tmp/cellm-debug-output.log 2>/dev/null &
   TAIL_PID=$!

   sleep $MONITOR_DURATION
   kill $TAIL_PID 2>/dev/null || true
   ```

3. **Capture output:**
   ```bash
   grep '[CELLM-DBG]' /tmp/cellm-debug-output.log > /tmp/cellm-debug-filtered.log 2>/dev/null || true
   ```

4. If no `[CELLM-DBG]` lines captured, the code path may not have been triggered during monitoring. Note this in ANALYZE.

---

## Phase 5: ANALYZE

Correlate instrumented output with hypotheses.

1. Read filtered output:
   ```bash
   cat /tmp/cellm-debug-filtered.log
   ```

2. For each hypothesis, check if its `[CELLM-DBG][HN]` markers appeared in output.

3. Analyze variable values captured in logs:
   - Unexpected `undefined` or `null` = likely null reference
   - Unexpected ordering = likely race condition
   - Missing log lines = code path not reached
   - Error values = exception in that code path

4. Determine result for THIS iteration:
   - `confirmed`: Evidence clearly supports one hypothesis as root cause
   - `inconclusive`: Evidence is ambiguous, multiple hypotheses remain viable
   - `refuted`: No hypothesis matched, need different approach

5. If `confirmed`, identify the root cause and suggest a fix.

6. Record this iteration:
   ```
   ALL_ITERATIONS.push({
     iteration: ITERATION,
     hypotheses: [current hypotheses with results],
     instrumentation: [points placed this iteration],
     output: [filtered CELLM-DBG lines],
     result: "confirmed" | "inconclusive" | "refuted"
   })
   ```

7. Add refuted hypotheses to `REFUTED_HYPOTHESES`.

---

## Phase 5.5: ITERATE

**Entry condition:** Phase 5 (ANALYZE) returned `inconclusive` or `refuted`.

1. **Check iteration cap:**
   - If `ITERATION >= MAX_ITERATIONS` → proceed to REPORT
   - If elapsed time > 8 minutes → proceed to REPORT (reserve 2 min for cleanup)

2. **Clean previous instrumentation** (same as CLEANUP step 1, but do NOT restore stash):
   ```bash
   cd $REPO_ROOT
   grep -rn "CELLM-DBG" --include="*.ts" --include="*.js" --include="*.vue" -l | while read f; do
     sed -i '' '/CELLM-DBG/d' "$f"
   done
   ```

3. **Clean temp files:**
   ```bash
   rm -f /tmp/cellm-debug-output.log /tmp/cellm-debug-filtered.log
   ```

4. **Increment:** `ITERATION=$((ITERATION + 1))`

5. **Analyze learnings:** Before generating new hypotheses, explicitly state:
   - Which hypotheses were refuted and why
   - What the logs DID show (unexpected values, missing lines, timing)
   - What new areas of the code to investigate

6. **Return to Phase 2: HYPOTHESIZE** with updated context.

---

## Phase 6: REPORT

Generate diagnostic report and persist to Oracle DB.

**Report to user:**
```
--- ARENA DEBUG REPORT ---
Session: <SESSION_ID> (mode: <MODE>)
Error: <original error description>
Result: <confirmed|inconclusive|refuted> (iteration <N> of <MAX>)
Duration: <Xs> (<N> iteration(s))

Iteration 1:
  H1 (80%): <description> — <CONFIRMED|refuted|inconclusive>
  H2 (60%): <description> — <confirmed|REFUTED|inconclusive>

Iteration 2 (if applicable):
  H3 (75%): <description> — <CONFIRMED|refuted|inconclusive>
  Evidence: [CELLM-DBG][H3] <what the log showed>

Root Cause: <if confirmed>
Suggested Fix: <if confirmed>

Instrumentation: <N total points across M files, K iteration(s)>
Output Lines: <N CELLM-DBG lines captured total>
```

If result is `inconclusive` or `refuted`, add:
```
[i] Session is open. Resume with: /arena-debug --resume <RUN_ID>
```

**Determine session status:**
- `closed`: result is `confirmed` OR max iterations reached
- `open`: result is `inconclusive` or `refuted` AND iterations < MAX

**Persist to DB:**
```bash
DEBUG_STATUS="closed"
if [ "$RESULT" != "confirmed" ] && [ "$ITERATION" -lt "$MAX_ITERATIONS" ]; then
  DEBUG_STATUS="open"
fi

curl -s -X POST http://127.0.0.1:31415/api/arena/debug-runs \
  -H 'Content-Type: application/json' \
  -d '{
    "error": "<error description>",
    "hypotheses": "<JSON array — final state>",
    "result": "<confirmed|inconclusive|refuted>",
    "rootCause": "<if confirmed>",
    "instrumentation": "<JSON array — final iteration points>",
    "output": "<truncated to 10KB — final iteration>",
    "project": "<project name>",
    "duration": <ms>,
    "iterations": "<JSON array — ALL iteration records>",
    "sessionId": "<SESSION_ID>",
    "mode": "<MODE>",
    "parentId": <PARENT_ID or null>,
    "debugStatus": "<open|closed>"
  }'
```

If Oracle is not running, report `[!] Could not persist debug run (Oracle offline)` and continue.

---

## Phase 7: CLEANUP

**This phase MUST always execute**, even if previous phases failed.

1. **Remove all instrumentation:**
   ```bash
   cd $REPO_ROOT
   grep -rn "CELLM-DBG" --include="*.ts" --include="*.js" --include="*.vue" -l | while read f; do
     sed -i '' '/CELLM-DBG/d' "$f"
   done
   ```

2. **Verify cleanup:**
   ```bash
   cd $REPO_ROOT && grep -rn "CELLM-DBG" --include="*.ts" --include="*.js" --include="*.vue" || echo "[+] All instrumentation removed"
   ```

3. **Restore stashed changes (mode auto and interactive only):**
   ```bash
   if [ "$MODE" != "observe" ]; then
     STASH=$(cd $REPO_ROOT && git stash list | grep "cellm-debug-session" | head -1 | cut -d: -f1)
     if [ -n "$STASH" ]; then
       cd $REPO_ROOT && git stash pop "$STASH"
     fi
   fi
   ```

4. **Clean temp files:**
   ```bash
   rm -f /tmp/cellm-debug-output.log /tmp/cellm-debug-filtered.log
   ```

---

## Error Handling

If any phase fails:
1. Log the error with `[-] Phase N failed: <reason>`
2. Skip to CLEANUP (phase 7)
3. Report partial results from completed phases
4. Always persist what was gathered (even partial reports)

## Safety Guards

| Guard | Rule |
|-------|------|
| Production detection | If `NODE_ENV=production`, refuse to instrument. Report `[-] Cannot instrument production app` and exit |
| Git stash | Mode auto/interactive: stash once at start, pop at CLEANUP. Mode observe: NO stash |
| Cleanup guarantee | try/finally wraps phases 3-6 |
| Oracle offline | All Oracle calls are optional with 2s timeout |

## Limits

| Constraint | Value |
|------------|-------|
| Max iterations | 3 |
| Max instrumentation points per iteration | 5 |
| Max instrumented files per iteration | 3 |
| Max instrumentation total (all iterations) | 15 points, 5 files |
| Max output capture per iteration | 10 KB |
| App startup timeout | 30 seconds |
| Monitor duration (observe mode) | 30s default, 120s max |
| Total session timeout | 10 minutes |
| Refuted hypotheses | NEVER retested |

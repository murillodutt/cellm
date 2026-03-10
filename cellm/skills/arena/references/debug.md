# Debug Mode — Reference

Iterative instrumentation and diagnosis. Instruments code with `[CELLM-DBG]` markers, reproduces errors, analyzes output, iterates up to 3 times.

## Sub-Mode Detection

| Sub-mode | Signal | Behavior |
|----------|--------|----------|
| `auto` (default) | Stack trace with file:line | Instrument, restart, capture, analyze |
| `interactive` | "UI/click/visual/button/form" in prompt | Instrument, ask dev to reproduce, capture |
| `observe` | Port active via `lsof` | Instrument running app, monitor N seconds |

## Phase Flow

```
GATHER → HYPOTHESIZE → INSTRUMENT → REPRODUCE → ANALYZE → [ITERATE?] → REPORT → CLEANUP
```

CLEANUP is best-effort — the skill execution model has no try/finally mechanism. If interrupted, recover manually (see CLEANUP section).

### GATHER
Parse error, recent logs (`~/.cellm/logs/` if exists, skip silently otherwise), recent git (`log -10`, `diff --stat HEAD~3`), grep codebase, process info (`lsof`), Oracle similar errors (2s timeout, skip if offline).

### HYPOTHESIZE
3-5 ranked hypotheses: `H1 (85%): desc — evidence: source`. Never regenerate refuted hypotheses. Oracle confirmed causes get +15% boost. Pick top 2-3 to instrument.

### INSTRUMENT
Insert `console.log('[CELLM-DBG][HN] var:', var) // CELLM-DBG`. First iteration: `git stash push -m "arena-debug-$(date +%s)"` to save state — record the stash ref (`git stash list | head -1`) for explicit pop in CLEANUP. After: verify typecheck passes.

### REPRODUCE
- **Auto**: detect runtime, `timeout 30`, filter `[CELLM-DBG]`
- **Interactive**: AskUserQuestion to reproduce
- **Observe**: `tail -f` for 30-120s

### ANALYZE
Per hypothesis: confirmed / inconclusive / refuted. Refuted go to permanent exclusion list.

### ITERATE
If inconclusive AND iterations < 3 AND elapsed < 8min: clean instrumentation, return to HYPOTHESIZE with exclusion list.

### REPORT
Session ID, mode, error summary, iterations taken, root cause + fix. Persist to Oracle if online.

### CLEANUP
1. Remove all `CELLM-DBG` lines via Edit tool
2. Verify removal with Grep tool (pattern `CELLM-DBG`). If markers survive: re-run Edit on each file:line, then re-verify. If still present after 2 attempts: warn developer with file:line list
3. Restore stash with `git stash pop <stash-ref>` (using the ref saved in INSTRUMENT phase)
4. Clean temp files

**Recovery (if session interrupted before CLEANUP):**
- Stash: `git stash list` — look for `arena-debug-*` entries, pop with `git stash pop stash@{N}`
- Markers: `grep -rn "CELLM-DBG" .` — remove manually or re-invoke `/cellm:arena debug` which detects and cleans existing markers

## Hard Limits

| Constraint | Value |
|------------|-------|
| Iterations | 3 |
| Points per iteration | 5, across 3 files max |
| Total points | 15, across 5 files max |
| Capture per iteration | 10 KB |
| App timeout | 30s |
| Monitor window | 30s default, 120s max |
| Session timeout | 10 min |

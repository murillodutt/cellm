---
description: Runtime debugging — automated iterative log-and-restart diagnostic agent. Instruments code with console.log markers, reproduces errors, analyzes output, and iterates up to 3 times before generating a diagnostic report.
argument-hint: "[--mode auto|interactive|observe] [--resume <id>] <error description or stack trace>"
allowed-tools: Bash(timeout *), Bash(grep *), Bash(kill *), Bash(lsof *), Bash(git *), Bash(curl *), Bash(cd *), Bash(npx *), Bash(sleep *), Bash(rm *), Read, Grep, Glob, Edit, Write, AskUserQuestion
context: fork
---

Instrument code with `[CELLM-DBG]` markers, reproduce error, analyze, iterate. Max 3 iterations, 5 points/iteration, 3 files/iteration.

## Mode Detection

| Mode | Signal | Behavior |
|------|--------|----------|
| `auto` (default) | Stack trace with file:line | Instrument → restart → capture → analyze |
| `interactive` | "UI/click/visual/button/form" | Instrument → ask dev to reproduce → capture |
| `observe` | Port active via `lsof` | Instrument running app → monitor N seconds |
| `resume` | `--resume <id>` | Load previous run from Oracle → skip to HYPOTHESIZE |

Explicit `--mode` overrides detection.

## Phase Flow

```
GATHER → HYPOTHESIZE → INSTRUMENT → REPRODUCE → ANALYZE → [ITERATE?] → REPORT → CLEANUP
```

**CLEANUP always executes** (try/finally).

## Phases

1. **GATHER** — Parse error, recent logs (`~/.cellm/logs/`), recent git (`log -10`, `diff --stat HEAD~3`), grep codebase, process info (`lsof`), Oracle similar errors (2s timeout).
2. **HYPOTHESIZE** — 3-5 ranked: `H1 (85%): desc — evidence: source`. Never regenerate refuted hypotheses. Oracle confirmed causes get +15% boost. Pick top 2-3.
3. **INSTRUMENT** — Insert `console.log('[CELLM-DBG][HN] var:', var) // CELLM-DBG`. First iteration auto/interactive: `git stash`. After: verify typecheck.
4. **REPRODUCE** — Auto: detect runtime, `timeout 30`, filter `[CELLM-DBG]`. Interactive: AskUserQuestion to reproduce. Observe: `tail -f` for 30-120s.
5. **ANALYZE** — Per hypothesis: confirmed / inconclusive / refuted. Add refuted to exclusion list.
6. **ITERATE** — If inconclusive AND iterations < 3 AND elapsed < 8min: clean instrumentation, return to HYPOTHESIZE.
7. **REPORT** — Session ID, mode, error, iterations, root cause + fix. Persist to Oracle. If inconclusive: suggest `--resume`.
8. **CLEANUP** — Remove `CELLM-DBG` lines, verify removal, restore stash (auto/interactive), clean temp files.

## Limits

| Constraint | Value |
|------------|-------|
| Iterations | 3 |
| Points/iteration | 5, across 3 files |
| Total points | 15, across 5 files |
| Capture/iteration | 10 KB |
| App timeout | 30s |
| Monitor | 30s default, 120s max |
| Session timeout | 10 min |

## NEVER

- **Instrument production** — refuse if `NODE_ENV=production`
- **Retest refuted** — permanently excluded
- **Skip CLEANUP** — try/finally, always
- **Block on Oracle** — best-effort, 2s timeout
- **Multi-line instrumentation** — one `console.log` per point
- **Exceed limits** — hard caps

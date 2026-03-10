---
description: "Run quality checks, debug errors, validate code, or stress-test subsystems for any Node.js/Bun project. Four modes: prove (tests + typecheck + health), debug (instrument + hypothesize + diagnose), gate (quality verdict), stress (multi-agent convergence). Triggers on: 'run tests', 'debug this', 'quality gate', 'stress test', 'prove it works', 'check quality', 'why is this failing', 'find the bug', 'validate changes', 'convergence test'. Does NOT trigger for: running arbitrary scripts, executing shell commands, or simple 'npm run X' requests."
user-invocable: true
argument-hint: "[mode] [args] — prove | debug <error> | gate [path] | stress <target>"
allowed-tools: Agent, Bash(bun run test *), Bash(npx nuxt typecheck *), Bash(npx tsc *), Bash(npx vitest *), Bash(curl *), Bash(timeout *), Bash(kill *), Bash(lsof *), Bash(git *), Read, Grep, Glob, Edit, Write, AskUserQuestion, mcp__plugin_cellm_cellm-oracle__quality_gate, mcp__plugin_cellm_cellm-oracle__search, mcp__plugin_cellm_cellm-oracle__knowledge_search
context: fork
---

# Arena — Quality Proving Ground

One entry point, four modes. Detect project tooling automatically, never assume.

## Mode Routing

| Argument | Mode | Purpose |
|----------|------|---------|
| (empty) / `prove` / `all` | **Prove** | Tests + typecheck + health |
| `labs` / `typecheck` / `health` / `file <path>` / `pre-commit` | **Prove** | Scoped variant (read `references/prove.md`) |
| `debug <error>` | **Debug** | Iterative instrumentation (read `references/debug.md`) |
| `gate [path]` | **Gate** | Quality verdict: PASS / CONDITIONAL / FAIL (read `references/gate.md`) |
| `stress <target> [N]` | **Stress** | Multi-agent convergence (read `references/stress.md`) |

## Setup Detection — Always First

| What | How | Fallback |
|------|-----|----------|
| Project root | `git rev-parse --show-toplevel` | cwd |
| Test runner | package.json scripts/deps: vitest > jest > bun > npm test | Skip tests |
| Typecheck | nuxt.config.ts > tsconfig.json | Skip typecheck |
| Oracle | `curl -sf --max-time 2 http://127.0.0.1:31415/health` | Skip Oracle features |

Oracle integration is **optional** — Arena works fully without it. When online: ingest snapshots (`POST /api/arena/ingest`), append trends (`GET /api/arena/trends`).

## Reporting Convention

```
[+] Tests: 42 passed (0 failed) [vitest]
[-] Typecheck: 3 errors
[+] Health: all endpoints responding
[!] Trend: regression detected (delta -12)
```

## On Failure

Read failing test + source file. Analyze root cause. Propose fix. Ask before applying.

## Decisions

| Decision | Rationale |
|----------|-----------|
| Detect tooling, never hardcode | Arena serves any project, not just CELLM |
| Oracle is conditional, never blocking | Offline Oracle must never prevent quality checks |
| Read reference files per mode | Keep context lean — load only what the active mode needs |
| Ask before applying fixes | Quality tool observes and reports, developer decides |
| Sequential prove pipeline | Tests > typecheck > health — fail-fast ordering |
| `context: fork` | Isolates Arena's verbose output from main conversation context. Reference files inherit fork — no access to prior conversation |

## NEVER

- **Hardcode test runner** — always detect from package.json
- **Block on Oracle offline** — skip silently, never error
- **Apply fixes without asking** — report findings, let the developer decide
- **Instrument production code** — refuse if `NODE_ENV=production`
- **Pass gate with CRITICAL findings** — CRITICAL always means FAIL
- **Fabricate findings** — every finding must have file:line evidence
- **Exceed debug limits** — 3 iterations, 5 instrumentation points per iteration, 10 min max
- **Retest refuted hypotheses** — permanently excluded from re-evaluation
- **Skip CLEANUP after debug** — try/finally, unconditional

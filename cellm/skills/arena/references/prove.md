# Prove Mode — Reference

## Scope Variants

| Argument | Action |
|----------|--------|
| (empty) / `all` / `prove` | Tests + typecheck + health (sequential, fail-fast) |
| `labs` | Find `*-arena.test.ts` files, run only those. This is an optional naming convention — projects can adopt it to isolate experimental/integration tests from the main suite |
| `typecheck` | TypeScript check only |
| `health` | Check project health endpoints. Auto-detects Oracle (`/health`, `/api/ai-status`) when online. Accepts custom URL: `health http://localhost:3000/api/health`. Without arguments or Oracle, skips silently |
| `file <path>` | Grep for test files referencing basename, run matches |
| `pre-commit` | Reads `.husky/pre-commit` (or equivalent hook script) to discover the actual validation pipeline, then re-runs those same checks. Use for dry-run before committing. If no hook file is found, falls back to: validate.sh + lint:md + typecheck + tests |

## Execution

1. **Detect** — setup detection per SKILL.md
2. **Run** — execute scope variant sequentially
3. **Report** — `[+]`/`[-]` per check with counts
4. **Trend** (Oracle online) — `POST /api/arena/ingest`, then `GET /api/arena/trends`. Classify: stable (delta -10..+5), improving (>+5), regression (<-10 — flag with `[!]`), first-run.
5. **On failure** — read failing test + source, analyze root cause, propose fix, ask before applying

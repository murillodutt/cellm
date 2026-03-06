---
description: Audit the DSE for quality, coverage, and alignment with the codebase. Use when reviewing design system completeness or checking if UI code follows DSE decisions.
user-invocable: true
---

# DSE Audit

Review the design system for decision quality, coverage gaps, and code alignment.

## Workflow

1. **Load** — `dse_search("*")` with each type filter to enumerate all entities
2. **Coverage** — check which entity types have decisions[] vs empty
3. **Quality** — verify decisions are actionable, specific, and non-generic
4. **Alignment** — sample .vue files and check if they follow DSE decisions
5. **Report** — output findings table with severity

## Checks

| Check | Method | Pass Criteria |
|-------|--------|---------------|
| Decision coverage | Count entities with empty decisions[] | Zero empty decisions |
| ATOM format | Verify intent readable without parenthetical | Each decision expresses intent, not just implementation |
| Vocabulary | Grep decisions for raw Tailwind (text-gray-*, bg-gray-*) | Zero raw Tailwind in decisions — use semantic (text-dimmed, bg-muted) |
| L2 purity | Check decisions don't duplicate framework docs | No "UButton accepts variant prop" style L1 content |
| Token completeness | Check semantic colors defined | All 6 core colors present |
| Code alignment | Grep .vue files for hardcoded colors | Zero hardcoded hex in components |
| Avoid compliance | Check .vue files against avoid rules | No violations found |

## Output Format

```
DSE Audit Report — {project}
| Finding | Severity | Count |
|---------|----------|-------|
| Entities without decisions | medium | 12/49 |
| Hardcoded hex colors in .vue | high | 3 files |
| Missing semantic tokens | low | 0 |
```

## NEVER

- **NEVER modify `.vue` files** — this is a read-only audit, do not "fix" alignment issues automatically.
- **NEVER alter DSE decisions** — report gaps, but do not hallucinate or ingest new decisions during an audit.
- **NEVER skip the structured table output** — always present findings in the exact format requested.

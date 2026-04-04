---
description: "Inject relevant CELLM patterns into the current context. Analyzes work context to suggest matching patterns from cellm-core/patterns/, or directly injects specified pattern files. Use when: 'inject patterns', 'what patterns apply here', 'load pattern X'."
user-invocable: true
argument-hint: "[pattern-path...]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, Read, Grep, Glob, AskUserQuestion
---

Inject relevant patterns using SCE recommendations or explicit paths.

## Intent

- Suggest useful patterns for the current task.
- Keep injection contextual and concise.

## Policy

- Auto-suggest mode must start with `context_preflight`.
- Explicit mode must validate path existence before injection.
- SCE decides ranking; this skill only presents/loads.

## Routing

1. No arguments: run `context_preflight` and surface top `validated_path`, `avoid`, and `dse_atoms`.
2. With arguments: validate provided pattern paths and inject selected files.
3. Offer related skills as suggestions only (no auto-execution).

## NEVER

- **Overwhelm** — max 5 patterns per injection
- **Auto-invoke skills** — surface, don't execute
- **Skip scenario detection** — format depends on context
- **Skip SCE preflight** — auto-suggest mode must start with `context_preflight`

---
description: "Operational surface for the compress-llm Layer-1 token I/O compressor. Enable, disable, switch mode, and inspect status without editing config files. Use when tuning compression pressure for the current session or project."
cellm_scope: universal
user-invocable: true
argument-hint: "[enable|disable|mode <off|lite|full|ultra|wenyan-lite|wenyan|wenyan-full|wenyan-ultra>|status]"
---

# compress-llm

Operational skill for the Layer-1 LLM-driven compression stage defined
by ADR-004 and ported in Phases 1–3. Wraps `SettingsManager` writes so
developers never touch raw config files.

## Intent

- Toggle the Layer-1 compressor on/off at runtime (per-process ENV or
  persistent DB).
- Switch among the 8 user-facing modes without leaking internal modes.
- Report the current effective flag + mode + bypass state in one place.
- Guarantee fail-safe: the skill NEVER breaks the pipeline; a write
  failure returns an error payload without touching the compressor.

## Policy

- Flag persistence: `SettingsManager.set('CELLM_COMPRESS_LLM_ENABLED', …)`
  — never writes raw files, never bypasses precedence (ENV > DB > default).
- Mode whitelist (user-facing only): `off | lite | full | ultra |
  wenyan-lite | wenyan | wenyan-full | wenyan-ultra`. Any other string
  is rejected at `parseValue`.
- Internal modes (`commit | review | compress`) are programmatic and
  MUST NOT be settable via this skill — they flow through the
  dispatcher, not the UI surface.
- Prose override (`cellm:prose`) wins over this skill at runtime: when
  the prose flag is active with level minimal/full, the interceptor
  returns early regardless of this skill's flag state.
- RNF-03 invariant preserved: any error path returns the original text
  unchanged in the pipeline — the skill only surfaces errors to the
  human operator.

## Routing

| Command | Backend action |
|---------|-----------------|
| `/cellm:compress-llm status` | `GET /api/ui-settings` + read runtime flag |
| `/cellm:compress-llm enable` | `SettingsManager.set('CELLM_COMPRESS_LLM_ENABLED', true)` |
| `/cellm:compress-llm disable` | `SettingsManager.set('CELLM_COMPRESS_LLM_ENABLED', false)` |
| `/cellm:compress-llm mode <X>` | Validate `X` ∈ SELECTABLE_MODES, then `set('CELLM_COMPRESS_LLM_MODE', X)` |
| `/cellm:compress-llm off` | Alias for `disable` |

Status output shape:

```
{
  enabled: boolean,
  mode: SelectableCompressMode,
  source: 'env' | 'db' | 'default',
  prose: { active: boolean, level: 'off'|'minimal'|'full', synced: boolean }
}
```

## State contract

- ENV override: `CELLM_COMPRESS_LLM_ENABLED` / `CELLM_COMPRESS_LLM_MODE`
  — session-scoped, highest precedence.
- DB persistence: SettingsManager keys of the same name — survives
  restart.
- Default: OFF / `full` (per ADR-004, until Phase 5 flips the default).

## NEVER

- Expose internal modes (`commit`, `review`, `compress`) in any prompt,
  command completion, or CLI hint. They exist for the dispatcher only.
- Flip the global default to ON — that decision belongs to Phase 5
  after A/B gate certification.
- Edit `~/.cellm/settings.json` directly — always route through
  `SettingsManager.set()` so DB cache + change-listeners stay consistent.
- Ignore the prose override when reporting status — users need to see
  why compression is bypassed when the prose flag is active.
- Cross the AIProvider interface — the skill talks to settings, not to
  Claude/Ollama directly.

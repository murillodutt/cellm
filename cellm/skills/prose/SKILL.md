---
description: "Prose override — temporarily disable quantization and respond in readable prose. Use when relational density matters, for safety-critical explanations, onboarding handoffs, or when token economy is not the priority."
cellm_scope: universal
user-invocable: true
argument-hint: "[on|off|level <off|minimal|full>|status] [N turns|block|session]"
---

# Prose

Cross-skill override flag that tells any quantization-aware skill to
respond in readable prose instead of its default compressed mode.

## Intent

- Let the developer opt-out of compress-llm Layer-1 compression without
  flipping the global feature flag.
- Provide a deterministic, filesystem-backed, multilingual trigger.
- Preserve the aggregate token-efficiency guarantee: when the flag is
  off or expired, default quantization resumes automatically.

## Policy

- Levels: `off` (no override), `minimal` (lowest compression pressure),
  `full` (normal prose).
- TTL units: `turn` (expire on next response), `block` (default, expires
  on commit/push/explicit), `session` (until process exit), `explicit`
  (never auto-expire; requires manual clear).
- Filesystem is the runtime source of truth: `~/.cellm/prose/.active`.
- Database mirror via SettingsManager keys
  (`CELLM_PROSE_ACTIVE`, `CELLM_PROSE_LEVEL`, `CELLM_PROSE_EXPIRES_AT`)
  is read-only from the skill's perspective — drift-detection belongs to
  the `/api/prose/status` endpoint.
- Flag writes MUST go through the `safeWriteFlag`-equivalent contract
  (symlink refusal, atomic temp + rename, 0600 permissions, 1024B cap).

## Routing

| Command | Action |
|---------|--------|
| `/cellm:prose` | Activate default level + default TTL |
| `/cellm:prose on` | Same as above |
| `/cellm:prose on N turns` | Activate with turn-TTL expiring after N turns |
| `/cellm:prose on block` | Activate until current work block closes |
| `/cellm:prose on session` | Activate until process exits |
| `/cellm:prose off` | Clear the flag, resume default quantization |
| `/cellm:prose level off\|minimal\|full` | Change level, keep current TTL |
| `/cellm:prose status` | Read fs flag and report active level, TTL, expires |

All commands delegate to the backend:

- Activation / deactivation / level change → `POST /api/prose/toggle`
- Status → `GET /api/prose/status`

## State contract

```
~/.cellm/prose/.active        # Runtime source of truth (fs flag, 0600)
~/.cellm/prose/config.json    # Defaults: level, TTL, multilingual regex
oracle DB settings            # Mirror for drift detection + UI visibility
```

Flag JSON shape (validated on read):

```
{
  "level":       "off" | "minimal" | "full",
  "ttl":         { "unit": "turn"|"block"|"session"|"explicit", "value": number },
  "expiresAt":   number | null,
  "activatedAt": number,
  "source":      "manual" | "auto-clarity" | "config"
}
```

## Runtime consumer contract (for quantization-aware skills)

Any skill that emits compressed output MUST implement this check before
rendering:

1. Read `~/.cellm/prose/.active` (or call `readProseFlag()` in the
   interceptor pipeline).
2. If missing, malformed, expired, or a symlink → default quantization.
3. If present and valid → resolve level:
   - `off` → default quantization (no override).
   - `minimal` → lowest compression pressure.
   - `full` → normal prose.
4. If TTL unit is `turn`, the caller is responsible for clearing or
   decrementing the flag after emitting the response.

## Trigger surfaces

- Slash command: `/cellm:prose` (primary, contract-stable).
- Natural language multilingual regex (opt-in via config):
  `prose|prosa|plain|normal mode|modo normal|普通|普通模式`.
- Auto-Clarity inheritance (optional, source=`auto-clarity`): safety
  warnings, multi-step sequences, and ambiguity reduction may activate
  a short-TTL override.

## NEVER

- Render raw flag content to the terminal without sanitization.
- Write the flag through unchecked `fs.writeFile` — always use
  `writeProseFlag()` (symlink-safe + atomic + 0600).
- Widen the level whitelist beyond `off | minimal | full` without an
  ADR amendment.
- Persist multi-KB payloads — the 1024B cap protects against prompt
  injection through the flag surface.
- Leak credentials via the `source` field — it is a narrow enum, not
  a free-form string.

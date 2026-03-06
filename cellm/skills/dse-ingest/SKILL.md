---
description: Ingest design decisions into the DSE from conversation context. Use when the user describes project-specific design choices, color palettes, component patterns, or UI constraints that should persist as DSE decisions.
user-invocable: true
---

# DSE Ingest

Extract design decisions from conversation and persist them in the DSE.

## Workflow

1. **Identify** — scan conversation for design decisions (colors, spacing, component choices, layout patterns, avoid rules)
2. **Classify** — map each decision to DSE entity type (token, component, pattern, composition)
3. **Search existing** — `dse_search` to check if entity already exists
4. **Update or create** — use `POST /api/design-system/update` to patch the active preset with new decisions[]
5. **Verify** — `dse_search` again to confirm decisions are indexed

## Decision Types

| Type | Example Decision (ATOM format) |
|------|-------------------------------|
| Token | "Brand-aligned primary — warm identity (currently indigo in app.config)" |
| Component | "Subtle status badges — soft for scannability (currently soft variant in app.config)" |
| Pattern | "Immediate field feedback — no submit-time surprises (currently inline Zod validation)" |
| Composition | "Fluid responsive cards — adapt to content, not breakpoints (currently flex flex-wrap)" |

## ATOM Format (mandatory)

Each decision follows the intent + snapshot pattern:

```
"[INTENT — why/what] (currently [IMPLEMENTATION — how])"
```

Rules:
- Intent survives major version changes — it describes WHAT and WHY, never just HOW
- Snapshot in parenthetical is the current implementation — replaceable
- ATOM test: remove the parenthetical — does the sentence still guide design? If not, rewrite
- L2 only: never duplicate framework documentation (e.g., "UButton accepts variant prop")
- Use Nuxt UI v4 semantic vocabulary in snapshots: `text-dimmed`, `bg-muted`, `border-default` — never raw Tailwind (`text-gray-400`)

## Examples

```
"Achromatic primary — data readability over brand expression (currently 'neutral' in app.config)"
"Brand glow on hover — signature interaction (currently ring-1 ring-[var(--cellm-orange)]/30)"
"All badges monospace for data alignment (currently font-mono)"
"NEVER dark: on Nuxt UI components — color-mode is automatic"
```

| Bad (instruction) | Good (intent + snapshot) |
|---|---|
| "variant='ghost' color='neutral'" | "Subtle, non-competing actions (currently ghost/neutral)" |
| "Use indigo-500 as primary" | "Brand-aligned primary (currently indigo in app.config)" |
| "3-column grid on desktop" | "Fluid responsive, no rigid grid (currently flex flex-wrap)" |

## Array merge behavior

`POST /api/design-system/update` does deep-merge. For `decisions[]` arrays, this APPENDS new entries. Before ingesting, `dse_search` the entity and check existing decisions to avoid duplicates.

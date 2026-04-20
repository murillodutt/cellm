# Tilly Skill Layout

This skill uses a structured layout to keep operational logic, documentation,
and tests separated.

## Directory Structure

```text
skills/tilly/
├── SKILL.md
├── README.md
├── docs/
│   ├── CELLM-PERSONA.md
│   ├── CELLM-PARTNERSHIP-LETTER.md
│   └── CELLM-PERSONA-VALIDATION.md
├── scripts/
│   └── inject-persona.sh
└── tests/
    └── inject-persona.test.ts
```

## Ownership

- `SKILL.md`: behavioral contract, routing, guardrails, artifact references.
- `docs/`: long-form persona and relationship context; validation protocol.
- `scripts/`: runtime hook logic used by SessionStart.
- `tests/`: executable verification for hook behavior and graceful fallback paths.

## Conventions

- Keep only `SKILL.md` and `README.md` at skill root.
- Do not place executable scripts in the root.
- Do not move docs used by hook scripts without updating paths in:
  - `cellm/scripts/inject-persona.sh`
  - `skills/tilly/scripts/inject-persona.sh`
  - `skills/tilly/tests/inject-persona.test.ts`

## Validation Commands

```bash
bun test cellm-plugin/cellm/skills/tilly/tests/inject-persona.test.ts
bash cellm-plugin/cellm/scripts/inject-persona.sh
```

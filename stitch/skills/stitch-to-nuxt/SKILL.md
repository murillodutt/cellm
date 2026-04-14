---
description: "Translate Stitch design tokens to Nuxt UI theme contracts with SCE gating. Use when: 'stitch to nuxt', 'convert tokens', 'generate theme'."
cellm_scope: universal
user-invocable: true
argument-hint: "[path to DESIGN.md or .stitch/ directory]"
allowed-tools: Read, Edit, Glob, AskUserQuestion, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify
---

# stitch-to-nuxt

Thin skill contract:

1. Intent
- Convert Stitch color/typography/radius tokens into Nuxt runtime theme artifacts.

2. Policy
- Use preflight to bind token scope and file targets.
- Keep semantic token mapping as canonical output contract.
- Certify translation quality and persist conversion outcome.

3. Routing
- Token extraction: delegates to `@cellm-ai/stitch-bridge/parsers` (`parseDesignMd` + `extractFromStitchHtml`) for deterministic parsing.
- Token mapping: uses `@cellm-ai/stitch-bridge/class-map` for semantic resolution.
- File writes to theme/config: implementation route.
- Policy and telemetry: SCE `context_*`.

## NEVER

- Hardcode raw colors in runtime components.
- Apply transformations without diff preview and certification.

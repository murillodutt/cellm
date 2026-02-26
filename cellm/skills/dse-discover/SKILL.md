---
description: Scan a project to extract design system signals and bootstrap its DSE. Detects framework, colors, typography, and components, then applies a preset, imports palette, and indexes chunks.
argument-hint: "[project-path]"
allowed-tools: Bash(curl *), Read, Grep, Glob, AskUserQuestion
---

Bootstrap DSE for a project. Argument or cwd as project root.

## Pipeline

1. **Scan** — `dse_discover({ projectRoot, project })` → show summary table (framework, UI library, archetype, colors, components, typography, suggested preset).
2. **Preset** — Confirm via AskUserQuestion → `POST /api/design-system/presets`.
3. **Colors** — Hex colors detected? → `dse_import_palette({ input, project })`. Named colors only → report as hints, skip import.
4. **Reindex** — `dse_reindex({ project })`.
5. **Confirm** — Report: preset applied, colors imported, chunks indexed.

## NEVER

- **Apply without confirmation** — always show scan results first
- **Guess colors** — only import what was actually detected
- **Skip empty projects** — still apply minimal preset if no signals found

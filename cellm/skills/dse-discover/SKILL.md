---
name: dse-discover
description: Scan a project to extract design system signals and bootstrap its DSE. Detects framework, colors, typography, and components, then applies a preset, imports palette, and indexes chunks.
argument-hint: "[project-path]"
---

# DSE Discover

Bootstrap a Design System for a project that has none.

## Input

`$ARGUMENTS` is the absolute path to the project root (e.g. `~/Dev/agenda-adb`).
If omitted, use the current working directory.

## Workflow

Execute these steps in order:

### Step 1: Scan

Call the MCP tool `dse_discover` with the project path:

```
dse_discover({ projectRoot: "<path>", project: "<project-name>" })
```

Report the results to the user in a summary table:

| Signal | Value |
|--------|-------|
| Framework | (detected or "none") |
| UI Library | (detected or "none") |
| Archetype | (hint) |
| Colors from config | (count) |
| Colors from CSS | (count) |
| Colors from Tailwind | (count) |
| UI Components | (list up to 5) |
| Typography | (font families) |
| Suggested Preset | (preset name) |

### Step 2: Apply Preset

Ask the user to confirm the suggested preset, then apply it:

```
POST /api/design-system/presets
Body: { preset: "<suggestedPreset>", project: "<project-name>" }
```

### Step 3: Import Colors

If hex colors were detected (fromCss, fromTailwind, or fromConfig with hex values), import them:

```
dse_import_palette({ input: "<hex colors space-separated>", project: "<project-name>" })
```

If only named colors were found (e.g. primary: "green"), report them as hints but skip import.

### Step 4: Reindex

```
dse_reindex({ project: "<project-name>" })
```

### Step 5: Confirm

Report final status: preset applied, colors imported, chunks indexed.

## Rules

1. Always show scan results before applying changes
2. Ask user confirmation before applying preset
3. If scan finds no signals, still apply the minimal preset
4. Do not guess colors — only import what was actually detected

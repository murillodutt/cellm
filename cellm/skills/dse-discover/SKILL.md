---
description: "Scan a project to extract design system signals and bootstrap its CELLM DSE. Detects framework, colors, typography, and components. Accepts project directories, Figma HTML exports, W3C DTCG .tokens.json, Figma MCP output, and palette URLs. Use when: 'discover design system', 'bootstrap DSE', 'scan project for tokens'."
cellm_scope: universal
user-invocable: true
argument-hint: "[project-path or file-path or URL]"
allowed-tools: Bash(curl *), Read, Grep, Glob, AskUserQuestion
---

Universal design token extractor. Auto-detect input type and bootstrap DSE.

## Input Auto-Detection

| Input | Source | Example |
|-------|--------|---------|
| `.html` file path | `html` | `/path/to/figma-export.html` |
| `.tokens` / `.tokens.json` file | `dtcg` | `/path/to/tokens.json` |
| `figma.com` URL | `figma` | `figma.com/design/abc/...` |
| `coolors.co` / `colorhunt.co` URL | `palette` | `coolors.co/264653-2a9d8f-e9c46a` |
| Directory path | `directory` | `/path/to/my-app` |

## Pipeline

1. **Detect source** — Match input against table above. Default: `directory`.
2. **Scan** — Call `dse_discover({ source, ... })` with appropriate params → show summary table.
3. **Check active preset** — Call `dse_get` or Read `~/.cellm/dse/dse-{project}.json`. If it exists AND has decisions[], warn the user:
   - Show: version, entity count, decisions count of the ACTIVE preset
   - AskUserQuestion: **"Overwrite"** (full replace via `POST /api/design-system/presets`) or **"Merge"** (deep-merge via `POST /api/design-system/update` with scan results as patch)
   - If no active preset exists → proceed with Overwrite (safe, nothing to lose)
4. **Apply** — Based on user choice: `presets` (overwrite) or `update` (merge).
5. **Colors** — Hex colors detected? → `dse_import_palette({ input, project })`. Named colors only → report as hints.
6. **Reindex** — `dse_reindex({ project })`.
7. **Confirm** — Report: preset applied/merged, colors imported, chunks indexed.

## Source-Specific Calls

**directory** (original):
```
dse_discover({ source: "directory", projectRoot: "/path/to/project", project: "my-app" })
```

**html** (Figma HTML export):
```
dse_discover({ source: "html", filePath: "/path/to/figma-export.html", project: "my-app" })
```
Returns: semanticColors, shades, radius, fonts, aliases, hardcodedHex hints.

**dtcg** (W3C DTCG .tokens.json — Tokens Studio, Style Dictionary v4):
```
dse_discover({ source: "dtcg", filePath: "/path/to/tokens.json", project: "my-app" })
```
Returns: colors, semanticColors, dimensions, fontFamilies, aliases, dtcgTokenCount.

**figma** (Figma MCP output — orchestrated by this skill):
```
1. get_variable_defs({ fileKey, nodeId })  → variableResult
2. get_design_context({ fileKey, nodeId }) → designResult
3. dse_discover({ source: "figma", figmaResult: { variables: variableResult.variables }, project: "my-app" })
```

**palette** (Coolors, Colorhunt, raw hex):
```
dse_discover({ source: "palette", input: "coolors.co/264653-2a9d8f-e9c46a", project: "my-app" })
```

## Figma Flow

When user provides a `figma.com` URL:
1. Extract `fileKey` and `nodeId` from URL
2. Call `get_variable_defs({ fileKey, nodeId })` for design tokens
3. Call `get_design_context({ fileKey, nodeId })` for component context
4. Merge results and pass to `dse_discover({ source: "figma", figmaResult: merged })`
5. Continue with standard pipeline (preset, palette, reindex)

## NEVER

- **Apply without confirmation** — always show scan results first
- **Overwrite without warning** — if active preset has decisions[], ALWAYS show count and ask Overwrite vs Merge
- **Guess colors** — only import what was actually detected
- **Skip empty projects** — still apply minimal preset if no signals found
- **Call Figma MCP from the endpoint** — orchestrate in this skill, pass result to endpoint

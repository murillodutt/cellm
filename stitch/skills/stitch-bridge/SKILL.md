---
description: "Orchestrator skill for Google Stitch design bridge. Analyzes .stitch/ artifacts, detects gaps, composes prompts, invokes Stitch MCP, consumes generated assets, and syncs with DSE/GDU pipeline. Use when: 'analyze stitch', 'stitch bridge', 'invoke stitch', 'consume stitch', 'sync stitch'."
user-invocable: true
argument-hint: "[analyze|compose-prompt|invoke|consume|sync]"
allowed-tools: Read, Grep, Glob, Bash(curl *), AskUserQuestion
---

Stitch-CELLM bridge orchestrator. Routes to 5 subcommands that form the design-to-code pipeline.

## Subcommands

| Subcommand | Purpose | Inputs | Outputs |
|------------|---------|--------|---------|
| `analyze` | Parse .stitch/ artifacts, detect gaps | `.stitch/DESIGN.md`, `.stitch/metadata.json`, `.stitch/SITE.md` | Gap report (missing screens, undefined tokens, absent icons) |
| `compose-prompt` | Build optimized Stitch prompt from gap context | Gap type, DESIGN.md context, SITE.md context | Prompt string following Stitch Effective Prompting Guide |
| `invoke` | Call Stitch MCP to generate or edit screens | Prompt, projectId, deviceType | New screenId, confirmation of generation |
| `consume` | Fetch generated assets into .stitch/designs/ | projectId, screenId(s) | HTML + PNG files in `.stitch/designs/`, updated `metadata.json` |
| `sync` | Trigger downstream CELLM pipeline | `.stitch/` artifacts | DSE preset updated, tokens indexed, GDU directives emitted |

## Subcommand Details

### analyze

1. **Read** `.stitch/metadata.json` — extract `projectId`, `screenIds`, `deviceTypes`.
2. **Read** `.stitch/DESIGN.md` — parse 5 canonical sections:
   - Core Identity — aesthetic philosophy
   - Color Foundation — descriptive names + hex + functional roles
   - Typography — family, weights, sizes, spacing
   - Components — buttons, cards, nav with exact values
   - Layout — max-width, grid, breakpoints, spacing
3. **Read** `.stitch/SITE.md` — extract sitemap, planned pages, vision.
4. **Glob** `.stitch/designs/*.html` — inventory existing screen files.
5. **Cross-reference**: compare SITE.md pages vs designs/ files vs metadata.json screenIds.
6. **Report**: table of gaps (missing screens, undefined tokens, absent assets).

If `.stitch/` directory does not exist or is empty, report gracefully and suggest running `stitch:consume` first or manually placing Stitch exports.

### compose-prompt

1. **Input**: gap type from `analyze` output (missing-screen, missing-token, missing-icon).
2. **Read** `.stitch/DESIGN.md` for design context (palette, typography, component style).
3. **Build prompt** following Stitch Effective Prompting Guide:
   - Include design system context (colors, fonts, radius from DESIGN.md)
   - Specify device type from metadata.json
   - Reference existing screens for consistency
   - Be specific about layout, content, and interactions
4. **Output**: prompt string ready for `invoke` subcommand.
5. **AskUserQuestion**: show composed prompt, ask for approval or edits before proceeding.

### invoke

Calls Stitch MCP tools to generate or edit screens.

1. **AskUserQuestion**: confirm the operation — show prompt, projectId, estimated cost/time.
2. **Determine tool**:
   - New screen: `generate_screen_from_text({ projectId, prompt, deviceType, modelId })`
   - Enhance prompt first: `enhance_prompt({ prompt })` then generate
3. **Execute**: call the selected Stitch MCP tool.
4. **Wait**: generation takes 1-2 minutes. Do NOT retry if slow.
5. **Report**: return new screenId and status.

Known bug: `list_screens` returns empty after `generate_screen_from_text` until the project is opened in the browser. After invoking, inform the user they may need to open the Stitch project in the browser before `consume` can fetch the new screen.

### consume

Fetches generated assets from Stitch into the local `.stitch/` directory.

1. **Read** `.stitch/metadata.json` for projectId.
2. **Call** `list_screens({ projectId })` or use known screenId from `invoke`.
3. **For each screen**:
   - `fetch_screen_code({ projectId, screenId })` — save as `.stitch/designs/{screenName}.html`
   - `fetch_screen_image({ projectId, screenId })` — save as `.stitch/designs/{screenName}.png`
4. **Update** `.stitch/metadata.json` with new screenIds and timestamps.
5. **Extract** design context: `extract_design_context({ projectId })` — update `.stitch/DESIGN.md` if changed.
6. **Report**: files created/updated count.

### sync

Triggers the downstream CELLM pipeline after new artifacts are consumed.

1. **Invoke** `stitch:stitch-ingest` — DESIGN.md to DSE preset.
2. **Invoke** `stitch:stitch-to-nuxt` — DESIGN.md tokens to main.css + app.config.ts.
3. **For each new HTML** in `.stitch/designs/`:
   - **Invoke** `stitch:html-to-vue` — HTML to Vue SFC with semantic tokens.
4. **Report**: DSE decisions count, CSS variables generated, Vue components created.

If any downstream skill is not available, report which step was skipped and continue with the rest.

## Graceful Degradation

| Condition | Behavior |
|-----------|----------|
| `.stitch/` directory missing | Report absence, suggest manual export or `consume` first |
| Stitch MCP not configured | Skip `invoke`/`consume`, work with local `.stitch/` files only |
| `DESIGN.md` missing | `analyze` runs on metadata.json + SITE.md only, report DESIGN.md gap |
| `metadata.json` missing | `analyze` runs on DESIGN.md + SITE.md only, cannot fetch from Stitch |
| `SITE.md` missing | `analyze` runs without sitemap context, no gap detection for missing pages |
| Downstream skill unavailable | `sync` skips that step, reports which skills were skipped |
| Stitch API timeout | Report timeout, do NOT auto-retry, suggest user check Stitch dashboard |

## Stitch MCP Tools Reference

| Tool | Use |
|------|-----|
| `generate_screen_from_text` | Create new screen from prompt |
| `fetch_screen_code` | Download screen HTML |
| `fetch_screen_image` | Download screen screenshot |
| `enhance_prompt` | Improve prompt before generation |
| `extract_design_context` | Get design system from project |
| `list_projects` | List accessible Stitch projects |
| `list_screens` | List screens in a project |
| `get_screen` | Get single screen details |
| `create_project` | Create new Stitch project |

## NEVER

- **Retry `generate_screen_from_text`** — generation takes 1-2 min; retrying wastes quota and creates duplicates
- **Overwrite `.stitch/metadata.json` without backup** — always read existing, merge new screenIds, preserve history
- **Invoke Stitch MCP without user confirmation** — every `invoke` call must be approved via AskUserQuestion first
- **Auto-invoke cost-incurring operations** — `generate_screen_from_text` requires explicit confirmation
- **Skip gap analysis** — always run `analyze` before `compose-prompt` to ensure prompts address real gaps
- **Assume `list_screens` is current after generation** — known bug: may return empty until project opened in browser

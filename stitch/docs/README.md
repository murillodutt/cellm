# Stitch - CELLM Plugin

The **Stitch** plugin bridges [Google Stitch](https://stitch.withgoogle.com/) visual design tools with the CELLM ecosystem. It consumes Stitch artifacts (DESIGN.md, HTML screens, SITE.md) and feeds them into the DSE, GDU Director, and orchestration workflows.

## Overview

Stitch generates production-quality UI screens from text prompts. This plugin creates a bidirectional bridge:

- **Consume-first**: Read `.stitch/` artifacts offline -- no API needed for analysis
- **Produce-second**: Invoke Stitch MCP with explicit user confirmation for generation

The plugin follows CELLM's isolation pattern: self-contained with graceful degradation at every step.

## Prerequisites

- CELLM Oracle Worker running (`cellm:status` to verify)
- Google Stitch account (for MCP features)
- Stitch MCP connector active in Claude Code

## Setup

### Native MCP (Recommended)

The Stitch MCP is connected as a **native connector** via Claude Code. No local proxy, API keys, or shell scripts required.

1. Open Claude Code MCP settings
2. Enable the **Google Stitch** connector
3. Authenticate via your Google account when prompted
4. Verify with `mcp__stitch__list_projects` -- should return your Stitch projects

### Verify

After setup, run the bridge analyzer to confirm everything works:

```
stitch:bridge analyze
```

This reads local `.stitch/` artifacts and optionally fetches remote project data via native MCP. If `.stitch/` does not exist, it reports the absence and suggests bootstrapping steps.

## Skills Reference

| Skill | Purpose | Requires MCP |
|-------|---------|:------------:|
| `stitch:bridge` | Orchestrator with 5 subcommands: analyze, compose-prompt, invoke, consume, sync | Partial |
| `stitch:prompt` | Compose optimized Stitch prompts from DESIGN.md context | No |
| `stitch:html-to-vue` | Convert Stitch HTML to Vue 3 SFCs with Nuxt UI semantic tokens | Optional |
| `stitch:ingest` | Parse DESIGN.md into DSE-compatible atoms | No |
| `stitch:to-nuxt` | Convert Stitch tokens to Nuxt UI theme files (main.css, app.config.ts) | No |
| `stitch:loop` | Iterative site building with baton system (next-prompt.md + SITE.md) | Yes |

### Subcommand Detail (stitch:bridge)

| Subcommand | Purpose | MCP Tools Used |
|------------|---------|----------------|
| `analyze` | Parse `.stitch/` artifacts, detect gaps | `mcp__stitch__get_project`, `mcp__stitch__list_screens`, `mcp__stitch__get_screen` |
| `compose-prompt` | Build optimized Stitch prompt from gap context | None (local) |
| `invoke` | Generate or edit screens (requires user confirmation) | `mcp__stitch__generate_screen_from_text`, `mcp__stitch__edit_screens` |
| `consume` | Fetch generated assets (HTML + PNG) into `.stitch/designs/` | `mcp__stitch__get_screen` |
| `sync` | Trigger downstream CELLM pipeline (DSE ingest, token generation, HTML-to-Vue) | None (local) |

## Agents

| Agent | Role | Model | Tools |
|-------|------|-------|-------|
| `stitch-analyst` | Read-only design analyst. Parses DESIGN.md, HTML screens, and SITE.md to extract design tokens, component patterns, and layout structures. Can fetch remote data via native MCP. | Opus | Read-only (no Write, Edit, Bash) + `mcp__stitch__*` for remote reads |
| `stitch-translator` | Code translator. Converts DESIGN.md tokens to main.css @theme and app.config.ts, and converts Stitch HTML to Vue SFCs with semantic tokens. | Sonnet | Read, Write, Edit, Glob, Grep |

## Graceful Degradation

The plugin works progressively -- each missing piece reduces functionality but never causes failure:

| Condition | Behavior |
|-----------|----------|
| `.stitch/` directory missing | Reports absence, suggests manual export or `consume` first |
| `mcp__stitch__*` tools unavailable | Skips remote operations, works with local `.stitch/` files only |
| `DESIGN.md` missing | Analyzes metadata.json + SITE.md only, reports DESIGN.md gap |
| `metadata.json` missing | Analyzes DESIGN.md + SITE.md only, cannot fetch from Stitch |
| `SITE.md` missing | Analyzes without sitemap context, no gap detection for missing pages |
| Downstream skill unavailable | `sync` skips that step, reports which skills were skipped |
| Stitch API timeout | Reports timeout, does NOT auto-retry |

## `.stitch/` Directory Structure

```
.stitch/
  DESIGN.md          # Core design system (6 canonical sections)
  SITE.md            # Sitemap, planned pages, vision
  metadata.json      # projectId, screenIds, deviceTypes
  next-prompt.md     # Baton file for stitch:loop iterations
  designs/           # Generated assets
    screen-name.html # Screen HTML export
    screen-name.png  # Screen screenshot
```

### DESIGN.md Canonical Sections

1. **Visual Theme and Atmosphere** -- aesthetic philosophy
2. **Color Palette and Roles** -- descriptive names + hex + functional roles
3. **Typography Rules** -- family, weights, sizes, spacing
4. **Component Stylings** -- buttons, cards, nav with exact values
5. **Layout Principles** -- max-width, grid, breakpoints, spacing
6. **Design System Notes for Stitch Generation** -- copy-paste block for prompts

## References

- [Google Stitch](https://stitch.withgoogle.com/)
- [Stitch Effective Prompting Guide](https://stitch.withgoogle.com/docs/learn/prompting/)
- [Stitch Skills (Google Labs)](https://github.com/google-labs-code/stitch-skills)

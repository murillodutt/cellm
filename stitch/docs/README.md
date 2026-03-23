# Stitch - CELLM Plugin

The **Stitch** plugin bridges [Google Stitch](https://stitch.withgoogle.com/) visual design tools with the CELLM ecosystem. It consumes Stitch artifacts (DESIGN.md, HTML screens, SITE.md) and feeds them into the DSE, GDU Director, and orchestration workflows.

## Overview

Stitch generates production-quality UI screens from text prompts. This plugin creates a bidirectional bridge:

- **Consume-first**: Read `.stitch/` artifacts offline — no API needed for analysis
- **Produce-second**: Invoke Stitch MCP with explicit user confirmation for generation

The plugin follows CELLM's isolation pattern: self-contained with graceful degradation at every step.

## Prerequisites

- CELLM Oracle Worker running (`cellm:status` to verify)
- Google Stitch account (for MCP features)
- Node.js >= 20 or Bun >= 1.1

## Setup

### 1. API Key (Development)

Set the `STITCH_API_KEY` environment variable:

```bash
export STITCH_API_KEY="your-api-key"
```

### 2. OAuth via gcloud ADC (Production)

Use Google Application Default Credentials:

```bash
gcloud auth application-default login
```

### 3. Access Token (CI/CD)

Set the `STITCH_ACCESS_TOKEN` environment variable directly:

```bash
export STITCH_ACCESS_TOKEN="ya29...."
```

### 4. Add Stitch MCP Server

Run the Stitch MCP init wizard:

```bash
npx @_davideast/stitch-mcp init
```

Or add manually via Claude Code:

```bash
claude mcp add stitch-mcp npx @_davideast/stitch-mcp
```

## Verify

After setup, run the bridge analyzer to confirm everything works:

```
stitch:bridge analyze
```

This reads local `.stitch/` artifacts without calling the Stitch API. If `.stitch/` does not exist, it reports the absence and suggests bootstrapping steps.

## Skills Reference

The plugin provides the `stitch:bridge` orchestrator skill with 5 subcommands:

| Subcommand | Purpose | Requires MCP |
|------------|---------|:------------:|
| `analyze` | Parse `.stitch/` artifacts, detect gaps between DESIGN.md, SITE.md, and screens | No |
| `compose-prompt` | Build optimized Stitch prompt from gap context following the Effective Prompting Guide | No |
| `invoke` | Call Stitch MCP to generate or edit screens (requires user confirmation) | Yes |
| `consume` | Fetch generated assets (HTML + PNG) into `.stitch/designs/` | Yes |
| `sync` | Trigger downstream CELLM pipeline (DSE ingest, token generation, HTML-to-Vue) | No |

### Usage

```bash
# Analyze local artifacts
stitch:bridge analyze

# Compose a prompt for a missing screen
stitch:bridge compose-prompt

# Generate a screen via Stitch MCP (asks for confirmation)
stitch:bridge invoke

# Fetch generated assets locally
stitch:bridge consume

# Sync artifacts into DSE and GDU pipeline
stitch:bridge sync
```

## Agents

| Agent | Role | Model | Tools |
|-------|------|-------|-------|
| `stitch-analyst` | Read-only design analyst. Parses DESIGN.md, HTML screens, and SITE.md to extract design tokens, component patterns, and layout structures. Produces DSE ingestion atoms and enhancement prompts. | Opus | Read-only (no Write, Edit, Bash) |
| `stitch-translator` | Code translator. Converts DESIGN.md tokens to main.css @theme and app.config.ts, and converts Stitch HTML to Vue SFCs with semantic tokens. | Sonnet | Read, Write, Edit, Glob, Grep |

The analyst agent is invoked automatically by the `analyze` and `sync` subcommands when deep cross-referencing is needed. The translator agent handles all code generation tasks.

## Graceful Degradation

The plugin works progressively — each missing piece reduces functionality but never causes failure:

| Condition | Behavior |
|-----------|----------|
| `.stitch/` directory missing | Reports absence, suggests manual export or `consume` first |
| Stitch MCP not configured | Skips `invoke`/`consume`, works with local `.stitch/` files only |
| `DESIGN.md` missing | Analyzes metadata.json + SITE.md only, reports DESIGN.md gap |
| `metadata.json` missing | Analyzes DESIGN.md + SITE.md only, cannot fetch from Stitch |
| `SITE.md` missing | Analyzes without sitemap context, no gap detection for missing pages |
| Downstream skill unavailable | `sync` skips that step, reports which skills were skipped |
| Stitch API timeout | Reports timeout, does NOT auto-retry |

## Known Bugs

- **`list_screens` returns empty after `generate_screen_from_text`**: After generating a screen, the Stitch API may return an empty screen list until the project is opened in the browser. **Workaround**: Open the Stitch project in your browser, then re-run `stitch:bridge consume`.

## `.stitch/` Directory Structure

```
.stitch/
  DESIGN.md          # Core design system (5 canonical sections)
  SITE.md            # Sitemap, planned pages, vision
  metadata.json      # projectId, screenIds, deviceTypes
  designs/           # Generated assets
    screen-name.html # Screen HTML export
    screen-name.png  # Screen screenshot
```

### DESIGN.md Canonical Sections

1. **Core Identity** — aesthetic philosophy
2. **Color Foundation** — descriptive names + hex + functional roles
3. **Typography** — family, weights, sizes, spacing
4. **Components** — buttons, cards, nav with exact values
5. **Layout** — max-width, grid, breakpoints, spacing

## References

- [Google Stitch](https://stitch.withgoogle.com/)
- [Stitch MCP Server](https://github.com/nichochar/stitch-mcp)
- [Stitch SDK Documentation](https://stitch.withgoogle.com/docs)

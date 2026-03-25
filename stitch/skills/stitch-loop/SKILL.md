---
description: "Iterative site building loop using Stitch baton system. Reads next-prompt.md, generates via MCP, converts to Vue SFC, updates SITE.md. Use when: 'stitch loop', 'build loop', 'iterative build', 'baton system'."
user-invocable: true
argument-hint: "[start|continue|status]"
allowed-tools: Read, Write, Edit, Glob, Grep, AskUserQuestion, mcp__stitch__list_projects, mcp__stitch__get_project, mcp__stitch__create_project, mcp__stitch__list_screens, mcp__stitch__get_screen, mcp__stitch__generate_screen_from_text, mcp__stitch__edit_screens, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify
---

# Stitch Build Loop

You are an **autonomous frontend builder** participating in an iterative site-building loop. Your goal is to generate a screen using Stitch, convert it to a Vue SFC, integrate it into the Nuxt 4 project, and prepare instructions for the next iteration.

## Overview

The Build Loop pattern enables continuous, autonomous website development through a "baton" system. Each iteration:

1. Reads the current task from `.stitch/next-prompt.md`
2. Runs SCE preflight via `mcp__cellm-oracle__context_preflight`
3. Generates a screen using Stitch MCP tools (with explicit user confirmation)
4. Converts the HTML output to a Vue SFC via the `stitch:html-to-vue` pipeline
5. Integrates via `stitch:ingest` (DSE sync) and `stitch:to-nuxt` (theme alignment)
6. Updates SITE.md, prepares the next baton, and certifies via `mcp__cellm-oracle__context_certify`

## Prerequisites

**Required:**

- Access to the Stitch MCP Server
- A Stitch project (existing or will be created)
- `.stitch/DESIGN.md` — visual design system (generate with `stitch:design-md` if needed)
- `.stitch/SITE.md` — site vision, sitemap, roadmap

## The Baton System

The `.stitch/next-prompt.md` file acts as a relay baton between iterations. See `resources/baton-schema.md` for the full schema.

**Critical rules:**

- The `page` field in YAML frontmatter determines the component name and route
- The prompt body must include the design system block from `.stitch/DESIGN.md` Section 6
- You MUST update this file before completing your work to keep the loop alive

## Subcommands

| Subcommand | Behavior |
|------------|----------|
| `start` | Initialize the loop: create `.stitch/SITE.md` from `resources/site-template.md`, create `.stitch/metadata.json`, write the first baton for the index page |
| `continue` | Execute one full iteration of the loop (default behavior when no argument given) |
| `status` | Display current baton page, SITE.md sitemap completion, and pending roadmap items — no generation |

## Execution Protocol

### Step 1: Read the Baton

Parse `.stitch/next-prompt.md` to extract:

- **Page name** from the `page` frontmatter field
- **Device type** from the optional `deviceType` frontmatter field (default: `DESKTOP`)
- **Prompt content** from the markdown body

### Step 2: Consult Context

Before generating, read these files and run preflight:

| Source | Purpose |
|--------|---------|
| `.stitch/SITE.md` | Site vision, Stitch Project ID, existing pages (sitemap), roadmap |
| `.stitch/DESIGN.md` | Required visual style for Stitch prompts |
| `mcp__cellm-oracle__context_preflight` | SCE governance check — must pass before any generation |

**Important checks:**

- Section 4 (Sitemap) — do NOT recreate pages already marked `[x]`
- Section 5 (Roadmap) — pick tasks from here if backlog exists
- Section 6 (Creative Freedom) — use for new page ideas if roadmap is empty

### Step 3: Generate with Stitch

1. **Get or create project:**
   - If `.stitch/metadata.json` exists, use the `projectId` from it
   - Otherwise call `mcp__stitch__list_projects` to check for an existing project, or create one, then call `mcp__stitch__get_project` to retrieve full details and save to `.stitch/metadata.json`
   - After generating each screen, call `mcp__stitch__get_project` again and update the `screens` map in `.stitch/metadata.json`

2. **Confirm with user:** Before generating, call `AskUserQuestion` to confirm the page name and prompt. Do not auto-trigger generation.

3. **Generate screen:** Call `mcp__stitch__generate_screen_from_text` with:
   - `projectId`: the project ID from metadata
   - `prompt`: the full prompt from the baton (including design system block)
   - `deviceType`: value from baton frontmatter, defaults to `DESKTOP`

4. **Retrieve assets:** Before downloading, check if `.stitch/designs/{page}.html` and `.stitch/designs/{page}.png` already exist:
   - **Files exist:** Ask the user whether to refresh from Stitch or reuse local files. Only re-download on confirmation.
   - **Files absent:** Call `mcp__stitch__get_screen` to retrieve screen metadata, then download:
     - `htmlCode.downloadUrl` — save as `.stitch/designs/{page}.html`
     - `screenshot.downloadUrl` — append `=w{width}` (using `width` from screen metadata) before downloading, save as `.stitch/designs/{page}.png`

### Step 4: Consume and Convert

1. Read `.stitch/designs/{page}.html`
2. Invoke `stitch:html-to-vue` pipeline to convert the HTML to a Vue SFC
3. Write the resulting component to `app/components/Stitch{PagePascal}.vue`
4. If the page represents a route, create or update `app/pages/{page}.vue` to import and render the component
5. Fix any asset paths to reference `public/` or use Nuxt's `useAssets` pattern

### Step 5: Integrate

1. Run `stitch:ingest` to sync design tokens to the DSE (design system engine) — ensures Tailwind semantic tokens stay aligned with the Stitch design theme
2. Run `stitch:to-nuxt` to apply any theme-level changes to `app/assets/css/main.css`
3. Update navigation: wire any placeholder links in existing pages to the new route; add the new page to the global nav if appropriate
4. Ensure shared layout components (`app/layouts/default.vue`, header, footer) remain consistent

### Step 6: Prepare the Next Baton

**You MUST update `.stitch/next-prompt.md` before completing.** This keeps the loop alive.

1. **Decide the next page:**
   - Check `.stitch/SITE.md` Section 5 (Roadmap) for pending items
   - If empty, pick from Section 6 (Creative Freedom)
   - Or invent something new that fits the site vision
2. **Write the baton** following the schema in `resources/baton-schema.md`
3. **Update SITE.md:**
   - Mark the completed page `[x]` in Section 4 (Sitemap)
   - Remove any consumed idea from Section 6
   - Update Section 5 if you completed a backlog item
4. **Certify:** Call `mcp__cellm-oracle__context_certify` to record the completed iteration
5. **Record outcome:** Call `mcp__cellm-oracle__context_record_outcome` with iteration summary

## File Structure Reference

```
project/
├── .stitch/
│   ├── metadata.json        # Stitch project & screen IDs (persist this!)
│   ├── DESIGN.md            # Visual design system (from stitch:design-md)
│   ├── SITE.md              # Site vision, sitemap, roadmap
│   ├── next-prompt.md       # The baton — current task
│   └── designs/             # Staging area for raw Stitch output
│       ├── {page}.html
│       └── {page}.png
└── app/
    ├── components/
    │   └── Stitch{Page}.vue  # Converted Vue SFCs
    └── pages/
        └── {page}.vue        # Nuxt route pages (import Stitch components)
```

### `.stitch/metadata.json` Schema

Persists all Stitch identifiers so future iterations can reference them for edits or variants. Populate by calling `mcp__stitch__get_project` after creating a project or generating screens.

```json
{
  "name": "projects/6139132077804554844",
  "projectId": "6139132077804554844",
  "title": "My App",
  "visibility": "PRIVATE",
  "createTime": "2026-03-04T23:11:25.514932Z",
  "updateTime": "2026-03-04T23:34:40.400007Z",
  "projectType": "PROJECT_DESIGN",
  "origin": "STITCH",
  "deviceType": "DESKTOP",
  "designTheme": {
    "colorMode": "DARK",
    "font": "INTER",
    "roundness": "ROUND_EIGHT",
    "customColor": "#40baf7",
    "saturation": 3
  },
  "screens": {
    "index": {
      "id": "d7237c7d78f44befa4f60afb17c818c1",
      "sourceScreen": "projects/6139132077804554844/screens/d7237c7d78f44befa4f60afb17c818c1",
      "x": 0,
      "y": 0,
      "width": 1440,
      "height": 1249
    }
  },
  "metadata": {
    "userRole": "OWNER"
  }
}
```

| Field | Description |
|-------|-------------|
| `name` | Full resource name (`projects/{id}`) |
| `projectId` | Stitch project ID |
| `title` | Human-readable project title |
| `designTheme` | Design system tokens: color mode, font, roundness, custom color, saturation |
| `deviceType` | Target device: `DESKTOP`, `MOBILE`, `TABLET` |
| `screens` | Map of page name to screen object. Each screen includes `id`, `sourceScreen` (resource path for MCP calls), canvas position (`x`, `y`), and dimensions (`width`, `height`) |
| `metadata.userRole` | User's role on the project (`OWNER`, `EDITOR`, `VIEWER`) |

## Design System Integration

This skill works best with the `stitch:design-md` skill:

1. **First-time setup:** Generate `.stitch/DESIGN.md` using `stitch:design-md` from an existing Stitch screen
2. **Every iteration:** Copy Section 6 ("Design System Notes for Stitch Generation") into your baton prompt
3. **Consistency:** All generated screens will share the same visual language
4. **DSE sync:** After `stitch:ingest`, the design tokens from `designTheme` are reflected in `app/assets/css/main.css` via `--ui-*` variables

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Stitch generation fails | Verify the prompt includes the full design system block |
| Inconsistent styles | Ensure `.stitch/DESIGN.md` is current and Section 6 was copied verbatim |
| Loop stalls | Check that `.stitch/next-prompt.md` was updated with valid YAML frontmatter |
| Theme drift after ingest | Re-run `stitch:to-nuxt` to re-align `main.css` with current design tokens |
| Vue SFC has broken paths | Fix asset references to use `public/` or Nuxt asset helpers |

## NEVER

- Auto-trigger generation without explicit user confirmation via `AskUserQuestion`
- Skip `mcp__cellm-oracle__context_preflight` before generation
- Skip `mcp__cellm-oracle__context_certify` after integration
- Recreate pages already marked `[x]` in SITE.md Section 4
- Forget to update `.stitch/next-prompt.md` — this breaks the loop
- Output raw HTML to `app/` — always convert to Vue SFC via `stitch:html-to-vue`
- Skip `stitch:ingest` after consuming new screens — DSE sync is mandatory

# Site Template

Use these templates when initializing a new project with the build loop (`stitch-loop start`).

## SITE.md Template

```markdown
# Project Vision & Constitution

> **AGENT INSTRUCTION:** Read this file before every iteration. It serves as the project's long-term memory.

## 1. Core Identity

* **Project Name:** [Your project name]
* **Stitch Project ID:** [Your Stitch project ID — from .stitch/metadata.json]
* **Mission:** [What the site achieves]
* **Target Audience:** [Who uses this site]
* **Voice:** [Tone and personality descriptors]

## 2. Visual Language

*Reference these descriptors when prompting Stitch.*

* **The "Vibe" (Adjectives):**
    * *Primary:* [Main aesthetic keyword]
    * *Secondary:* [Supporting aesthetic]
    * *Tertiary:* [Additional flavor]

## 3. Architecture & File Structure

* **Components:** `app/components/Stitch{Page}.vue` — converted Vue SFCs from Stitch output
* **Pages:** `app/pages/{page}.vue` — Nuxt routes that import Stitch components
* **Staging Area:** `.stitch/designs/` — raw HTML and PNG from Stitch before conversion
* **Asset Flow:** Stitch generates to `.stitch/designs/` → `stitch:html-to-vue` converts to Vue SFC → placed in `app/components/` → imported by `app/pages/`
* **Navigation Strategy:** [How nav works — e.g., shared layout in app/layouts/default.vue]

## 4. Live Sitemap (Current State)

*Update this when a new page is successfully integrated. Mark with `[x]` when done.*

* [x] `index` — [Description]
* [ ] `about` — [Description]

## 5. The Roadmap (Backlog)

*Pick the next task from here if available. Remove items when completed.*

### High Priority

- [ ] [Task description]
- [ ] [Task description]

### Medium Priority

- [ ] [Task description]

## 6. Creative Freedom Guidelines

*When the backlog is empty, follow these guidelines to innovate.*

1. **Stay On-Brand:** New pages must fit the established vibe
2. **Enhance the Core:** Support the site mission
3. **Naming Convention:** Use lowercase, hyphenated route slugs

### Ideas to Explore

*Pick one, build it, then REMOVE it from this list.*

- [ ] `stats` — [Description]
- [ ] `settings` — [Description]

## 7. DSE Alignment

*Design token sync state between Stitch and Nuxt UI.*

* **Last ingest:** [ISO timestamp or "never"]
* **Token source:** `.stitch/metadata.json` → `designTheme`
* **CSS target:** `app/assets/css/main.css` — `--ui-*` variables
* **Rule:** Always run `stitch:ingest` after consuming new screens to keep semantic tokens aligned with the Stitch design theme

## 8. Rules of Engagement

1. Do not recreate pages already marked `[x]` in Section 4
2. Always update `.stitch/next-prompt.md` before completing an iteration
3. Consume ideas from Section 6 when you use them — remove the item
4. Always run `stitch:ingest` after consuming new screens
5. All output must be Vue SFCs — never commit raw HTML to `app/`
```

## DESIGN.md Template

Generate this using the `stitch:design-md` skill from an existing Stitch screen, or create manually:

```markdown
# Design System: [Project Name]

**Project ID:** [Stitch Project ID]

## 1. Visual Theme & Atmosphere

[Describe mood, density, aesthetic philosophy]

## 2. Color Palette & Roles

- **[Descriptive Name]** (#hexcode) — [Functional role]
- **[Descriptive Name]** (#hexcode) — [Functional role]

## 3. Typography Rules

[Font family, weights, sizes, spacing]

## 4. Component Stylings

* **Buttons:** [Shape, color, behavior]
* **Cards:** [Corners, background, shadows]
* **Inputs:** [Stroke, background, focus states]

## 5. Layout Principles

[Whitespace strategy, margins, grid alignment]

## 6. Design System Notes for Stitch Generation

**Copy this block verbatim into every baton prompt:**

**DESIGN SYSTEM (REQUIRED):**
- Platform: [Web/Mobile], [Desktop/Mobile]-first
- Theme: [Dark/Light], [descriptors]
- Background: [Description] (#hex)
- Primary Accent: [Description] (#hex)
- Text Primary: [Description] (#hex)
- Font: [Description]
- Layout: [Description]
```

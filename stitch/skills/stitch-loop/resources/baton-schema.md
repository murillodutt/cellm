# Baton File Schema

The baton file (`.stitch/next-prompt.md`) is the communication mechanism between loop iterations. It tells the next agent what page to build and how to build it.

## Format

```yaml
---
page: <filename-without-extension>
deviceType: <DESKTOP|MOBILE|TABLET>  # optional, defaults to DESKTOP
---
<prompt-content>
```

## Fields

### Frontmatter (YAML)

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | string | Yes | — | Output page name, used as component name and route slug (no extension, lowercase, hyphenated) |
| `deviceType` | string | No | `DESKTOP` | Target device for Stitch generation: `DESKTOP`, `MOBILE`, or `TABLET` |

### Body (Markdown)

The body contains the full Stitch prompt. It must include:

1. **One-line description** with vibe and atmosphere keywords
2. **Design System block** (required) — copied verbatim from `.stitch/DESIGN.md` Section 6
3. **Page Structure** — numbered list of sections and components to generate

The design system block is mandatory. Omitting it produces visually inconsistent output that diverges from the established theme.

## Example

```markdown
---
page: achievements
deviceType: DESKTOP
---
A competitive, gamified achievements page with terminal aesthetics.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first
- Theme: Dark, minimal, data-focused
- Background: Deep charcoal/near-black (#0f1419)
- Primary Accent: Teal/Cyan (#2dd4bf)
- Text Primary: White (#ffffff)
- Font: Clean sans-serif (Inter, SF Pro, or system default)
- Layout: Centered content, max-width container

**Page Structure:**
1. Header with title "Achievements" and navigation
2. Badge grid showing locked/unlocked states with icons
3. Progress section with milestone bars
4. Footer with links to other pages
```

## Validation Rules

Before completing an iteration, validate the next baton:

- [ ] `page` frontmatter field exists and contains a valid, lowercase filename slug
- [ ] `deviceType` is one of `DESKTOP`, `MOBILE`, `TABLET` (if present)
- [ ] Prompt body includes the full design system block from `.stitch/DESIGN.md` Section 6
- [ ] The page name does NOT appear as `[x]` in `.stitch/SITE.md` Section 4 (Sitemap)
- [ ] Prompt body describes specific page structure sections

## Component Naming Convention

The `page` field drives naming across the pipeline:

| `page` value | Vue component | Nuxt page route |
|--------------|---------------|-----------------|
| `index` | `StitchIndex.vue` | `app/pages/index.vue` |
| `about` | `StitchAbout.vue` | `app/pages/about.vue` |
| `user-profile` | `StitchUserProfile.vue` | `app/pages/user-profile.vue` |

The component is placed in `app/components/` and imported by the corresponding `app/pages/` route file.

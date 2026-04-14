---
description: "Compose optimized prompts for Google Stitch screen generation. Reads DESIGN.md Section 6 context, applies Stitch Effective Prompting best practices, and outputs ready-to-use prompts. Use when: 'stitch prompt', 'compose prompt', 'create stitch prompt', 'prompt for stitch'."
cellm_scope: universal
user-invocable: true
argument-hint: "[description of the screen or edit]"
allowed-tools: Read, Glob, AskUserQuestion
---

Compose optimized prompts for Stitch screen generation and editing. Uses DESIGN.md context to ensure visual consistency across all generated screens.

## Prompt Structure

Every Stitch prompt MUST follow this 4-part structure:

### 1. Design Context Block (from DESIGN.md)

Synthesize a design context block from the 5 canonical DESIGN.md sections:

- **Color Foundation** (Section 2) — primary, secondary, surface hex values
- **Typography** (Section 3) — font families, weight hierarchy
- **Components** (Section 5) — button styles, card patterns, nav conventions

Format as a context preamble:

```
Design System Context:
- Primary: #HEXCODE (role)
- Secondary: #HEXCODE (role)
- Font: FamilyName, weights: 400/500/600/700
- Radius: 0.Xrem default
- Style: [aesthetic description from Section 1]
```

### 2. Screen Description

Describe WHAT the screen shows, not HOW to build it. Stitch responds best to:

- Descriptive language over technical instructions
- User-facing outcomes over implementation details
- Spatial relationships ("sidebar on the left", "hero section at top")

### 3. Device Type

Always specify one of:

| Device | Use When |
|--------|----------|
| `DESKTOP` | Dashboard, admin, content-heavy pages |
| `MOBILE` | Mobile-first flows, responsive previews |
| `TABLET` | Hybrid layouts |

### 4. Consistency Instructions

Always append:

```
Maintain exact visual consistency with the design system above.
Use the specified color palette and typography — do not introduce new colors or fonts.
```

## Prompt Templates

### New Screen — Landing Page

```
[Design Context Block]

Create a landing page with:
- Hero section: bold headline using display font, subtitle in body font, primary CTA button
- Feature grid: 3 cards showing key benefits with icons
- Social proof section: testimonials or partner logos
- Footer with navigation links and contact info

Device: DESKTOP
Maintain exact visual consistency with the design system above.
```

### New Screen — Dashboard

```
[Design Context Block]

Create a dashboard page with:
- Left sidebar navigation with icon + label items, active state highlighted
- Top bar with search input, notification bell, user avatar
- Main content area: summary stats in 4 metric cards, data table below
- Cards use surface elevation with subtle shadows

Device: DESKTOP
Maintain exact visual consistency with the design system above.
```

### New Screen — Form Page

```
[Design Context Block]

Create a form page with:
- Page title and description at top
- Form fields: text inputs, select dropdowns, date pickers
- Grouped in logical sections with section headers
- Action buttons at bottom: primary submit, secondary cancel
- Inline validation states for required fields

Device: DESKTOP
Maintain exact visual consistency with the design system above.
```

### Edit Existing Screen

```
[Design Context Block]

Edit the current screen to [ONE specific change]:
- [describe the single change clearly]

Do not modify any other elements. Keep all existing styling and layout intact.
Maintain exact visual consistency with the design system above.
```

## Stitch Best Practices

| Rule | Reason |
|------|--------|
| One aspect per edit prompt | Stitch handles single-focus edits better than multi-change prompts |
| Descriptive over technical | "A warm, inviting hero" beats "div with bg-primary p-8 flex" |
| Always include design context | Without context, Stitch defaults to its own palette and fonts |
| Specify device type explicitly | Prevents layout mismatches between desktop and mobile |
| Reference existing screens | "Match the style of the login page" improves consistency |
| Avoid CSS class names in prompts | Stitch generates its own Tailwind classes from descriptions |

## Workflow

1. **Read** `.stitch/DESIGN.md` — extract design context
2. **Read** `.stitch/SITE.md` (if exists) — understand page purpose in sitemap
3. **Ask** user for screen description if not provided as argument
4. **Compose** prompt using the 4-part structure above
5. **Present** the composed prompt to the user for review
6. **Output** the final prompt ready for `stitch:invoke` or manual use

## References

Consult these files for detailed guidance:
- [Design Mappings](references/design-mappings.md) -- UI/UX keyword refinement and atmosphere descriptors
- [Prompt Keywords](references/prompt-keywords.md) -- component keywords, adjective palettes, color roles
- [Tool Schemas](references/tool-schemas.md) -- mcp__stitch__* tool call examples and tips
- [DESIGN.md Example](examples/DESIGN.md) -- gold standard 6-section DESIGN.md

## Known Limitations

- Stitch may ignore some color specifications on first generation — re-edit with explicit color references
- Multi-screen generation (up to 5) uses the same prompt for all — adjust descriptions accordingly
- `generate_screen_from_text` takes 1-2 minutes — do not retry if no immediate response

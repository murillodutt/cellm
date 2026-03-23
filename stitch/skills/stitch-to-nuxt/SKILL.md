---
description: "Translate Stitch DESIGN.md tokens into Nuxt UI v4 main.css @theme block and app.config.ts. Generates full color scales, radius, typography, and spacing. Use when: 'stitch to nuxt', 'convert tokens', 'generate theme', 'translate design to nuxt'."
user-invocable: true
argument-hint: "[path to DESIGN.md or .stitch/ directory]"
allowed-tools: Read, Write, Edit, Glob, AskUserQuestion
---

# Stitch to Nuxt — Tokens to main.css and app.config.ts

Translate Stitch design tokens from DESIGN.md into Nuxt UI v4 theme configuration: `@theme` static block in `main.css` and semantic colors in `app.config.ts`.

## Pipeline

### Step 1: Locate and Parse DESIGN.md

1. Resolve path: argument > `.stitch/DESIGN.md` > report absence.
2. Extract from **Color Foundation** section:
   - Primary color (hex)
   - Neutral/gray palette base (hex)
   - Accent colors (hex)
   - Semantic colors: error, warning, success, info (hex if defined)
3. Extract from **Typography** section:
   - Font family (sans, serif, mono)
   - Font weights used
   - Base font size
4. Extract from **Components** section:
   - Border radius values
5. Extract from **Layout** section:
   - Spacing base unit

### Step 2: Generate 50-950 Color Scale

For each extracted color, generate a full Tailwind-compatible scale using HSL interpolation:

```
Input:  Primary #4F46E5 (indigo)
Output:
  --color-primary-50:  oklch(0.97 0.02 275)
  --color-primary-100: oklch(0.93 0.04 275)
  --color-primary-200: oklch(0.87 0.08 275)
  --color-primary-300: oklch(0.77 0.13 275)
  --color-primary-400: oklch(0.65 0.18 275)
  --color-primary-500: oklch(0.55 0.22 275)   /* base */
  --color-primary-600: oklch(0.47 0.20 275)
  --color-primary-700: oklch(0.40 0.17 275)
  --color-primary-800: oklch(0.33 0.14 275)
  --color-primary-900: oklch(0.27 0.10 275)
  --color-primary-950: oklch(0.20 0.08 275)
```

Rules:
- Use OKLCH color space for perceptual uniformity
- 500 shade = closest to the original hex
- Lighter shades (50-400): increase lightness, decrease chroma
- Darker shades (600-950): decrease lightness, decrease chroma

### Step 3: Generate @theme Static Block (main.css)

Write color scales into the `@theme static` block in `app/assets/css/main.css`:

```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme static {
  /* Primary — from Stitch DESIGN.md */
  --color-primary-50:  <value>;
  --color-primary-100: <value>;
  /* ... full 50-950 scale ... */
  --color-primary-950: <value>;

  /* Neutral — from Stitch DESIGN.md */
  --color-neutral-50:  <value>;
  /* ... full 50-950 scale ... */
  --color-neutral-950: <value>;

  /* Typography — from Stitch DESIGN.md */
  --font-sans: '<family>', ui-sans-serif, system-ui, sans-serif;
}
```

If `main.css` already has a `@theme static` block, **merge** new variables into it (preserve existing non-conflicting entries).

### Step 4: Update app.config.ts

Set the semantic color aliases in `app/app.config.ts`:

```typescript
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'primary',
      neutral: 'neutral',
      error: 'error',       // if defined in DESIGN.md
      warning: 'warning',   // if defined in DESIGN.md
      success: 'success',   // if defined in DESIGN.md
    },
  },
})
```

Rules:
- Only add color entries that have corresponding `@theme static` scales
- Preserve existing `app.config.ts` entries not related to colors
- Use `Edit` tool to modify, never overwrite the entire file

### Step 5: Set --ui-radius

Map the DESIGN.md border-radius to `--ui-radius` CSS variable:

| DESIGN.md Value | `--ui-radius` | Stitch `designTheme.roundness` |
|----------------|--------------|-------------------------------|
| `0` / none | `0rem` | `none` / `0` |
| `2px` / `0.125rem` | `0.125rem` | `0.125` |
| `4px` / `0.25rem` | `0.25rem` | `0.25` |
| `6px` / `0.375rem` | `0.375rem` | `0.375` |
| `8px` / `0.5rem` | `0.5rem` | `0.5` |
| `12px` / `0.75rem` | `0.75rem` | `0.75` |
| `16px` / `1rem` | `1rem` | `1` |

Add to `main.css`:

```css
:root {
  --ui-radius: <value>;
}
```

### Step 6: Set Font Family

If DESIGN.md specifies a font family, add it to `@theme static`:

```css
@theme static {
  --font-sans: '<family>', ui-sans-serif, system-ui, sans-serif;
}
```

And ensure the font is loaded (check for `@nuxt/fonts` module or `<link>` tag).

### Step 7: Show Diff and Apply

1. **AskUserQuestion**: show a summary of all changes before applying:
   - Colors: list each color with hex and scale
   - Radius: current vs new `--ui-radius`
   - Font: current vs new `--font-sans`
   - Files to modify: `main.css`, `app.config.ts`
2. Wait for user approval.
3. Apply changes with `Edit` tool (preserve existing content).

## Color Translation Reference (Stitch to Nuxt UI)

| Stitch (presentational) | Nuxt UI (semantic) | Role |
|------------------------|-------------------|------|
| `bg-white` / `bg-[#FAFAFA]` | `bg-default` | Main page background |
| `bg-gray-50` / `bg-slate-50` | `bg-muted` | Sidebar, section background |
| `bg-gray-100` / `bg-slate-100` | `bg-elevated` | Card, modal, dropdown |
| `bg-gray-200` / `bg-slate-200` | `bg-accented` | Hover state, chip, tag |
| `text-gray-400` | `text-dimmed` | Placeholder, disabled |
| `text-gray-500` | `text-muted` | Secondary text |
| `text-gray-600` | `text-toned` | Caption, label |
| `text-gray-700` | `text-default` | Body text |
| `text-gray-900` | `text-highlighted` | Headings, titles |
| `border-gray-200` | `border-default` | Default border |
| `border-gray-300` | `border-accented` | Higher contrast border |

## Dark Mode Collapse

Every `X dark:Y` pair where X and Y are tonal opposites collapses into a single semantic token:

| Stitch Pair | Nuxt UI Token |
|------------|--------------|
| `bg-white dark:bg-gray-900` | `bg-default` |
| `bg-gray-50 dark:bg-gray-800` | `bg-muted` |
| `bg-gray-100 dark:bg-gray-800` | `bg-elevated` |
| `text-gray-900 dark:text-white` | `text-highlighted` |
| `text-gray-700 dark:text-gray-200` | `text-default` |
| `border-gray-200 dark:border-gray-800` | `border-default` |

Exception: pairs where the dark variant is not a simple tonal opposite require manual decision — flag these for the user.

## Graceful Degradation

| Condition | Behavior |
|-----------|----------|
| DESIGN.md not found | Report absence, suggest `stitch:stitch-bridge analyze` first |
| Color section missing | Skip color generation, report gap |
| Typography section missing | Skip font config, report gap |
| `main.css` not found | Create it with standard imports + generated theme |
| `app.config.ts` not found | Create minimal config with generated colors |
| Existing theme conflicts | Show diff, ask user to choose: overwrite or merge |

## NEVER

- **Overwrite main.css entirely** — always merge into existing `@theme static` block
- **Use raw hex in Nuxt UI components** — all colors go through the `@theme static` scale
- **Generate dark: prefixes** — Nuxt UI handles dark mode via CSS variables automatically
- **Skip the diff preview** — always show changes and get user approval before applying
- **Hardcode color values in app.config.ts** — use scale names (`primary`, `neutral`), not hex values
- **Generate Tailwind v3 syntax** — use Tailwind v4 `@theme static` block, not `tailwind.config.ts`

---
description: "Convert Stitch-generated HTML screens to Vue 3 SFCs with semantic Nuxt UI tokens. Remaps Tailwind utility classes, substitutes HTML elements for Nuxt UI components, and removes dark: prefixes. Use when: 'html to vue', 'convert stitch html', 'stitch to component'."
user-invocable: true
argument-hint: "[path-to-html-file]"
allowed-tools: Read, Write, Glob, AskUserQuestion, mcp__stitch__get_screen, mcp__stitch__list_screens
---

Convert Stitch HTML to Vue SFC with semantic tokens and Nuxt UI components.

## Pipeline

1. **Read HTML** — Read the `.stitch/designs/{page}.html` file (or user-provided path). If the local file does not exist, fetch HTML via `mcp__stitch__get_screen` using the screen's `htmlCode.downloadUrl`.
2. **Extract body** — Strip `<head>`, `<script>` (including `tailwind.config`), and `<html>`/`<body>` wrappers. Keep only the inner content.
3. **Extract tailwind.config** — Parse the inline `tailwind.config` from `<script>` tag to understand project colors, fonts, and radius. This is the token source (Stitch does NOT use CSS variables).
4. **CLASS_MAP remap** — Apply CLASS_MAP to replace Tailwind utility classes with Nuxt UI semantic tokens. Source of truth: `@cellm-ai/stitch-bridge/class-map` (`resolveClass()` + `matchColor()` for DeltaE fallback). Tables below are human-readable reference.
5. **Remove dark: prefixes** — Delete all `dark:*` classes. Nuxt UI handles dark mode automatically via the theming layer.
6. **DeltaE hex matching** — For hardcoded hex values (`bg-[#F8FAFC]`, `text-[#2C2C2C]`), compare against `tailwind.config` colors and DSE palette using deltaE color distance. Map to nearest semantic token if deltaE < 10.
7. **Component substitution** — Replace HTML elements with Nuxt UI components using the substitution table below.
8. **Wrap in SFC** — Wrap result in `<template>` + `<script setup lang="ts">` with proper imports and typed props.
9. **Review** — Present the converted SFC to the user via AskUserQuestion for approval before writing.
10. **Write** — Save as `app/components/{PageName}.vue` or user-specified path.

## CLASS_MAP — Tailwind to Nuxt UI Semantic Tokens

### Background

| Stitch class | Nuxt UI semantic | CSS variable |
|-------------|-----------------|--------------|
| `bg-white` | `bg-default` | `--ui-bg` |
| `bg-gray-50` | `bg-muted` | `--ui-bg-muted` |
| `bg-gray-100` | `bg-elevated` | `--ui-bg-elevated` |
| `bg-gray-200` | `bg-accented` | `--ui-bg-accented` |
| `bg-gray-800`, `bg-gray-900` | `bg-inverted` | `--ui-bg-inverted` |

### Text

| Stitch class | Nuxt UI semantic | CSS variable |
|-------------|-----------------|--------------|
| `text-gray-400` | `text-dimmed` | `--ui-text-dimmed` |
| `text-gray-500` | `text-muted` | `--ui-text-muted` |
| `text-gray-600` | `text-toned` | `--ui-text-toned` |
| `text-gray-700` | `text-default` | `--ui-text` |
| `text-gray-900`, `text-black` | `text-highlighted` | `--ui-text-highlighted` |
| `text-white` | `text-inverted` | `--ui-text-inverted` |

### Border

| Stitch class | Nuxt UI semantic | CSS variable |
|-------------|-----------------|--------------|
| `border-gray-200` | `border-default` | `--ui-border` |
| `border-gray-300` | `border-accented` | `--ui-border-accented` |
| `border-gray-700`, `border-gray-800` | `border-inverted` | `--ui-border-inverted` |

### Primary color

| Stitch class | Nuxt UI semantic |
|-------------|-----------------|
| `bg-blue-600`, `bg-primary`, `bg-{customColor}` | `bg-primary` |
| `text-blue-600`, `text-primary`, `text-{customColor}` | `text-primary` |
| `border-blue-600`, `border-primary` | `border-primary` |
| `hover:bg-blue-700`, `hover:bg-primary/90` | `hover:bg-primary/90` |

### Ring and focus

| Stitch class | Nuxt UI semantic |
|-------------|-----------------|
| `ring-gray-200`, `ring-gray-300` | `ring-default` |
| `focus:ring-blue-500`, `focus:ring-primary` | `focus:ring-primary` |

### Dark mode

| Stitch class | Action |
|-------------|--------|
| `dark:*` (any) | **Remove entirely** — Nuxt UI theming handles dark mode automatically |

## Component Substitution

| HTML element | Nuxt UI component | Notes |
|-------------|-------------------|-------|
| `<button>` | `<UButton>` | Map `class` styles to `color`, `variant`, `size` props |
| `<input>` | `<UInput>` | Map `type`, `placeholder` to props |
| `<textarea>` | `<UTextarea>` | Map `rows`, `placeholder` to props |
| `<select>` | `<USelect>` | Extract `<option>` elements to `:items` prop |
| `<table>` | `<UTable>` | Extract headers to `:columns`, rows to `:rows` |
| `<a>` (navigation) | `<ULink>` or `<NuxtLink>` | Use `<NuxtLink>` for internal routes |
| `<img>` | `<NuxtImg>` | Add `loading="lazy"` if not present |
| `<nav>` with links | `<UNavigationMenu>` | Extract items to `:items` prop |
| `<dialog>`, modal divs | `<UModal>` | Extract trigger and content |
| `<details>` | `<UAccordion>` | Extract summary and content to `:items` |
| `<div class="card">` | `<UCard>` | Map header, body, footer to slots |
| `<span class="badge">` | `<UBadge>` | Map color and variant |
| `<div class="avatar">` | `<UAvatar>` | Map `src`, `alt`, `size` |

## Stitch HTML Extraction Note

Stitch embeds design tokens in an inline `<script>tailwind.config = { ... }</script>` block — NOT in CSS variables. When extracting tokens:

1. Parse the `tailwind.config.theme.extend.colors` object for project colors
2. Parse `tailwind.config.theme.extend.fontFamily` for typography
3. Parse `tailwind.config.theme.extend.borderRadius` for radius values
4. These values inform the deltaE matching step and the DSE ingest pipeline

## DeltaE Color Matching

For arbitrary hex values in classes like `bg-[#F8FAFC]` or `text-[#2C2C2C]`:

1. Convert hex to Lab color space
2. Compare against known semantic roles using deltaE (CIE2000):
   - `deltaE < 5`: confident match — auto-replace with semantic token
   - `deltaE 5-10`: probable match — replace but flag for review
   - `deltaE > 10`: no match — keep as custom CSS variable, flag for DSE decision
3. Matching priority: project `tailwind.config` colors > DSE palette > Tailwind default palette

## NEVER

- **Keep `dark:` classes** — Nuxt UI handles dark mode; keeping them causes conflicts
- **Use raw Tailwind palette colors** — always map to semantic tokens (`text-primary`, not `text-blue-600`)
- **Keep hardcoded hex in classes** — resolve via deltaE or extract to CSS variable
- **Skip the review step** — always show the converted SFC to the user before writing
- **Remove accessibility attributes** — preserve `aria-*`, `role`, `alt`, `for` attributes from source HTML
- **Inline styles** — convert to Tailwind semantic classes or component props, never leave `style=""`

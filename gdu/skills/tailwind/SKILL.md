---
description: Tailwind CSS v4 + Nuxt UI v4 semantic design system. Activates on .vue and .css files to enforce semantic tokens, CSS variables, Tailwind Variants, and automatic dark mode.
user-invocable: false
---

Nuxt UI v4 provides a complete semantic layer on top of Tailwind CSS v4. Use it.

## Semantic Classes (MANDATORY)

| Category | Use | Never |
|----------|-----|-------|
| Colors | `text-primary`, `bg-error`, `text-warning` | `text-blue-500`, `bg-red-600` |
| Text | `text-dimmed`, `text-muted`, `text-toned`, `text-default`, `text-highlighted` | `text-gray-400`, `text-neutral-500` |
| Background | `bg-default`, `bg-muted`, `bg-elevated`, `bg-accented`, `bg-inverted` | `bg-white`, `bg-gray-50` |
| Border | `border-default`, `border-muted`, `border-accented`, `border-inverted` | `border-gray-200` |
| Radius | `rounded-sm` through `rounded-3xl` (driven by `--ui-radius`) | `rounded-[12px]` |

## CSS Variables (`--ui-*`)

In Tailwind v4, the **primary source of tokens** is `app/assets/css/main.css` using the `@theme` directive. `tailwind.config.ts` is only maintained as a fallback for v3 compatibility:

```css
@import "tailwindcss";
@import "@nuxt/ui";

@theme {
  --font-sans: 'Public Sans', sans-serif;
}
```

Customize shades per mode in `:root` / `.dark`:

```css
:root { --ui-primary: var(--ui-color-primary-500); }
.dark { --ui-primary: var(--ui-color-primary-400); }
```

## Dark Mode

Dark mode is **automatic** via CSS variables. Nuxt UI components handle light/dark internally.

- Custom layouts: use semantic bg/text (`bg-default text-default`) — dark mode comes free
- Only write `dark:` variants for **non-Nuxt-UI** elements with hardcoded values

## Tailwind Variants (Component Theming)

Nuxt UI uses Tailwind Variants with slots, variants, and compoundVariants.

- **Per-instance**: `ui` prop overrides slots: `<UCard :ui="{ body: 'p-8' }" />`
- **Global**: `app.config.ts` under `ui.{component}` key
- **`class` prop**: overrides root/base slot only

## Responsive

Mobile-first: `class` then `sm:` `md:` `lg:`. No arbitrary values (`w-[347px]`).

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after styling implementation, write feedback entry to `dev-cellm-feedback/entries/tailwind-{date}-{seq}.md`. Note which semantic tokens were missing, whether Tailwind v4 conventions were followed, and which hardcoded values leaked through. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Hardcoded colors** — no `blue-500`, `#hex`, `rgb()`
- **Manual dark mode on Nuxt UI components** — automatic via `--ui-*`
- **`tailwind.config.ts` as primary source** — Tailwind v4 uses `@theme` in `app/assets/css/main.css` as the primary source of tokens. `tailwind.config.ts` is just a fallback for v3.
- **Arbitrary values** — no `w-[347px]`, `p-[13px]`
- **Inline styles** — use Tailwind classes or CSS variables
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after styling implementation is mandatory

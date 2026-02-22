---
name: tailwind
description: Tailwind CSS v4 patterns with semantic design tokens. Activates on .vue and .css files to enforce semantic colors, consistent spacing, mobile-first responsive, and dark mode support.
paths:
  - "**/*.vue"
  - "**/*.css"
  - "**/tailwind.config.ts"
user-invocable: false
---

Every color class uses **semantic tokens** (`primary`, `neutral`, `error`, `warning`, `success`) — never hardcoded palette values. Layout is **mobile-first** with progressive breakpoints. Every visible element supports **dark mode**.

```vue
<!-- Semantic tokens (correct) -->
<button class="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-md transition-colors">
<div class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
<span class="text-error">Validation failed</span>

<!-- Hardcoded colors (prohibited) -->
<button class="bg-blue-500">
<span class="text-red-500">
```

| Token | Purpose |
|-------|---------|
| `primary` | Main actions, links, focus rings |
| `neutral` | Text, borders, backgrounds |
| `error` | Errors, destructive actions |
| `warning` | Alerts, caution states |
| `success` | Confirmations, positive feedback |

**Spacing** — consistent scale: `1, 2, 3, 4, 6, 8, 12, 16, 24, 32`. No arbitrary values.

**Responsive** — mobile-first: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Breakpoints: `sm -> md -> lg -> xl -> 2xl`.

**Dark mode** — pair every background/text: `bg-white dark:bg-neutral-900`, `text-neutral-900 dark:text-neutral-100`.

## NEVER

- **Hardcoded color classes** — no `blue-500`, `red-600`, `gray-100` — use semantic tokens
- **Arbitrary values** — no `w-[347px]` — use the spacing scale or fractional widths
- **Missing dark mode** — every visible element has `dark:` variant
- **Desktop-first** — no `lg:hidden` without mobile default — always start mobile
- **Inline styles** — no `style="color: red"` — use Tailwind classes

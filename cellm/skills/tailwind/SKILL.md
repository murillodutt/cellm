---
name: tailwind
description: Tailwind CSS v4 patterns with semantic design tokens. Activates on .vue and .css files to enforce semantic colors, consistent spacing, mobile-first responsive, and dark mode support.
paths:
  - "**/*.vue"
  - "**/*.css"
  - "**/tailwind.config.ts"
user-invocable: false
---

Semantic tokens only: `primary`, `neutral`, `error`, `warning`, `success`. Mobile-first. Dark mode on every visible element.

**Spacing** — scale: 1, 2, 3, 4, 6, 8, 12, 16, 24, 32. No arbitrary values.

**Responsive** — `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`. Always start mobile.

**Dark mode** — pair every bg/text: `bg-white dark:bg-neutral-900`.

## NEVER

- **Hardcoded colors** — no `blue-500`, `red-600`, `gray-100`
- **Arbitrary values** — no `w-[347px]`
- **Missing dark mode** — every visible element has `dark:` variant
- **Desktop-first** — always start mobile
- **Inline styles** — use Tailwind classes

---
description: Icon system routing — two systems (ASCII for text, Nuxt UI/Iconify for Vue), one consistent language. Apply when rendering status, icons, or visual indicators in any file type.
user-invocable: false
---

# Icon Routing — Before Rendering

Two icon systems, routed by context:

| Context | System | Example |
|---------|--------|---------|
| `.vue` components | Nuxt UI `<UIcon>` via Iconify | `i-lucide-check` |
| `.ts`/`.js` logs, `.md` docs, commits | ASCII symbols | `[+]` `[-]` `[!]` |

## Semantic Map

| Meaning | ASCII | Nuxt UI Icon | Color |
|---------|-------|--------------|-------|
| Success | `[+]` | `i-lucide-check` | green |
| Error | `[-]` | `i-lucide-x` | red |
| Warning | `[!]` | `i-lucide-alert-triangle` | yellow |
| Info | `[i]` | `i-lucide-info` | blue |
| Pending | `[...]` | `i-lucide-clock` | gray |
| In Progress | `[~]` | `i-lucide-loader` | indigo |

## NEVER

- **Mix systems in same element** — no `[+]` inside `<UBadge>`, no `<UIcon>` in markdown
- **Use emojis** — ASCII in text, Iconify in Vue, never emojis anywhere
- **Guess icon names** — consult the semantic map above or Lucide docs

---
id: SK-TAILWIND
version: v0.10.0
status: OK
skill: tailwind
triggers: ["app/**/*.vue", "**/*.css"]
budget: ~300 tokens
---

# Tailwind v4

## Semantic Tokens (Mandatory)

```vue
<!-- [+] Correct -->
<div class="text-primary bg-neutral-100">
<span class="text-error">Error</span>
<button class="bg-primary hover:bg-primary/90">

<!-- [-] Prohibited -->
<div class="text-blue-500 bg-gray-100">
<span class="text-red-500">Error</span>
```

## Available Colors

| Token | Use |
 | ------- |-----|
| primary | Main actions, links |
| neutral | Text, borders, backgrounds |
| error | Errors, validation |
| warning | Alerts, attention |
| success | Confirmations, success |

## Spacing

Use consistent scale: 1, 2, 3, 4, 6, 8, 12, 16, 24, 32

```vue
<div class="p-4 mb-6 gap-4">
```

## Responsive

Mobile-first: sm → md → lg → xl → 2xl

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

## Dark Mode

```vue
<div class="bg-white dark:bg-neutral-900">
<span class="text-neutral-900 dark:text-neutral-100">
```

## Rules

1. Never hardcoded colors (blue-500, red-600)
2. Always semantic tokens
3. Mobile-first responsive
4. Support dark mode

---
name: tailwind
description: |
  Tailwind CSS v4 patterns with semantic tokens.
  Use when: styling components, responsive design, dark mode.
  Triggers: .vue files with classes, CSS files, styling discussions.
allowed-tools: Read, Grep, Glob, Edit, Write
model: inherit
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
|-------|-----|
| primary | Main actions, links |
| neutral | Text, borders, backgrounds |
| error | Errors, validation |
| warning | Alerts, attention |
| success | Confirmations, success |

## Spacing Scale

Use consistent scale: 1, 2, 3, 4, 6, 8, 12, 16, 24, 32

```vue
<div class="p-4 mb-6 gap-4">
```

## Responsive (Mobile-First)

sm -> md -> lg -> xl -> 2xl

```vue
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div class="hidden md:block">
<div class="text-sm md:text-base lg:text-lg">
```

## Dark Mode

```vue
<div class="bg-white dark:bg-neutral-900">
<span class="text-neutral-900 dark:text-neutral-100">
```

## Common Patterns

```vue
<!-- Card -->
<div class="bg-white dark:bg-neutral-800 rounded-lg shadow-sm p-4">

<!-- Button -->
<button class="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">

<!-- Input -->
<input class="w-full border border-neutral-300 dark:border-neutral-600 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary">
```

## Rules

1. Never hardcoded colors (blue-500, red-600)
2. Always semantic tokens
3. Mobile-first responsive
4. Support dark mode
5. Consistent spacing from scale

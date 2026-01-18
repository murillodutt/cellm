---
id: TW-INDEX
tags: [tailwind, css]
---

# Tailwind Patterns

## TW-001: Semantic Tokens

```vue
<!-- [+] Use tokens -->
<div class="text-primary bg-neutral-100">
<span class="text-error border-error">

<!-- [-] Never direct colors -->
<div class="text-blue-500 bg-gray-100">
```

## TW-002: Responsive

```vue
<!-- Mobile-first -->
<div class="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4
">
```

## TW-003: Dark Mode

```vue
<div class="
  bg-white dark:bg-neutral-900
  text-neutral-900 dark:text-neutral-100
  border-neutral-200 dark:border-neutral-700
">
```

## TW-004: Consistent Spacing

```vue
<!-- Use scale: 1,2,3,4,6,8,12,16,24,32 -->
<div class="p-4 mb-6 gap-4">
<div class="px-6 py-3 mt-8">
```

## TW-005: Flexbox/Grid

```vue
<!-- Flex -->
<div class="flex items-center justify-between gap-4">

<!-- Grid -->
<div class="grid grid-cols-3 gap-6">

<!-- Vertical Stack -->
<div class="flex flex-col gap-2">
```

## TW-006: States

```vue
<button class="
  bg-primary 
  hover:bg-primary/90 
  focus:ring-2 
  focus:ring-primary/50
  disabled:opacity-50
  disabled:cursor-not-allowed
">
```

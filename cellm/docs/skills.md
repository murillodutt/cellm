# Skills Guide

> [Home](../README.md) > [Docs](README.md) > **Skills**

Complete guide to CELLM's 7 framework skills.

---

## Overview

Skills are specialized knowledge modules that load automatically based on your project files. They provide framework-specific patterns, best practices, and guidance. All skills use the `/cellm:` namespace.

| Skill | Technology | Trigger Patterns |
|-------|------------|------------------|
| `/cellm:nuxt` | Nuxt 4 | `*.vue`, `nuxt.config.ts`, `server/**` |
| `/cellm:vue` | Vue 3 | `*.vue` files |
| `/cellm:typescript` | TypeScript | `*.ts`, `*.tsx` files |
| `/cellm:tailwind` | Tailwind CSS v4 | Files with Tailwind classes |
| `/cellm:pinia` | Pinia | `stores/**`, `pinia` imports |
| `/cellm:drizzle` | Drizzle ORM | `db/**`, `drizzle` imports |
| `/cellm:oracle-search` | Semantic Search | Always available |

---

## How Skills Work

### Automatic Loading

Skills load based on file patterns:

```
You open: src/components/Button.vue
Loaded:   cellm:vue, cellm:nuxt, cellm:tailwind
```

```
You open: server/api/users.get.ts
Loaded:   cellm:nuxt, cellm:typescript
```

```
You open: db/schema.ts
Loaded:   cellm:drizzle, cellm:typescript
```

### What Skills Provide

1. **Patterns** - Best practices for the technology
2. **Rules** - What to do and avoid
3. **Examples** - Code snippets
4. **Context** - Framework-specific guidance

---

## /cellm:nuxt

**Nuxt 4 full-stack patterns and best practices**

### Trigger Patterns

- `*.vue` files
- `nuxt.config.ts`
- `server/**` directories

### Knowledge Covered

| Area | Topics |
|------|--------|
| **SSR/SSG** | Rendering modes, hydration |
| **Composables** | `useAsyncData`, `useFetch`, `useState` |
| **Auto-imports** | Components, composables, utils |
| **Server Routes** | API endpoints, middleware |
| **Nitro** | Server engine patterns |
| **File Structure** | app/, server/, shared/ |

### Key Patterns

**Data Fetching:**
```typescript
// Correct: useAsyncData for SSR
const { data } = await useAsyncData('users', () =>
  $fetch('/api/users')
)

// Avoid: direct fetch (no SSR benefits)
const data = await fetch('/api/users')
```

**API Routes:**
```typescript
// server/api/users.get.ts
export default defineEventHandler(async (event) => {
  const users = await db.select().from(usersTable)
  return users
})
```

---

## /cellm:vue

**Vue 3 Composition API patterns**

### Trigger Patterns

- `*.vue` files

### Knowledge Covered

| Area | Topics |
|------|--------|
| **Composition API** | `<script setup>`, refs, computed |
| **Reactivity** | ref, reactive, computed, watch |
| **Lifecycle** | onMounted, onUnmounted, etc. |
| **Props & Emits** | defineProps, defineEmits |
| **Template** | v-if, v-for, slots |

### Key Patterns

**Component Structure:**
```vue
<script setup lang="ts">
// 1. Imports (auto-imported in Nuxt)

// 2. Props & Emits
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

// 3. Reactive State
const isOpen = ref(false)

// 4. Computed
const displayTitle = computed(() =>
  props.title.toUpperCase()
)

// 5. Methods
function toggle() {
  isOpen.value = !isOpen.value
}

// 6. Lifecycle
onMounted(() => {
  console.log('Component mounted')
})
</script>

<template>
  <div>
    <h1>{{ displayTitle }}</h1>
    <button @click="toggle">Toggle</button>
  </div>
</template>
```

### Rules

- **Always** use `<script setup lang="ts">`
- **Never** use Options API
- **Always** type props with TypeScript
- **Avoid** `any` types

---

## /cellm:typescript

**Type-safe patterns and utilities**

### Trigger Patterns

- `*.ts` files
- `*.tsx` files

### Knowledge Covered

| Area | Topics |
|------|--------|
| **Types** | Interfaces, types, enums |
| **Generics** | Generic functions, constraints |
| **Utilities** | Pick, Omit, Partial, Required |
| **Type Guards** | is, asserts, narrowing |
| **Strict Mode** | null checks, no implicit any |

### Key Patterns

**Type Definitions:**
```typescript
// Prefer interfaces for objects
interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'user'
}

// Use types for unions/utilities
type UserRole = User['role']
type PartialUser = Partial<User>
```

**Type Guards:**
```typescript
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj
  )
}
```

### Rules

- **Never** use `any` - use `unknown` instead
- **Always** enable strict mode
- **Always** type function parameters
- **Prefer** interfaces over types for objects

---

## /cellm:tailwind

**Tailwind CSS v4 with semantic tokens**

### Trigger Patterns

- Files with Tailwind classes
- `tailwind.config.ts`

### Knowledge Covered

| Area | Topics |
|------|--------|
| **Utilities** | Flex, grid, spacing, typography |
| **Responsive** | sm:, md:, lg:, xl: breakpoints |
| **Dark Mode** | dark: variants |
| **Semantic Tokens** | primary, neutral, error, warning, success |
| **Components** | Nuxt UI integration |

### Key Patterns

**Semantic Colors (Nuxt UI):**
```vue
<!-- Correct: semantic tokens -->
<button class="bg-primary text-primary-foreground">
  Primary Action
</button>

<div class="text-neutral-600 dark:text-neutral-400">
  Secondary text
</div>

<!-- Avoid: hardcoded colors -->
<button class="bg-blue-500 text-white">
  Wrong
</button>
```

**Responsive Design:**
```vue
<div class="
  flex flex-col
  md:flex-row
  gap-4
  p-4 md:p-6 lg:p-8
">
  <!-- Content -->
</div>
```

### Rules

- **Never** hardcode colors - use semantic tokens
- **Always** consider dark mode
- **Use** responsive prefixes for layouts

---

## /cellm:pinia

**State management patterns**

### Trigger Patterns

- `stores/**` directories
- Files with `pinia` imports

### Knowledge Covered

| Area | Topics |
|------|--------|
| **Stores** | Setup stores, defineStore |
| **State** | Reactive state management |
| **Getters** | Computed values |
| **Actions** | State mutations, async |
| **Composition** | Store composition |
| **Persistence** | Local storage, SSR |

### Key Patterns

**Setup Store (Preferred):**
```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value)
  const displayName = computed(() =>
    user.value?.name ?? 'Guest'
  )

  // Actions
  async function login(credentials: Credentials) {
    isLoading.value = true
    try {
      user.value = await $fetch('/api/auth/login', {
        method: 'POST',
        body: credentials
      })
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
  }

  return {
    // State
    user,
    isLoading,
    // Getters
    isAuthenticated,
    displayName,
    // Actions
    login,
    logout
  }
})
```

### Rules

- **Always** use Setup Stores (not Options)
- **Always** type state with TypeScript
- **Use** computed for derived state
- **Handle** loading and error states

---

## /cellm:drizzle

**Database ORM patterns**

### Trigger Patterns

- `db/**` directories
- Files with `drizzle` imports

### Knowledge Covered

| Area | Topics |
|------|--------|
| **Schema** | Tables, columns, relations |
| **Queries** | Select, insert, update, delete |
| **Relations** | One-to-one, one-to-many, many-to-many |
| **Migrations** | Schema changes |
| **Type Safety** | Inferred types |

### Key Patterns

**Schema Definition:**
```typescript
// db/schema.ts
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow()
})

// Infer types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

**Queries:**
```typescript
// Select with filter
const activeUsers = await db
  .select()
  .from(users)
  .where(eq(users.status, 'active'))

// Insert
const newUser = await db
  .insert(users)
  .values({ name: 'John', email: 'john@example.com' })
  .returning()

// Update
await db
  .update(users)
  .set({ name: 'Jane' })
  .where(eq(users.id, userId))
```

### Rules

- **Always** define schema in dedicated files
- **Use** inferred types (`$inferSelect`, `$inferInsert`)
- **Handle** errors in database operations
- **Use** transactions for multiple operations

---

## /cellm:oracle-search

**Semantic search integration**

### Trigger Patterns

- Always available

### Knowledge Covered

| Area | Topics |
|------|--------|
| **Search** | Natural language queries |
| **Patterns** | Pattern discovery |
| **Context** | Session context |
| **Memory** | Persistent observations |

### Capabilities

- Find similar code across project
- Discover where patterns are used
- Get context-aware suggestions
- Track pattern usage over time

### Usage

Oracle search is used internally by CELLM to:
1. Find relevant patterns for current work
2. Suggest similar implementations
3. Track what has been built

---

## Skill Combinations

When working on different file types, multiple skills load together:

| File Type | Skills Loaded |
|-----------|---------------|
| `*.vue` | cellm:vue, cellm:nuxt, cellm:tailwind |
| `server/**/*.ts` | cellm:nuxt, cellm:typescript |
| `stores/*.ts` | cellm:pinia, cellm:typescript |
| `db/*.ts` | cellm:drizzle, cellm:typescript |
| `*.ts` (general) | cellm:typescript |

---

## Skill Priority

When skills have conflicting guidance, priority order is:

1. **Anti-patterns** (always enforced)
2. **Project-specific** rules
3. **Framework-specific** skills
4. **General** patterns

---

## Related Documentation

- [Commands Reference](commands.md) - All commands
- [Agents Guide](agents.md) - Specialized agents
- [Features Overview](features.md) - All capabilities

[Back to Docs](README.md) | [Back to Home](../README.md)

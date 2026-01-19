---
id: ARCH-001
alwaysApply: true
---

# Architecture

## Nuxt 4 Structure

```
app/                    # Frontend
  components/           # Vue Components
  composables/          # Reactive logic (use*)
  layouts/              # Page layouts
  pages/                # Routes (file-based)
  plugins/              # Nuxt plugins

server/                 # Nitro Backend
  api/                  # REST Endpoints
  middleware/           # Server middleware
  utils/                # Server utilities
  db/                   # Schema and migrations

shared/                 # Isomorphic
  types/                # Shared types
  utils/                # Pure utils
  schemas/              # Zod schemas
```

## Dependency Flow

```
pages → components → composables → services → core
         ↓
       shared/types
```

- Lower layers should not import from upper layers
- shared/ can be imported by any layer

## Boundaries

| Layer | Can Import |
|--------|---------------|
| pages | everything |
| components | composables, shared |
| composables | services, shared |
| services | core, shared |
| core | shared |
| shared | nothing internal |

## Colocation

Related code stays together:

```
features/
  auth/
    components/
    composables/
    types.ts
    index.ts
```

---
id: DOM-BE-001
version: v0.10.0
status: OK
paths: ["server/**"]
budget: ~350 tokens
---

# Backend Rules

## API Routes

```typescript
// server/api/users/[id].get.ts
export default defineEventHandler(async (event) => {
  // 1. Extract parameters
  const id = getRouterParam(event, 'id')
  
  // 2. Validate
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID required' })
  }
  
  // 3. Execute logic
  const user = await getUserById(id)
  
  // 4. Return
  if (!user) {
    throw createError({ statusCode: 404, message: 'User not found' })
  }
  
  return user
})
```

## Naming

| Type | Pattern | Example |
|------|---------|---------|
| GET | [param].get.ts | [id].get.ts |
| POST | index.post.ts | index.post.ts |
| PUT | [param].put.ts | [id].put.ts |
| DELETE | [param].delete.ts | [id].delete.ts |

## Validation

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2)
})

// In handler
const body = await readValidatedBody(event, CreateUserSchema.parse)
```

## Errors

```typescript
// Always createError, never throw Error
throw createError({
  statusCode: 400,
  message: 'Validation failed',
  data: errors // optional
})
```

## Database

- Use Drizzle ORM
- Async/await queries
- Never sync I/O

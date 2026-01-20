---
id: SK-DRIZZLE
version: v1.1.0
status: OK
skill: drizzle
triggers: ["server/**", "**/db/**"]
budget: ~250 tokens
---

# Drizzle ORM

## Schema

```typescript
// server/db/schema.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

## Queries

```typescript
// Select
const allUsers = await db.select().from(users)
const user = await db.select().from(users).where(eq(users.id, id))

// Insert
const [newUser] = await db.insert(users).values({ email, name }).returning()

// Update
await db.update(users).set({ name }).where(eq(users.id, id))

// Delete
await db.delete(users).where(eq(users.id, id))
```

## Relations

```typescript
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))
```

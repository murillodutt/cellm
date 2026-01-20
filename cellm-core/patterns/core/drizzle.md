---
id: DR-INDEX
version: v1.1.0
status: OK
tags: [drizzle, database]
budget: ~400 tokens
---

# Drizzle Patterns

## DR-001: Schema Definition

```typescript
// server/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
})
```

## DR-002: Relations

```typescript
import { relations } from 'drizzle-orm'

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts)
}))

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id]
  })
}))
```

## DR-003: Queries

```typescript
// Select all
const allUsers = await db.select().from(users)

// Select with where
const user = await db.select()
  .from(users)
  .where(eq(users.id, id))
  .limit(1)

// Select with join
const postsWithAuthor = await db.select()
  .from(posts)
  .leftJoin(users, eq(posts.authorId, users.id))
```

## DR-004: Mutations

```typescript
// Insert
const [newUser] = await db.insert(users)
  .values({ email, name })
  .returning()

// Update
await db.update(users)
  .set({ name, updatedAt: new Date() })
  .where(eq(users.id, id))

// Delete
await db.delete(users)
  .where(eq(users.id, id))
```

## DR-005: Transactions

```typescript
await db.transaction(async (tx) => {
  const [user] = await tx.insert(users).values({...}).returning()
  await tx.insert(profiles).values({ userId: user.id, ... })
})
```

---
name: drizzle
description: |
  Drizzle ORM patterns for database operations.
  Use when: defining schemas, writing queries, database migrations.
  Triggers: db directory, schema.ts, drizzle config, SQL queries.
allowed-tools: Read, Grep, Glob, Edit, Write, Bash
model: inherit
---

# Drizzle ORM

## Schema

```typescript
// server/db/schema.ts
import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content'),
  authorId: uuid('author_id').references(() => users.id),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow(),
})
```

## Queries

```typescript
// Select
const allUsers = await db.select().from(users)
const user = await db.select().from(users).where(eq(users.id, id))

// Select with columns
const names = await db.select({ name: users.name }).from(users)

// Insert
const [newUser] = await db.insert(users).values({ email, name }).returning()

// Insert many
await db.insert(users).values([
  { email: 'a@b.com', name: 'A' },
  { email: 'c@d.com', name: 'C' }
])

// Update
await db.update(users).set({ name }).where(eq(users.id, id))

// Delete
await db.delete(users).where(eq(users.id, id))
```

## Relations

```typescript
import { relations } from 'drizzle-orm'

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}))
```

## Query with Relations

```typescript
const usersWithPosts = await db.query.users.findMany({
  with: {
    posts: true
  }
})
```

## Migrations

```bash
# Generate migration
bun drizzle-kit generate

# Apply migration
bun drizzle-kit migrate
```

## Rules

1. Always use type-safe schema definitions
2. Use `.returning()` for inserts to get created records
3. Define relations for complex queries
4. Use transactions for multiple operations

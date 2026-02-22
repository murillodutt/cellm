---
name: drizzle
description: Drizzle ORM patterns for type-safe database operations. Activates on schema files, db directories, and drizzle config to enforce proper schema definitions, relations, and query patterns.
paths:
  - "**/db/**/*.ts"
  - "**/database/**/*.ts"
  - "**/drizzle.config.ts"
  - "**/schema.ts"
  - "**/*schema*.ts"
user-invocable: false
---

Every table is defined with **typed column helpers** from `drizzle-orm/*-core`. Every insert uses **`.returning()`** to get the created record. Relations use the **`relations()` helper** for type-safe joins.

```typescript
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  authorId: uuid('author_id').references(() => users.id),
  published: boolean('published').default(false),
})

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}))
```

**Select** — `db.select().from(table).where(eq(table.col, val))`. Column subset: `.select({ name: users.name })`.

**Insert** — `db.insert(table).values({ ... }).returning()` — always `.returning()`.

**Update/Delete** — always with `.where()` clause. Never update/delete without condition.

**Relations query** — `db.query.users.findMany({ with: { posts: true } })`.

**Migrations** — `bun drizzle-kit generate` then `bun drizzle-kit migrate`.

**Transactions** — `db.transaction(async (tx) => { ... })` for multi-operation atomicity.

## NEVER

- **Insert without `.returning()`** — always get the created record back
- **Update/delete without `.where()`** — prevents accidental full-table operations
- **Raw SQL strings** — use Drizzle's query builder for type safety
- **Inline schema in route files** — schemas live in dedicated `schema.ts` files
- **Skip transactions** for multi-table writes — wrap in `db.transaction()`

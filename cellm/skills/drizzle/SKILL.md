---
description: Drizzle ORM patterns for type-safe database operations. Activates on schema files, db directories, and drizzle config to enforce proper schema definitions, relations, and query patterns. Use when editing database schemas, writing migrations, or composing Drizzle queries.
user-invocable: false
---

Typed column helpers from `drizzle-orm/*-core`. Every insert uses `.returning()`. Relations via `relations()` helper.

**Select** — `db.select().from(table).where(eq(col, val))`.

**Insert** — `db.insert(table).values({...}).returning()`.

**Update/Delete** — always with `.where()`.

**Relations** — `db.query.users.findMany({ with: { posts: true } })`.

**Migrations** — `bun drizzle-kit generate` then `bun drizzle-kit migrate`.

**Transactions** — `db.transaction(async (tx) => {...})` for multi-op atomicity.

## NEVER

- **Insert without `.returning()`** — always get created record
- **Update/delete without `.where()`** — prevents full-table ops
- **Raw SQL strings** — query builder for type safety
- **Inline schema in routes** — dedicated `schema.ts` files
- **Skip transactions** for multi-table writes

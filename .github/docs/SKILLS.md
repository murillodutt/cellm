# Skills Guide

> [Home](../README.md) > [Docs](INDEX.md) > **Skills**

Complete guide to CELLM's 29 skills: 7 context skills and 22 workflow skills.

---

## Overview

CELLM uses two types of skills to structure work:

- **Context Skills** (7): Framework and language expertise auto-loaded by file patterns. User-invocable: false. Always present during relevant work.
- **Workflow Skills** (18): Task orchestration patterns invoked explicitly as `/cellm:{name}`. Guide phases of development from planning through verification.

Skills provide frameworks for thinking, not tutorials. They inject patterns, rules, and decision-making structures.

---

## Context Skills

Context skills auto-load based on file patterns. They provide framework-specific expertise without explicit invocation.

### nuxt

**Nuxt 4 full-stack patterns**

Auto-loads: `*.vue`, `nuxt.config.ts`, `server/**`

SSR/SSG rendering modes, hydration, composables (`useAsyncData`, `useFetch`, `useState`), auto-imports, server routes, Nitro engine, file structure patterns.

### vue

**Vue 3 Composition API patterns**

Auto-loads: `*.vue` files

Component structure with `<script setup>`, reactivity (ref, computed, watch), lifecycle hooks, props and emits, template syntax, slot patterns.

### typescript

**Type-safe patterns and utilities**

Auto-loads: `*.ts`, `*.tsx` files

Interfaces, generics with constraints, utility types (Pick, Omit, Partial), type guards and narrowing, strict mode enforcement, avoiding `any` types.

### tailwind

**Tailwind CSS v4 with semantic tokens**

Auto-loads: Files with Tailwind classes, `tailwind.config.ts`

Semantic tokens (primary, neutral, error, warning, success), responsive design breakpoints, dark mode variants, Nuxt UI component integration, spacing and layout utilities.

### pinia

**State management patterns**

Auto-loads: `stores/**`, files with `pinia` imports

Setup stores, reactive state, computed getters, async actions, store composition, persistence patterns, SSR considerations, loading and error state handling.

### drizzle

**Database ORM patterns**

Auto-loads: `db/**`, files with `drizzle` imports

Schema definition with type inference, select/insert/update/delete queries, relations (one-to-one, one-to-many, many-to-many), migrations, transaction patterns, error handling.

### dse

**DSE (Data Search Engine) patterns**

Auto-loads: Files with `dse` imports, when editing `.vue` with semantic search features

Semantic indexing, vector-based queries, embedding models, similarity search, context retrieval, indexing strategies for full-text and semantic search.

---

## Workflow Skills

Workflow skills guide phases of development. Invoked explicitly as `/cellm:{name}`.

### Discovery Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:discover` | Map existing codebase, find patterns, establish baseline |
| `/cellm:dse-discover` | Semantic search analysis of project structure and context |

### Planning Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:init` | Initialize project or feature, set up structure |
| `/cellm:plan` | Create task breakdown, timeline, dependencies |
| `/cellm:shape` | Define technical approach, architecture decisions |

### Specification Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:write-spec` | Write formal specification with requirements and constraints |
| `/cellm:spec` | Quick specification for component or feature |
| `/cellm:spec-treat` | Edge case and error handling specification |

### Task Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:create-tasks` | Break down plan into granular, executable tasks |
| `/cellm:orchestrate` | Coordinate multi-part implementation across files |

### Implementation Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:implement` | Execute implementation following specifications |
| `/cellm:inject` | Inject patterns or frameworks into existing code |

### Verification Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:arena` | Quality proving ground: prove, debug, gate, stress |

### Search Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:index` | Index and catalog patterns in codebase |
| `/cellm:oracle-search` | Semantic search for patterns, implementations, context |

### Status Phase

| Skill | Purpose |
|-------|---------|
| `/cellm:status` | Report progress, identify blockers, next steps |

---

## Skill Combinations

Context skills load together based on file type, providing integrated expertise:

| File Type | Context Skills |
|-----------|----------------|
| `*.vue` | vue, nuxt, tailwind, dse |
| `server/**/*.ts` | nuxt, typescript |
| `stores/*.ts` | pinia, typescript |
| `db/*.ts` | drizzle, typescript |
| `*.ts` (general) | typescript |

Workflow skills are invoked explicitly to guide specific phases of work.

---

## Skill Priority

When guidance conflicts, follow this priority:

1. **Anti-patterns** (always enforced)
2. **Project-specific** rules
3. **Framework-specific** context skills
4. **General** patterns

---

## Related Documentation

- [Commands Reference](COMMANDS.md) - All commands
- [Agents Guide](AGENTS.md) - Specialized agents
- [Features Overview](FEATURES.md) - All capabilities

[Back to Docs](INDEX.md) | [Back to Home](../README.md)

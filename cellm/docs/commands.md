# Skills Reference

> [Home](../README.md) > [Docs](README.md) > **Skills**

Complete reference for all CELLM skills. All skills use the `/cellm:` namespace.

---

## Overview

CELLM uses a **skills-only architecture** — every capability is a skill registered in `skills/{name}/SKILL.md`. There is no separate commands directory. Skills are invoked as `/cellm:{name}` and can also auto-load based on file context.

Skills are organized in two categories: **workflow skills** (invoked explicitly by the user) and **context skills** (auto-loaded based on file patterns).

---

## Workflow Skills

### Planning Phase

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:plan` | Product foundation (mission, roadmap, tech stack) | `/cellm:plan "my app"` |
| `/cellm:shape` | Feature research and shaping (requires plan mode) | `/cellm:shape` |
| `/cellm:write-spec` | Formalize shaping into technical specification | `/cellm:write-spec` |

### Execution Phase

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:create-tasks` | Break spec into dependency-ordered task groups | `/cellm:create-tasks` |
| `/cellm:orchestrate` | Execute tasks systematically via implementer | `/cellm:orchestrate` |
| `/cellm:implement` | Generate code from spec or direct instruction | `/cellm:implement "fix login bug"` |

### Validation Phase

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:arena` | Quality proving ground: prove, debug, gate, stress | `/cellm:arena prove` |

### Spec OS (Atomic Spec System)

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:spec` | Spec command center — list, create, status | `/cellm:spec create "feature"` |
| `/cellm:spec-treat` | Work through a spec check task by task | `/cellm:spec-treat "check title"` |

### Pattern Management

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:discover` | Extract tribal knowledge into pattern files | `/cellm:discover` |
| `/cellm:inject` | Load relevant patterns into context | `/cellm:inject core/typescript` |
| `/cellm:index` | Rebuild patterns index.yml | `/cellm:index` |

### Setup & Monitoring

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:init` | Oracle worker installation and management | `/cellm:init install` |
| `/cellm:status` | Check Oracle worker daemon status | `/cellm:status` |

### Design System

| Skill | Purpose | Usage |
|-------|---------|-------|
| `/cellm:dse-discover` | Bootstrap design system for a project | `/cellm:dse-discover ~/Dev/myapp` |
| `/cellm:oracle-search` | Semantic search through Oracle observations | `/cellm:oracle-search "auth pattern"` |

---

## Context Skills (Auto-Load)

These skills load automatically based on file patterns. They are not invoked directly.

| Skill | Technology | Trigger Patterns |
|-------|------------|------------------|
| `cellm:nuxt` | Nuxt 4 | `nuxt.config.ts`, `app/**`, `server/**`, `pages/**` |
| `cellm:vue` | Vue 3 | `*.vue`, `composables/**/*.ts` |
| `cellm:typescript` | TypeScript | `*.ts`, `*.tsx`, `types/**` |
| `cellm:tailwind` | Tailwind CSS v4 | `*.vue`, `*.css`, `tailwind.config.ts` |
| `cellm:pinia` | Pinia | `stores/**/*.ts`, `store/**/*.ts` |
| `cellm:drizzle` | Drizzle ORM | `db/**/*.ts`, `drizzle.config.ts`, `*schema*.ts` |
| `cellm:dse` | Design System Engine | `*.vue` (routes UI decisions to project tokens) |

---

## Typical Workflows

### Full Feature Development

```bash
/cellm:plan "my app"          # 1. Product foundation
/cellm:shape                   # 2. Shape the feature (plan mode)
/cellm:write-spec              # 3. Technical specification
/cellm:create-tasks            # 4. Task breakdown
/cellm:orchestrate             # 5. Execute tasks
/cellm:verify                  # 6. Quality gate
/cellm:status                  # 7. Check status anytime
```

### Quick Fix

```bash
/cellm:implement "fix the login bug"
/cellm:verify
```

### Pattern Discovery

```bash
/cellm:discover                # Find patterns in codebase
/cellm:index                   # Rebuild pattern index
/cellm:inject                  # Load patterns into context
```

### Quality Checks

```bash
/cellm:arena all               # Full test + typecheck + health
/cellm:arena labs              # Strategy labs only
/cellm:arena-debug "error"    # Automated debugging
```

---

## Skill Architecture

Each skill is a directory under `skills/` containing a `SKILL.md` file:

```
cellm/
  skills/
    plan/SKILL.md
    shape/SKILL.md
    ...
```

The `SKILL.md` frontmatter defines behavior:

```yaml
---
name: plan                           # Skill identifier
description: ...                     # Trigger description
argument-hint: "[product name]"      # Usage hint
allowed-tools: Read, Write, ...      # Sandboxed tool access
paths:                               # Auto-load file patterns (context skills)
  - "**/*.vue"
user-invocable: false                # Disable explicit invocation (context skills)
context: fork                        # Run in isolated context
agent: Explore                       # Delegate to specific agent
---
```

---

## Related Documentation

- [Skills Deep Dive](skills.md) - Framework skill details
- [Agents Guide](agents.md) - Agent specifications
- [Features Overview](features.md) - All capabilities

[Back to Docs](README.md) | [Back to Home](../README.md)

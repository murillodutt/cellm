# CELLM Plugins

Two Claude Code plugins: **cellm** (core) and **docops** (documentation).

## cellm

Context engineering for LLM-driven development. Provides skills, agents, hooks, and Oracle integration.

### Skills (18)

Auto-activated by file path. No manual invocation needed.

| Skill | Activates on | What it enforces |
|-------|-------------|-----------------|
| **vue** | `*.vue`, `composables/*.ts` | Script setup, typed props/emits, section ordering, storeToRefs |
| **nuxt** | `nuxt.config`, `app/`, `server/`, `pages/` | useFetch/useAsyncData, server/client separation, method suffixes |
| **typescript** | `*.ts`, `*.tsx`, `types/` | Strict typing, Zod validation, no `any`, explicit return types |
| **drizzle** | `db/`, `schema.ts`, `drizzle.config` | Typed schemas, `.returning()`, relations, transactions |
| **pinia** | `stores/` | Setup Store syntax, storeToRefs, single-domain stores |
| **tailwind** | `*.vue`, `*.css` | Semantic tokens only, no hardcoded colors, mobile-first, dark mode |
| **dse** | `*.vue` | Project-specific design tokens via `dse_search` before any UI work |

| Skill | Invocation | What it does |
|-------|-----------|-------------|
| **init** | `/cellm:init [mode]` | Interactive Oracle setup: install, status, update, doctor, restart, uninstall |
| **status** | `/cellm:status` | Quick Oracle worker health check |
| **arena** | `/cellm:arena [scope]` | Run test suites, typecheck, health checks with trend reporting |
| **arena-debug** | `/cellm:arena-debug <error>` | Iterative log-and-restart debugging (max 3 iterations, auto/interactive/observe modes) |
| **discover** | `/cellm:discover` | Extract tribal knowledge from codebase into pattern files |
| **inject** | `/cellm:inject [paths]` | Inject relevant patterns into current context |
| **index** | `/cellm:index` | Rebuild patterns index.yml |
| **plan** | `/cellm:plan` | Create mission.md, roadmap.md, tech-stack.md via guided Q&A |
| **shape** | `/cellm:shape` | Gather context and structure specs (requires plan mode) |
| **oracle-search** | `/cellm:oracle-search <query>` | Semantic search across Oracle observations |
| **dse-discover** | `/cellm:dse-discover [path]` | Bootstrap design system for a project |

### Agents (4)

| Agent | Model | Role |
|-------|-------|------|
| **architect** | opus | Plans features, defines architecture, writes specs. Never produces code. |
| **implementer** | sonnet | Implements features following specs and patterns. |
| **project-manager** | sonnet | Decomposes specs into tasks, orchestrates execution, tracks progress. |
| **reviewer** | sonnet | Reviews code against specs, patterns, and security standards. Read-only. |

### Hooks

| Event | What runs |
|-------|----------|
| **SessionStart** | ensure-oracle, configure-otel, init-session, inject-context |
| **UserPromptSubmit** | capture-prompt, inject-knowledge, inject-arena |
| **PreToolUse** `Edit\|Write` | check-node-tags (workflow node lock detection) |
| **PreToolUse** `Write\|Edit\|Bash` | version-guard (dependency version warning) |
| **PostToolUse** `Write\|Edit\|Bash\|...` | track-tool-use |
| **PreCompact** | capture-context |
| **Stop** | capture-context |

### Oracle

Worker daemon on port **31415**. Auto-started on SessionStart.

Provides: semantic search, persistent memory, pattern discovery, knowledge base, OTEL metrics, DSE (Design System Engine), workflow graph, stack tracker.

Data: `~/.cellm/` (never in repo).

---

## docops

Documentation maintenance with LLM-first templates, code evidence, and drift control.

### Skills (10)

| Skill | Invocation | What it does |
|-------|-----------|-------------|
| **init** | `/docops:init [docRoot]` | Bootstrap documentation structure with templates |
| **sync** | `/docops:sync [docRoot]` | Refresh code evidence, then gaps, then derived docs |
| **verify** | `/docops:verify [docRoot]` | Validate structure, links, evidence, normative vocabulary |
| **journal** | `/docops:journal [path]` | Generate JOURNAL.md from code evidence and project structure |
| **deprecate** | `/docops:deprecate <file>` | Mark doc for deprecation with grace period |
| **lifecycle** | `/docops:undeprecate`, `/docops:restore` | Undeprecate or restore archived documents |
| **prune** | `/docops:prune [docRoot]` | Archive deprecated docs, fix broken references |
| **gc** | `/docops:gc [docRoot]` | Clean resolved gaps, flag stale evidence, detect redundancy |
| **freshness** | `/docops:freshness [docRoot]` | Check/update evidence freshness (fresh/stale/expired) |
| **redundancy** | `/docops:redundancy [docRoot]` | Detect duplicate content across documentation |

### Agent (1)

| Agent | Model | Role |
|-------|-------|------|
| **docops-writer** | sonnet | Generates docs from code evidence. Evidence-first workflow, normative vocabulary. |

### Hooks

| Event | What runs |
|-------|----------|
| **Stop** | docops-hook (drift reminder) |
| **PreCompact** | docops-hook (drift reminder) |

### Configuration

`.claude/docops.json`:
```json
{
  "docRoot": "docs/technical",
  "conveyorFile": "project-conveyor.md",
  "language": "en"
}
```

### Document Types

| Type | Suffix | Purpose |
|------|--------|---------|
| Specification | `.spec.md` | What the system does |
| Reference | `.ref.md` | How it works |
| How-to | `.howto.md` | Step-by-step guide |
| Runbook | `.runbook.md` | Operational procedure |
| Decision | `ADR-YYYYMMDD-slug.md` | Architecture decision record |

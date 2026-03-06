# CELLM Plugins

Marketplace with 3 plugins for Claude Code: **cellm** (core), **docops** (documentation), **gdu** (Goold Design UI).

Architecture: skills-only. No `commands/` directories. Every capability is a `skills/{name}/SKILL.md`.

---

## cellm

Context engineering for LLM-driven development. 29 skills, 4 agents, 6 hook events, Oracle integration.

### Context Skills (3) — auto-loaded by file path

| Skill | Activates on | What it enforces |
|-------|-------------|-----------------|
| **typescript** | `*.ts`, `*.tsx`, `types/` | Strict typing, Zod validation, no `any`, explicit return types |
| **drizzle** | `db/`, `schema.ts`, `drizzle.config` | Typed schemas, `.returning()`, relations, transactions |
| **dse** | `*.vue` | Project-specific design tokens via `dse_search` before any UI work |

Context skills stack: editing a `server/api/*.ts` loads **typescript**.

### Workflow Skills (22) — invoked manually

| Skill | Invocation | What it does |
|-------|-----------|-------------|
| **init** | `/cellm:init [mode]` | Interactive Oracle setup: install, status, update, doctor, restart, uninstall |
| **plan** | `/cellm:plan [product]` | Create mission.md, roadmap.md, tech-stack.md via guided Q&A |
| **shape** | `/cellm:shape [feature]` | Gather context and structure specs (requires plan mode) |
| **write-spec** | `/cellm:write-spec [path]` | Formalize shaping into technical spec (spec.md) |
| **create-tasks** | `/cellm:create-tasks [path]` | Break spec into task groups with dependencies |
| **orchestrate** | `/cellm:orchestrate [path]` | Execute tasks systematically, delegate to agents |
| **implement** | `/cellm:implement [path]` | Generate code from spec following patterns |
| **verify** | `/cellm:verify [path]` | Quality gate: spec compliance, security, patterns |
| **spec** | `/cellm:spec [path]` | Quick-create spec folder structure |
| **spec-treat** | `/cellm:spec-treat [path]` | Analyze spec for edge cases and inconsistencies |
| **discover** | `/cellm:discover [focus]` | Extract tribal knowledge into pattern files |
| **inject** | `/cellm:inject [paths]` | Inject relevant patterns into current context |
| **index** | `/cellm:index [query]` | Rebuild patterns index.yml |
| **arena** | `/cellm:arena [scope]` | Run test suites, typecheck, health checks with trend reporting |
| **arena-debug** | `/cellm:arena-debug <error>` | Iterative log-and-restart debugging (max 3 iterations) |
| **oracle-search** | `/cellm:oracle-search <query>` | Semantic search across Oracle observations |
| **status** | `/cellm:status [verbose]` | Quick Oracle worker health check |
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

### Skills (12)

| Skill | Invocation | What it does |
|-------|-----------|-------------|
| **init** | `/docops:init [docRoot]` | Bootstrap documentation structure with templates |
| **sync** | `/docops:sync [docRoot]` | Refresh code evidence, then gaps, then derived docs |
| **verify** | `/docops:verify [docRoot]` | Validate structure, links, evidence, normative vocabulary |
| **journal** | `/docops:journal [path]` | Generate JOURNAL.md from code evidence and project structure |
| **deprecate** | `/docops:deprecate <file>` | Mark doc for deprecation with grace period |
| **undeprecate** | `/docops:undeprecate <file>` | Reverse deprecation, restore active status |
| **restore** | `/docops:restore <file>` | Restore archived document to active state |
| **prune** | `/docops:prune [docRoot]` | Archive deprecated docs, fix broken references |
| **gc** | `/docops:gc [docRoot]` | Clean resolved gaps, flag stale evidence, detect redundancy |
| **freshness** | `/docops:freshness [docRoot]` | Check/update evidence freshness (fresh/stale/expired) |
| **redundancy** | `/docops:redundancy [docRoot]` | Detect duplicate content across documentation |
| **lifecycle** | `/docops:lifecycle [action]` | Unified document lifecycle management |

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

---

## gdu

Goold Design UI. A rigorous Cognitive Framework for designing and architecting frontend interfaces within the Vue 3, Nuxt 4, and Tailwind ecosystem. 

It prevents "AI slop" by forcing the AI to verify architectural rules, DSE tokens, and Pinia state before writing code.

### Context Skills (4)

| Skill | Activates on | What it enforces |
|-------|-------------|-----------------|
| **nuxt** | `nuxt.config.ts`, `app/`, `server/`, `pages/` | useFetch/useAsyncData, server/client separation, Nitro patterns |
| **vue** | `*.vue`, `composables/*.ts` | Script setup, typed props/emits, section ordering, storeToRefs |
| **tailwind** | `*.vue`, `*.css`, `tailwind.config.ts` | Semantic tokens only, no hardcoded colors, mobile-first, dark mode |
| **pinia** | `stores/`, `store/` | Setup Store syntax, storeToRefs, single-domain stores |

### Workflow Skills (1)

| Skill | Invocation | What it does |
|-------|-----------|-------------|
| **gdu** | `/gdu:gdu` | Passive frontend architecture orchestrator. Triggers automatically on UI intent via hook. Enforces VERIFY -> DOCUMENT -> IMPLEMENT flow. |

### Agents (2)

| Agent | Model | Role |
|-------|-------|------|
| **gdu-architect** | opus | The planner. Verifies Tailwind config, queries Nuxt UI Skill (second brain), defines Pinia state, and writes the Markdown UI Spec. |
| **gdu-implementer** | sonnet | The builder. Executes the Spec with absolute fidelity. Blocks React-isms and strictly writes Vue 3 / Nuxt 4 code. |

### Hooks

| Event | What runs |
|-------|----------|
| **UserPromptSubmit** | interceptor.js (Detects UI intents, auto-installs Nuxt UI skill if missing, and injects GDU cognitive override) |

---

## Architecture

```
.claude-plugin/marketplace.json    # Plugin registry
cellm/                             # Core plugin (29 skills, 4 agents)
  .claude-plugin/plugin.json
  skills/                          # Flat: skills/{name}/SKILL.md
  agents/
  hooks/
  scripts/
  .mcp.json
docops/                            # Documentation plugin (12 skills, 1 agent)
  .claude-plugin/plugin.json
  skills/
  agents/
  hooks/
  scripts/
  templates/
gdu/                               # Goold Design UI plugin (1 skill, 2 agents)
  .claude-plugin/plugin.json
  skills/
  agents/
  hooks/
```

Skills-only: every capability is `skills/{name}/SKILL.md` with frontmatter (`name`, `description`, `argument-hint`, `allowed-tools`). Context skills add `paths` and `user-invocable: false` for auto-loading.

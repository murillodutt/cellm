# Skills Reference

> [Home](../README.md) > [Docs](INDEX.md) > **Skills Reference**

Complete reference for all CELLM skills and workflow invocations. CELLM uses a skills-only architecture—all functionality is accessed via skills invoked with `/cellm:`, `/docops:`, or `/dse:` prefixes.

---

## Overview

CELLM provides **29 skills** (22 workflow + 7 context), **12 DocOps skills**, and **1 DSE skill**.

**Context Skills** (auto-loaded): nuxt, vue, typescript, tailwind, pinia, drizzle, dse

**Workflow Skills** organized by phase:

| Phase | Skills |
|-------|--------|
| **Planning** | `/cellm:plan`, `/cellm:shape`, `/cellm:write-spec`, `/cellm:spec` |
| **Execution** | `/cellm:create-tasks`, `/cellm:orchestrate`, `/cellm:implement` |
| **Validation** | `/cellm:verify`, `/cellm:status` |
| **Pattern Management** | `/cellm:discover`, `/cellm:inject`, `/cellm:index` |
| **Quality & Arena** | `/cellm:arena`, `/cellm:spec-treat` |
| **Discovery** | `/cellm:dse-discover` |
| **Setup & Monitoring** | `/cellm:oracle`, `/cellm:oracle-search` |

**DocOps Skills**: `/docops:init`, `/docops:sync`, `/docops:verify`, plus 9 additional skills

**DSE Skills**: `/dse:frontend-ui`

---

## Context Skills (Auto-Loaded)

Context skills are automatically available and provide framework/language awareness. They are NOT invoked directly.

| Skill | Purpose |
|-------|---------|
| **nuxt** | Nuxt 3 framework context and patterns |
| **vue** | Vue 3 component and composition API patterns |
| **typescript** | TypeScript type system and best practices |
| **tailwind** | Tailwind CSS utility and design system |
| **pinia** | Pinia state management patterns |
| **drizzle** | Drizzle ORM schema and query patterns |
| **dse** | Domain-Specific Engine patterns and utilities |

---

## CELLM Workflow Skills

### Planning Phase

#### /cellm:plan

**Purpose:** Establish foundational product documentation

**Description:** Creates mission, roadmap, and tech stack documentation through interactive conversation to gather product vision.

**Usage:**
```bash
/cellm:plan "my SaaS product"
```

---

#### /cellm:shape

**Purpose:** Research and define requirements for a feature

**Description:** Clarifies scope through Q&A, gathers visual references, identifies similar code, surfaces relevant patterns, and creates spec folder with documentation.

**Usage:**
```bash
/cellm:shape
```

---

#### /cellm:write-spec

**Purpose:** Create detailed technical specification

**Description:** Formalizes requirements from shaping with technical design, data models, API contracts, and component structure documentation.

**Usage:**
```bash
/cellm:write-spec
```

---

#### /cellm:spec

**Purpose:** Full specification generation workflow

**Description:** Combines shaping and spec writing into a single orchestrated workflow for rapid feature specification.

**Usage:**
```bash
/cellm:spec
```

---

### Execution Phase

#### /cellm:create-tasks

**Purpose:** Break specification into actionable tasks

**Description:** Reads spec.md, decomposes into logical task groups, sorts by dependencies (critical path first), and creates tasks.md.

**Usage:**
```bash
/cellm:create-tasks
```

---

#### /cellm:orchestrate

**Purpose:** Execute tasks systematically

**Description:** Reads tasks.md, identifies next executable group, delegates to implementer, updates task status, and reports completion.

**Usage:**
```bash
/cellm:orchestrate
```

---

#### /cellm:implement

**Purpose:** Generate code from specification

**Description:** Reads spec.md, checks for reusable code, implements following patterns and rules, updates task progress, and self-reviews for compliance.

**Usage:**
```bash
/cellm:implement
```

---

### Validation Phase

#### /cellm:verify

**Purpose:** Quality gate validation

**Description:** Reviews code against checklist, validates spec compliance, checks for security vulnerabilities, and documents findings with file:line references.

**Severity Levels:**
- **CRITICAL** - Blocks deployment
- **WARNING** - Should fix before merge
- **INFO** - Improvement suggestion

**Usage:**
```bash
/cellm:verify
```

---

#### /cellm:status

**Purpose:** Display current project status

**Description:** Shows phase, active spec, task progress, completion breakdown, and task status symbols.

**Usage:**
```bash
/cellm:status
```

---

### Pattern Management Phase

#### /cellm:discover

**Purpose:** Find patterns in your codebase

**Description:** Searches for code patterns, identifies reusable structures, and reports pattern usage.

**Usage:**
```bash
/cellm:discover
```

---

#### /cellm:inject

**Purpose:** Apply patterns consistently to code

**Description:** Reads pattern definitions and applies to new or existing code to ensure consistency.

**Usage:**
```bash
/cellm:inject
```

---

#### /cellm:index

**Purpose:** Search available patterns

**Description:** Lists all available patterns, searches by keyword, and shows pattern details.

**Usage:**
```bash
/cellm:index
```

---

### Quality & Arena Phase

#### /cellm:arena

**Purpose:** Interactive development sandbox

**Description:** Creates isolated sandbox environment for experimenting with features, patterns, or approaches without affecting main codebase.

**Usage:**
```bash
/cellm:arena
```

---

#### /cellm:arena-debug

**Purpose:** Debug and diagnose arena issues

**Description:** Provides diagnostic tools and debugging context for arena sandbox environments.

**Usage:**
```bash
/cellm:arena-debug
```

---

#### /cellm:spec-treat

**Purpose:** Refine and validate specifications

**Description:** Applies quality checks to specifications, validates completeness, and suggests improvements.

**Usage:**
```bash
/cellm:spec-treat
```

---

### Discovery Phase

#### /cellm:dse-discover

**Purpose:** Discover DSE (Domain-Specific Engine) patterns

**Description:** Identifies and catalogs domain-specific engine patterns available in your codebase.

**Usage:**
```bash
/cellm:dse-discover
```

---

### Setup & Monitoring Phase

#### /cellm:oracle

**Purpose:** CELLM Oracle worker setup and maintenance

**Description:** Guided setup with interactive menu for installation, status checks, diagnostics, configuration, and updates of the Oracle daemon at `~/.cellm/`.

**Usage:**
```bash
/cellm:oracle
```

---

#### /cellm:oracle-search

**Purpose:** Search Oracle knowledge base

**Description:** Queries the Oracle worker daemon for patterns, observations, and cached knowledge relevant to your project.

**Usage:**
```bash
/cellm:oracle-search "query terms"
```

---

## DocOps Skills

DocOps is an optional plugin focused on documentation maintenance and synchronization.

| Skill | Purpose |
|-------|---------|
| `/docops:init` | Initialize doc structure and templates |
| `/docops:sync` | Refresh code evidence and gaps |
| `/docops:verify` | Validate structure and normative vocabulary |
| `/docops:auto-sync` | Automatic documentation synchronization |
| `/docops:template-gen` | Generate documentation templates |
| `/docops:evidence-scan` | Scan code for documentation evidence |
| `/docops:gap-report` | Generate documentation gap analysis |
| `/docops:normalize` | Normalize vocabulary across docs |
| `/docops:validate-schema` | Validate documentation schema |
| `/docops:link-check` | Check and repair documentation links |
| `/docops:audit` | Audit documentation completeness |
| `/docops:metrics` | Generate documentation metrics |

See [DocOps Plugin](../docops/README.md) for detailed documentation.

---

## DSE Skills

DSE (Domain-Specific Engine) provides specialized frontend capabilities.

| Skill | Purpose |
|-------|---------|
| `/dse:frontend-ui` | Generate and refine frontend UI components using DSE patterns |

See [DSE Plugin](../dse/README.md) for detailed documentation.

---

## Typical Workflows

### Full Feature Development

```bash
# 1. Plan the product (if new project)
/cellm:plan "my app"

# 2. Shape the feature
/cellm:shape

# 3. Write detailed spec
/cellm:write-spec

# 4. Create tasks from spec
/cellm:create-tasks

# 5. Implement the code
/cellm:implement

# 6. Verify quality
/cellm:verify

# 7. Check status anytime
/cellm:status
```

### Quick Spec Workflow

```bash
# 1. Combined shape and spec in one workflow
/cellm:spec

# 2. Create tasks
/cellm:create-tasks

# 3. Implement
/cellm:implement
```

### Quick Fix Workflow

```bash
# 1. Implement directly
/cellm:implement "fix the login bug"

# 2. Verify
/cellm:verify
```

### Pattern Discovery & Application

```bash
# 1. Find patterns in codebase
/cellm:discover

# 2. Search for specific pattern
/cellm:index "authentication"

# 3. Apply patterns to code
/cellm:inject
```

### Arena Quality Checks

```bash
# 1. Run full quality checks
/cellm:arena prove

# 2. Debug a failing test
/cellm:arena debug "TypeError: cannot read property"

# 3. Quality gate before commit
/cellm:arena gate
```

---

## Skills Quick Reference

| Skill | Phase | Purpose |
|-------|-------|---------|
| `/cellm:plan` | Planning | Product foundation |
| `/cellm:shape` | Planning | Feature research & requirements |
| `/cellm:write-spec` | Planning | Technical specification |
| `/cellm:spec` | Planning | Combined shape + spec workflow |
| `/cellm:create-tasks` | Execution | Break spec into tasks |
| `/cellm:orchestrate` | Execution | Execute tasks systematically |
| `/cellm:implement` | Execution | Code generation from spec |
| `/cellm:verify` | Validation | Quality gate & security checks |
| `/cellm:status` | Validation | Progress reporting |
| `/cellm:discover` | Pattern Mgmt | Find codebase patterns |
| `/cellm:inject` | Pattern Mgmt | Apply patterns to code |
| `/cellm:index` | Pattern Mgmt | Search available patterns |
| `/cellm:arena` | Quality | Quality proving ground (prove/debug/gate/stress) |
| `/cellm:spec-treat` | Quality | Refine specifications |
| `/cellm:dse-discover` | Discovery | Find DSE patterns |
| `/cellm:oracle` | Setup | Oracle worker setup & maintenance |
| `/cellm:oracle-search` | Setup | Query Oracle knowledge base |

---

## DocOps Quick Reference

| Skill | Purpose |
|-------|---------|
| `/docops:init` | Initialize doc structure and templates |
| `/docops:sync` | Refresh code evidence and gaps |
| `/docops:verify` | Validate structure and vocabulary |
| `/docops:auto-sync` | Automatic synchronization |
| `/docops:template-gen` | Generate documentation templates |
| `/docops:evidence-scan` | Scan code for evidence |
| `/docops:gap-report` | Generate gap analysis |
| `/docops:normalize` | Normalize vocabulary |
| `/docops:validate-schema` | Validate doc schema |
| `/docops:link-check` | Check documentation links |
| `/docops:audit` | Audit completeness |
| `/docops:metrics` | Generate metrics |

---

## DSE Quick Reference

| Skill | Purpose |
|-------|---------|
| `/dse:frontend-ui` | Generate frontend UI components |

---

## Related Documentation

- [Getting Started](GETTING-STARTED.md) - Quick setup
- [Features Overview](FEATURES.md) - All capabilities
- [DocOps Plugin](../docops/README.md) - Documentation automation
- [DSE Plugin](../dse/README.md) - Domain-Specific Engine

[Back to Docs](INDEX.md) | [Back to Home](../README.md)

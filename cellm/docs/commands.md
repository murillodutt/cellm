# Commands Reference

> [Home](../README.md) > [Docs](README.md) > **Commands**

Complete reference for all CELLM workflow commands.

---

## Overview

CELLM provides workflow commands organized into phases. All commands use the `/cellm:` namespace.

| Phase | Commands |
|-------|----------|
| **Planning** | `/cellm:plan`, `/cellm:shape`, `/write-spec` |
| **Execution** | `/create-tasks`, `/orchestrate-tasks`, `/implement` |
| **Validation** | `/verify`, `/cellm:status` |
| **Pattern Management** | `/cellm:discover`, `/cellm:inject`, `/cellm:index` |
| **Setup & Monitoring** | `/cellm:init` |

---

## Planning Commands

### /cellm:plan

**Purpose:** Establish foundational product documentation

**Agent:** Architect

**What it does:**
- Creates mission, roadmap, and tech stack documentation
- Interactive conversation to gather product vision
- Checks for existing patterns to inform tech stack

**Output:**
```
cellm-core/project/product/
├── mission.md      # Core purpose and vision
├── roadmap.md      # Feature timeline (MVP + future)
└── tech-stack.md   # Technology choices
```

**Usage:**
```bash
/cellm:plan "my SaaS product"
```

**Process:**
1. Check for existing product docs
2. Gather product vision (problem, users, solution)
3. Define roadmap (MVP features, future features)
4. Establish tech stack
5. Generate documentation files

---

### /cellm:shape

**Purpose:** Research and define requirements for a feature

**Agent:** Architect

**Prerequisites:** Must be run in plan mode

**What it does:**
- Clarifies what's being built through Q&A
- Gathers visual references (mockups, screenshots)
- Identifies similar code in codebase
- Surfaces relevant patterns
- Creates spec folder with documentation

**Output:**
```
cellm-core/specs/{YYYY-MM-DD-HHMM-feature-slug}/
├── plan.md         # Full implementation plan
├── shape.md        # Shaping notes and decisions
├── patterns.md     # Applicable patterns
├── references.md   # Similar code references
└── visuals/        # Mockups, screenshots
```

**Usage:**
```bash
# Enter plan mode first
/cellm:shape
```

**Process:**
1. Clarify scope (what are we building?)
2. Gather visuals (mockups, examples)
3. Identify reference implementations
4. Check product context alignment
5. Surface relevant patterns
6. Generate spec folder
7. Structure the plan

---

### /write-spec

**Purpose:** Create detailed technical specification

**Agent:** Architect

**What it does:**
- Formalizes requirements from shaping
- Creates technical design document
- Defines data models and API contracts
- Documents component structure

**Output:**
- Detailed spec.md with technical design
- Data models
- API contracts
- Component structure

---

## Execution Commands

### /create-tasks

**Purpose:** Break specification into actionable tasks

**Agent:** Project Manager

**What it does:**
- Reads spec.md for requirements
- Decomposes into logical task groups
- Sorts by dependencies (critical path first)
- Creates tasks.md

**Output:**
```markdown
# Tasks for [Feature Name]

## Group 1: Foundation
- [ ] Task 1.1 - Description
- [ ] Task 1.2 - Description

## Group 2: Core Features (depends on Group 1)
- [ ] Task 2.1 - Description
- [ ] Task 2.2 - Description

## Group 3: Polish (depends on Group 2)
- [ ] Task 3.1 - Description
```

**Usage:**
```bash
/create-tasks
```

---

### /orchestrate-tasks

**Purpose:** Execute tasks systematically

**Agent:** Project Manager

**What it does:**
- Reads tasks.md
- Identifies next executable group
- Delegates to implementer agent
- Updates task status
- Reports completion

**Usage:**
```bash
/orchestrate-tasks
```

---

### /implement

**Purpose:** Generate code from specification

**Agent:** Implementer

**What it does:**
- Reads spec.md requirements
- Checks for reusable code
- Implements following patterns and rules
- Updates tasks.md with progress
- Self-reviews for rule compliance

**Rules enforced:**
- No `any` types
- No hardcoded colors (semantic tokens only)
- No sync I/O
- Composition API always
- Code limits (1000 lines/file, 50/function)
- Error handling required

**Usage:**
```bash
/implement
```

---

## Validation Commands

### /verify

**Purpose:** Quality gate validation

**Agent:** Reviewer

**What it does:**
- Reviews code against checklist
- Validates spec compliance
- Checks for security vulnerabilities
- Documents findings with file:line references

**Review Checklist:**

| Category | Checks |
|----------|--------|
| **Quality** | No TS errors, no `any`, no console.log, code limits |
| **Spec Compliance** | User stories, requirements, acceptance criteria |
| **Standards** | Naming, imports, file structure, comments |
| **Patterns** | Anti-patterns avoided, stack patterns followed |
| **Security** | Input validation, SQL injection, XSS, data protection |

**Output:**
```markdown
# Verification Report

## Summary
- Files reviewed: X
- Issues found: Y
- Status: PASS/FAIL

## Findings

### [CRITICAL] Issue Title
- File: path/to/file.ts:42
- Description: ...
- Recommendation: ...
```

**Severity Levels:**
- **CRITICAL** - Blocks deployment, must fix
- **WARNING** - Should fix before merge
- **INFO** - Improvement suggestion

**Usage:**
```bash
/verify
```

---

### /cellm:status

**Purpose:** Display current project status

**Agent:** Project Manager

**Output:**
```
Project: [Name]
Phase: [Planning|Implementation|Review]

Active Spec: spec-name.md
Progress: 8/15 tasks (53%)

Completed:
  [x] Group 1: Foundation (4/4)
  [x] Group 2: Data Layer (4/4)

In Progress:
  [ ] Group 3: API Layer (0/4)

Pending:
  [ ] Group 4: UI Components
  [ ] Group 5: Integration
```

**Task Status Symbols:**
```
[ ] Pending
[~] In Progress
[x] Completed
[!] Blocked
[-] Cancelled
```

**Usage:**
```bash
/cellm:status
```

---

## Pattern Management Commands

### /cellm:discover

**Purpose:** Find patterns in your codebase

**What it does:**
- Searches for code patterns
- Identifies reusable structures
- Reports pattern usage

**Usage:**
```bash
/cellm:discover
```

---

### /cellm:inject

**Purpose:** Apply patterns consistently to code

**What it does:**
- Reads pattern definitions
- Applies to new or existing code
- Ensures consistency

**Usage:**
```bash
/cellm:inject
```

---

### /cellm:index

**Purpose:** Search available patterns

**What it does:**
- Lists all available patterns
- Searches by keyword
- Shows pattern details

**Usage:**
```bash
/cellm:index
```

---

## Setup & Monitoring Commands

### /cellm:init

**Purpose:** Interactive Oracle setup and maintenance

**What it does:**
- Guided Oracle installation with visual feedback
- Interactive menu with 8 main options
- Doctor mode with 6 diagnostic checks
- Advanced configuration (port, data directory, logs)
- Update and maintenance tools

**Interactive Menu:**
```
1. Install Oracle (first time setup)
2. Check Status (view current state)
3. Update (upgrade to latest version)
4. Doctor (diagnose and fix issues)
5. Restart Worker (if stuck or slow)
6. Uninstall (remove Oracle completely)
7. Advanced Options
8. Exit
```

**Usage:**
```bash
# Interactive mode (recommended)
/cellm:init

# Direct command-line modes
/cellm:init install   # First-time installation
/cellm:init status    # Check current state
/cellm:init update    # Upgrade to latest
/cellm:init doctor    # Run diagnostics
/cellm:init restart   # Restart worker
/cellm:init uninstall # Remove Oracle
```

**Doctor Mode:**
Runs 6 automatic checks:
1. Dependencies (Bun runtime)
2. Installation verification
3. Worker status test
4. Port availability check
5. Database integrity
6. MCP configuration

Each issue found is automatically fixed with user confirmation.

**Advanced Options:**
- Change worker port (1024-65535)
- Change data directory
- View logs (last 50 lines)
- Clear cache (preserves observations)
- Reset configuration (preserves database)

---

## Typical Workflow

### Full Feature Development

```bash
# 1. Plan the product (if new project)
/cellm:plan "my app"

# 2. Shape the feature (in plan mode)
/cellm:shape

# 3. Create tasks from spec
/create-tasks

# 4. Implement the code
/implement

# 5. Verify quality
/verify

# 6. Check status anytime
/cellm:status
```

### Quick Fix Workflow

```bash
# 1. Implement directly
/implement "fix the login bug"

# 2. Verify
/verify
```

### Pattern Discovery

```bash
# 1. Find patterns in codebase
/cellm:discover

# 2. Search for specific pattern
/cellm:index "authentication"

# 3. Apply patterns to code
/cellm:inject
```

---

## Command Quick Reference

| Command | Agent | Purpose | Output |
|---------|-------|---------|--------|
| `/cellm:init` | - | Oracle setup & maintenance | Interactive installation/config |
| `/cellm:plan` | Architect | Product foundation | mission.md, roadmap.md, tech-stack.md |
| `/cellm:shape` | Architect | Feature research | spec folder with plan, shape, patterns |
| `/write-spec` | Architect | Technical spec | spec.md |
| `/create-tasks` | PM | Task breakdown | tasks.md |
| `/orchestrate-tasks` | PM | Execute tasks | Updated tasks.md |
| `/implement` | Implementer | Code generation | Working code |
| `/verify` | Reviewer | Quality check | verification report |
| `/cellm:status` | PM | Progress check | Status display |
| `/cellm:discover` | - | Pattern search | Pattern list |
| `/cellm:inject` | - | Apply patterns | Updated code |
| `/cellm:index` | - | Search patterns | Pattern index |

---

## Related Documentation

- [Getting Started](getting-started.md) - Quick setup
- [Agents Guide](agents.md) - Agent details
- [Features Overview](features.md) - All capabilities

[Back to Docs](README.md) | [Back to Home](../README.md)

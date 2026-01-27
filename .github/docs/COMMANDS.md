# Commands Reference

> [Home](../README.md) > [Docs](README.md) > **Commands**

Complete reference for all CELLM workflow commands.

---

## Overview

CELLM provides 10 workflow commands organized into phases:

| Phase | Commands |
|-------|----------|
| **Planning** | `/plan-product`, `/shape-spec`, `/write-spec` |
| **Execution** | `/create-tasks`, `/orchestrate-tasks`, `/implement` |
| **Validation** | `/verify`, `/status` |
| **Pattern Management** | `/discover-patterns`, `/inject-patterns`, `/index-patterns` |
| **Setup & Monitoring** | `/cellm-init`, `/oracle-status` |

---

## Planning Commands

### /plan-product

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
claude /plan-product "my SaaS product"
```

**Process:**
1. Check for existing product docs
2. Gather product vision (problem, users, solution)
3. Define roadmap (MVP features, future features)
4. Establish tech stack
5. Generate documentation files

---

### /shape-spec

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
claude /shape-spec
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
claude /create-tasks
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
claude /orchestrate-tasks
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
claude /implement
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
claude /verify
```

---

### /status

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
claude /status
```

---

## Pattern Management Commands

### /discover-patterns

**Purpose:** Find patterns in your codebase

**What it does:**
- Searches for code patterns
- Identifies reusable structures
- Reports pattern usage

**Usage:**
```bash
claude /discover-patterns
```

---

### /inject-patterns

**Purpose:** Apply patterns consistently to code

**What it does:**
- Reads pattern definitions
- Applies to new or existing code
- Ensures consistency

**Usage:**
```bash
claude /inject-patterns
```

---

### /index-patterns

**Purpose:** Search available patterns

**What it does:**
- Lists all available patterns
- Searches by keyword
- Shows pattern details

**Usage:**
```bash
claude /index-patterns
```

---

## Setup & Monitoring Commands

### /cellm-init

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
claude /cellm-init

# Direct command-line modes
claude /cellm-init install   # First-time installation
claude /cellm-init status    # Check current state
claude /cellm-init update    # Upgrade to latest
claude /cellm-init doctor    # Run diagnostics
claude /cellm-init restart   # Restart worker
claude /cellm-init uninstall # Remove Oracle
```

**Doctor Mode:**
Runs 6 automatic checks:
1. Dependencies (Node.js, npx, Bun)
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

### /oracle-status

**Purpose:** Check Oracle worker daemon status

**Agent:** Project Manager

**What it does:**
- Reads worker configuration
- Calls health endpoint
- Reports status in table format

**Output:**
```
[+] Oracle Worker: Running
[+] MCP Server: Connected
[+] Database: Ready
[+] Embeddings: Loaded

| Field    | Value          |
|----------|----------------|
| Status   | online         |
| Port     | 31415          |
| Uptime   | 2h 34m         |
| Database | ~/.cellm/oracle.db |
```

**Usage:**
```bash
claude /oracle-status
```

---

## Typical Workflow

### Full Feature Development

```bash
# 1. Plan the product (if new project)
claude /plan-product "my app"

# 2. Shape the feature (in plan mode)
claude /shape-spec

# 3. Create tasks from spec
claude /create-tasks

# 4. Implement the code
claude /implement

# 5. Verify quality
claude /verify

# 6. Check status anytime
claude /status
```

### Quick Fix Workflow

```bash
# 1. Implement directly
claude /implement "fix the login bug"

# 2. Verify
claude /verify
```

### Pattern Discovery

```bash
# 1. Find patterns in codebase
claude /discover-patterns

# 2. Search for specific pattern
claude /index-patterns "authentication"

# 3. Apply patterns to code
claude /inject-patterns
```

---

## Command Quick Reference

| Command | Agent | Purpose | Output |
|---------|-------|---------|--------|
| `/cellm-init` | - | Oracle setup & maintenance | Interactive installation/config |
| `/plan-product` | Architect | Product foundation | mission.md, roadmap.md, tech-stack.md |
| `/shape-spec` | Architect | Feature research | spec folder with plan, shape, patterns |
| `/write-spec` | Architect | Technical spec | spec.md |
| `/create-tasks` | PM | Task breakdown | tasks.md |
| `/orchestrate-tasks` | PM | Execute tasks | Updated tasks.md |
| `/implement` | Implementer | Code generation | Working code |
| `/verify` | Reviewer | Quality check | verification report |
| `/status` | PM | Progress check | Status display |
| `/discover-patterns` | - | Pattern search | Pattern list |
| `/inject-patterns` | - | Apply patterns | Updated code |
| `/index-patterns` | - | Search patterns | Pattern index |
| `/oracle-status` | PM | Health check | Status table |

---

## Related Documentation

- [Getting Started](getting-started.md) - Quick setup
- [Agents Guide](agents.md) - Agent details
- [Features Overview](features.md) - All capabilities

[Back to Docs](README.md) | [Back to Home](../README.md)

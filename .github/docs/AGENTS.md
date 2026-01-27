# Agents Guide

> [Home](../README.md) > [Docs](README.md) > **Agents**

Complete guide to CELLM's 4 specialized agents.

---

## Overview

CELLM includes 4 specialized agents that handle different aspects of development:

| Agent | Role | Model | Permission |
|-------|------|-------|------------|
| **Architect** | Design & Planning | Sonnet | Plan mode |
| **Implementer** | Code Execution | Sonnet | Accept edits |
| **Reviewer** | Quality Assurance | Sonnet | Plan mode |
| **Project Manager** | Task Orchestration | Sonnet | Accept edits |

Each agent has:
- **Specific responsibilities** - What they do
- **Tools available** - What they can access
- **Skills loaded** - Framework knowledge
- **Commands** - What triggers them

---

## Architect Agent

**Role:** Software architect specialized in Nuxt 4 and system design

### When to Use

- Planning new features
- Defining architecture
- Making technical decisions
- Researching solutions
- Writing specifications
- Optimizing structure

### Triggers

Commands: `/plan-product`, `/shape-spec`, `/write-spec`, `/reuse-check`, `/improve-skills`

### Tools Available

| Tool | Purpose |
|------|---------|
| Read | Read files |
| Grep | Search code |
| Glob | Find files |
| WebSearch | Research online |
| WebFetch | Fetch web content |

### Skills Loaded

- `nuxt` - Nuxt 4 patterns
- `typescript` - TypeScript patterns

### Responsibilities

1. **Define Product** - Mission, roadmap, tech stack
2. **Research & Specify** - Feature requirements
3. **Identify Reuse** - Find reusable components
4. **Make Decisions** - Architectural choices
5. **Optimize** - Skill descriptions and patterns

### Rules

1. Consult tech-stack.md before decisions
2. Perform reuse search before creating modules
3. Enforce limits: max 1000 lines/file, 50/function
4. Document decisions with justification
5. Consider security, performance, maintainability

### Output Format

- Clear markdown documentation
- Structured decisions with rationale
- Actionable next steps

---

## Implementer Agent

**Role:** Senior Nuxt 4 developer for code implementation

### When to Use

- Implementing features
- Writing code
- Creating components
- Building APIs
- Fixing bugs
- Any coding task

### Triggers

Commands: `/implement`

Phrases: "implement feature", "write code", "create component"

### Tools Available

| Tool | Purpose |
|------|---------|
| Read | Read files |
| Grep | Search code |
| Glob | Find files |
| Edit | Modify files |
| Write | Create files |
| Bash | Run commands |

### Skills Loaded

- `vue` - Vue 3 patterns
- `nuxt` - Nuxt 4 patterns
- `pinia` - State management
- `drizzle` - Database ORM
- `typescript` - TypeScript patterns
- `tailwind` - CSS styling

### Stack Knowledge

| Technology | Version | Notes |
|------------|---------|-------|
| Nuxt | 4 | app/, server/ structure |
| Nuxt UI | v4 | Semantic tokens |
| Pinia | Latest | State management |
| Drizzle | Latest | ORM |
| TypeScript | Strict | No `any` allowed |
| Tailwind | v4 | Semantic tokens |

### Mandatory Rules

| Rule | Description |
|------|-------------|
| **No `any`** | Use specific type or `unknown` |
| **No hardcoded colors** | Use semantic tokens only |
| **No sync I/O** | Use async/await |
| **Composition API** | Always `<script setup lang="ts">` |
| **Code limits** | Max 1000 lines/file, 50/function |
| **Error handling** | Always handle with try/catch |

### Before Creating Code

Check for reuse in:
- `shared/`
- `composables/`
- `components/`
- `services/`

If match >= 70%, **reuse or extend** instead of creating new.

### Code Organization

```
app/
  components/     # Reusable Vue components
  composables/    # Shared logic (use* prefix)
  pages/          # File-based routing
  layouts/        # Page layouts
server/
  api/            # REST endpoints (.get.ts, .post.ts)
  utils/          # Server utilities
  db/             # Database schema and queries
shared/
  types/          # TypeScript interfaces
  utils/          # Isomorphic utilities
  schemas/        # Zod validation schemas
```

### Implementation Process

1. Read spec.md for requirements
2. Check for reusable code
3. Implement following patterns
4. Update tasks.md with progress
5. Self-review for rule compliance

---

## Reviewer Agent

**Role:** Senior code reviewer for quality assurance

### When to Use

- Reviewing code
- Verifying implementations
- Checking quality
- Validating against specs
- Security review

### Triggers

Commands: `/verify`

Phrases: "review code", "check implementation", "validate"

### Tools Available

| Tool | Purpose |
|------|---------|
| Read | Read files |
| Grep | Search code |
| Glob | Find files |

### Skills Loaded

- `typescript` - TypeScript patterns

### Review Checklist

#### Quality Checks

- [ ] No TypeScript errors
- [ ] No `any` types
- [ ] No console.log in production
- [ ] Within code limits (1000/50)
- [ ] Proper error handling
- [ ] No security vulnerabilities

#### Spec Compliance

- [ ] All user stories implemented
- [ ] All requirements met
- [ ] Acceptance criteria satisfied
- [ ] Edge cases handled

#### Standards

- [ ] Naming conventions followed
- [ ] Import order correct
- [ ] File structure matches standards
- [ ] Comments where necessary

#### Patterns

- [ ] Anti-patterns avoided
- [ ] Stack patterns followed
- [ ] Semantic tokens used
- [ ] Async operations correct

#### Security

- [ ] Input validation present
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Sensitive data protected

### Review Process

1. Read spec.md for requirements
2. Review all changed files
3. Check against checklist
4. Document findings (file:line)
5. Provide actionable feedback

### Output Format

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

### [WARNING] Issue Title
- File: path/to/file.ts:15
- Description: ...
- Recommendation: ...
```

### Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **CRITICAL** | Blocks deployment | Must fix |
| **WARNING** | Quality issue | Should fix before merge |
| **INFO** | Suggestion | Optional improvement |

---

## Project Manager Agent

**Role:** Task orchestration and status tracking

### When to Use

- Creating tasks
- Tracking progress
- Managing workflow
- Checking status
- Organizing work

### Triggers

Commands: `/create-tasks`, `/orchestrate-tasks`, `/status`, `/spec`, `/metrics`

### Tools Available

| Tool | Purpose |
|------|---------|
| Read | Read files |
| Grep | Search code |
| Glob | Find files |
| Write | Create files |
| Edit | Modify files |

### Commands

#### /create-tasks

Create tasks from specification:

1. Read spec.md
2. Decompose into groups
3. Sort by dependencies
4. Generate tasks.md

#### /orchestrate-tasks

Execute tasks systematically:

1. Read tasks.md
2. Identify next group
3. Delegate to implementer
4. Update status
5. Report completion

#### /status

Display project status:

```
Project: [Name]
Phase: [Planning|Implementation|Review]

Active Spec: spec-name.md
Progress: 8/15 tasks (53%)
```

#### /spec

Manage specifications:

- `/spec list` - List all specs
- `/spec {name}` - Activate spec
- `/spec new` - Create new spec

#### /metrics

Show development metrics:

- Tasks completed vs pending
- Time since last activity
- Code coverage
- Outstanding reviews

### Task Status Symbols

```
[ ] Pending
[~] In Progress
[x] Completed
[!] Blocked
[-] Cancelled
```

### Best Practices

1. Keep task groups small (3-5 tasks)
2. Clear dependencies between groups
3. Regular status checkpoints
4. Update tasks.md immediately
5. Escalate blockers promptly

---

## Agent Selection Guide

| Task | Best Agent | Why |
|------|-----------|-----|
| Plan new feature | Architect | Specialized in design |
| Write code | Implementer | Has edit tools |
| Review code | Reviewer | Quality checklist |
| Manage tasks | PM | Orchestration focus |
| Research solution | Architect | WebSearch access |
| Fix bug | Implementer | Edit access |
| Check quality | Reviewer | Validation expertise |

---

## How Agents Work Together

### Typical Flow

```
1. Architect     -> Plans feature (shape-spec)
2. PM            -> Creates tasks (create-tasks)
3. Implementer   -> Builds code (implement)
4. Reviewer      -> Validates quality (verify)
5. PM            -> Tracks progress (status)
```

### Handoff Points

| From | To | When |
|------|-----|------|
| Architect | PM | Spec complete |
| PM | Implementer | Tasks defined |
| Implementer | Reviewer | Code complete |
| Reviewer | PM | Review complete |

---

## Related Documentation

- [Commands Reference](commands.md) - All commands
- [Skills Guide](skills.md) - Framework skills
- [Features Overview](features.md) - All capabilities

[Back to Docs](README.md) | [Back to Home](../README.md)

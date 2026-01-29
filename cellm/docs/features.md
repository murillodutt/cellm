# CELLM Features

> [Home](../README.md) > [Docs](README.md) > **Features**

Complete overview of everything included in CELLM.

---

## Oracle - NPM Package

**Semantic search and intelligent memory for your project.**

Oracle is a standalone NPM package that powers CELLM's memory and search capabilities.

### Features

- **Published on NPM**: `@cellm/oracle`
- **Semantic Search**: Search across your entire codebase using natural language
- **Session Memory**: Context that persists and learns across sessions
- **Context-Aware**: Smart suggestions based on your project patterns
- **Local-First**: All data stays on your machine (privacy by design)

### Installation

```bash
bun install @cellm/oracle
```

### Use Cases

- Find similar code patterns across your project
- Discover where specific patterns are used
- Get context-aware suggestions during development
- Track pattern usage and evolution

[Learn more about Oracle](oracle.md)

---

## Compass Dashboard

**Visual navigation for your development workflow.**

Compass provides real-time insights into your development process with an intuitive UI built on Nuxt UI.

### Features

- **Real-Time Insights**: Live project statistics and metrics
- **Pattern Tracking**: See which patterns are used and where
- **Velocity Metrics**: Track your development speed over time
- **Clean Interface**: Beautiful UI built with Nuxt UI components
- **Auto-Sync**: Automatically syncs with Oracle MCP server

### Access

```bash
# Compass auto-starts with the plugin
# Access at: http://localhost:3000/compass
```

### Dashboard Sections

1. **Overview** - Project summary and health status
2. **Patterns** - Active patterns and usage statistics
3. **Sessions** - Development session history
4. **Agents** - Agent activity and task completion
5. **Performance** - Development velocity metrics

[Learn more about Compass](compass.md)

---

## 10 Workflow Commands

**Structured development from planning to deployment.**

CELLM provides commands that guide you through a complete development workflow.

### Planning Phase

| Command | Purpose | Use When |
|---------|---------|----------|
| `/plan-product` | High-level product planning | Starting a new feature or product |
| `/shape-spec` | Requirements refinement | You have an idea but need to clarify details |
| `/write-spec` | Specification documentation | Ready to formalize requirements |

### Execution Phase

| Command | Purpose | Use When |
|---------|---------|----------|
| `/create-tasks` | Task breakdown | Spec is ready, need actionable tasks |
| `/implement` | Code generation | Tasks defined, ready to code |

### Validation Phase

| Command | Purpose | Use When |
|---------|---------|----------|
| `/verify` | Quality gate validation | Code complete, need validation |

### Pattern Management

| Command | Purpose | Use When |
|---------|---------|----------|
| `/discover-patterns` | Find patterns in your code | Exploring existing patterns |
| `/inject-patterns` | Apply patterns consistently | Want to apply patterns to new code |
| `/index-patterns` | Search available patterns | Looking for a specific pattern |

### Monitoring

| Command | Purpose | Use When |
|---------|---------|----------|
| `/oracle-status` | Check Oracle health | Troubleshooting or verification |

### Example Workflow

```bash
# 1. Plan a new feature
/plan-product "user authentication with OAuth"

# 2. Refine requirements
/shape-spec

# 3. Write formal spec
/write-spec

# 4. Break into tasks
/create-tasks

# 5. Implement
/implement

# 6. Validate
/verify
```

[Full commands reference](commands.md)

---

## 4 Specialized Agents

**Like having senior devs on your team.**

CELLM includes specialized agents that handle different aspects of development.

### Architect Agent

**Role:** Technical design and system planning

**When to use:**
- Designing new features or systems
- Making architectural decisions
- Planning refactoring strategies
- Evaluating technology choices

**Capabilities:**
- Creates technical designs following project patterns
- Considers scalability and maintainability
- Applies best practices from your skill library
- Documents architectural decisions

### Implementer Agent

**Role:** Code execution following your patterns

**When to use:**
- Writing new code
- Implementing features from specs
- Applying patterns consistently
- Following established conventions

**Capabilities:**
- Generates code using your patterns
- Enforces project conventions
- Applies skills automatically (Nuxt, Vue, TypeScript, etc.)
- Maintains consistency across codebase

### Reviewer Agent

**Role:** Quality assurance and validation

**When to use:**
- Code review before commit
- Validating implementations
- Checking pattern compliance
- Security and performance review

**Capabilities:**
- 12-point validation checklist
- Pattern compliance verification
- Security vulnerability detection
- Performance optimization suggestions

### Project Manager Agent

**Role:** Task orchestration and tracking

**When to use:**
- Breaking down large features
- Managing task dependencies
- Tracking progress
- Coordinating multiple tasks

**Capabilities:**
- Task breakdown and organization
- Dependency management
- Progress tracking
- Workload balancing

[Full agents guide](agents.md)

---

## 7 Framework Skills

**Deep expertise in your stack.**

Skills are loaded automatically based on your project files and provide framework-specific guidance.

### sk-nuxt

**Nuxt 4 patterns and best practices**

- SSR/SSG configuration
- Composables (`useAsyncData`, `useFetch`, `useState`)
- Auto-imports and conventions
- Server routes and API endpoints
- Nitro server patterns

**Triggered by:** `*.vue`, `nuxt.config.ts`, `server/**`

### sk-vue

**Vue 3 Composition API patterns**

- Component structure
- Reactive refs and computed
- Lifecycle hooks
- Props and emits
- Template syntax

**Triggered by:** `*.vue` files

### sk-typescript

**Type-safe patterns and utilities**

- Type definitions and interfaces
- Generics usage
- Utility types
- Type guards
- Strict mode patterns

**Triggered by:** `*.ts`, `*.tsx` files

### sk-tailwind

**Tailwind v4 styling system**

- CSS utility classes
- Responsive design
- Dark mode patterns
- Custom theme configuration
- Component styling

**Triggered by:** Files with Tailwind classes

### sk-pinia

**State management patterns**

- Store definition
- State, getters, actions
- Store composition
- TypeScript integration
- Persistence patterns

**Triggered by:** `stores/**`, `pinia` imports

### sk-drizzle

**Database ORM patterns**

- Schema definition
- Queries and relations
- Migrations
- Type safety
- Connection management

**Triggered by:** `db/**`, `drizzle` imports

### oracle-search

**Semantic search integration**

- Pattern discovery
- Context retrieval
- Similar code finding
- Cross-reference search

**Triggered by:** Always available

[Full skills guide](skills.md)

---

## Security & Quality

**Audited code you can trust.**

CELLM underwent comprehensive security review to ensure production-grade quality.

### Security Features

**Secret Redaction**
- 12+ provider patterns covered
- Anthropic, OpenAI, Stripe, GitHub, AWS, and more
- Automatic detection and masking
- Prevents accidental exposure

**Input Validation**
- JSON validation with jq
- Command injection prevention
- Path traversal protection
- Buffer overflow mitigation

**Error Handling**
- `set -euo pipefail` in all scripts
- Cleanup traps for resources
- Graceful degradation
- Detailed error messages

**Audit Trail**
- Full operation logging
- Structured log format
- Log rotation (prevents disk fill)
- Queryable event history

### Code Quality

**10 Audited Shell Scripts**
- All scripts reviewed for security
- Modular architecture (not bundled)
- Community-auditable code
- Clear documentation

**Testing**
- Comprehensive test coverage
- Integration tests
- Error scenario coverage
- Performance benchmarks

**Documentation**
- Every function documented
- Usage examples
- Error codes explained
- Troubleshooting guides

---

## Related Documentation

- [Installation Guide](installation.md) - Setup and configuration
- [Commands Reference](commands.md) - All workflow commands
- [Agents Guide](agents.md) - Specialized agents
- [Skills Guide](skills.md) - Framework skills

[Back to Docs](README.md) | [Back to Home](../README.md)

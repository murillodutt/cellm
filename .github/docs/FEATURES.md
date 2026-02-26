# CELLM Features

> [Home](../README.md) > [Docs](INDEX.md) > **Features**

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
npm install @cellm/oracle
```

### Use Cases

- Find similar code patterns across your project
- Discover where specific patterns are used
- Get context-aware suggestions during development
- Track pattern usage and evolution

[Learn more about Oracle](ORACLE.md)

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

[Learn more about Compass](COMPASS.md)

---

## 25 Skills - CELLM Plugin

**18 workflow + 7 context skills for complete development coverage.**

CELLM skills are loaded automatically based on your project files. Skills use the `/cellm:name` namespace and work seamlessly with context skills that load based on file detection.

### Workflow Skills (18)

| Skill | Purpose | Use When |
|-------|---------|----------|
| `/cellm:plan-product` | High-level product planning | Starting a new feature or product |
| `/cellm:shape-spec` | Requirements refinement | You have an idea but need to clarify details |
| `/cellm:write-spec` | Specification documentation | Ready to formalize requirements |
| `/cellm:create-tasks` | Task breakdown | Spec is ready, need actionable tasks |
| `/cellm:implement` | Code generation | Tasks defined, ready to code |
| `/cellm:verify` | Quality gate validation | Code complete, need validation |
| `/cellm:discover-patterns` | Find patterns in your code | Exploring existing patterns |
| `/cellm:inject-patterns` | Apply patterns consistently | Want to apply patterns to new code |
| `/cellm:index-patterns` | Search available patterns | Looking for a specific pattern |
| `/cellm:oracle-status` | Check Oracle health | Troubleshooting or verification |
| `/cellm:architecture` | Technical design and planning | Designing systems or features |
| `/cellm:refactor` | Code refactoring | Improving code structure |
| `/cellm:debug` | Error diagnosis and fixing | Troubleshooting issues |
| `/cellm:optimize` | Performance enhancement | Improving speed/efficiency |
| `/cellm:test` | Test generation | Building test coverage |
| `/cellm:document` | Auto-documentation | Generating docs from code |
| `/cellm:migrate` | Data migration workflows | Upgrading schemas/versions |
| `/cellm:deploy` | Deployment automation | Moving code to production |

### Context Skills (7)

Context skills auto-load by file path. Multiple stacks load simultaneously when editing:

| Skill | Files | Purpose |
|-------|-------|---------|
| `/cellm:nuxt` | `*.vue`, `nuxt.config.ts`, `server/**` | Nuxt 4 patterns and SSR/composables |
| `/cellm:vue` | `*.vue` | Vue 3 Composition API |
| `/cellm:typescript` | `*.ts`, `*.tsx` | Type-safe patterns and utilities |
| `/cellm:tailwind` | Tailwind classes | Tailwind v4 styling system |
| `/cellm:pinia` | `stores/**`, pinia imports | State management |
| `/cellm:drizzle` | `db/**`, drizzle imports | Database ORM patterns |
| `/cellm:oracle` | Always available | Semantic search integration |

**Example:** Editing `.vue` files loads `/cellm:vue`, `/cellm:tailwind`, and `/cellm:typescript` simultaneously. Editing `stores/` loads `/cellm:pinia`.

### Example Workflow

```bash
# 1. Plan a new feature
claude /cellm:plan-product "user authentication with OAuth"

# 2. Refine requirements
claude /cellm:shape-spec

# 3. Write formal spec
claude /cellm:write-spec

# 4. Break into tasks
claude /cellm:create-tasks

# 5. Implement
claude /cellm:implement

# 6. Validate
claude /cellm:verify
```

[Full skills reference](SKILLS.md)

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

[Full agents guide](AGENTS.md)

---


---

## 3 Plugins

### CELLM Plugin - 25 Skills

The core plugin providing 18 workflow skills and 7 context skills for complete development automation. Integrated into the Claude Code environment.

[Learn more about CELLM Skills](SKILLS.md)

### DocOps Plugin - 12 Skills

**Documentation maintenance and drift control.**

DocOps provides LLM-first templates, code evidence, and gap tracking to keep docs accurate over time.

**Skills include:**
- `/docops:conveyor` - Documentation conveyor system
- `/docops:spec` - Specification templates
- `/docops:refs` - Reference documentation
- `/docops:howto` - How-to guides
- `/docops:runbook` - Operational runbooks
- `/docops:adr` - Architecture Decision Records
- `/docops:gap-analysis` - Drift detection
- `/docops:audit` - Documentation audit
- `/docops:sync` - Code-to-docs sync
- `/docops:template` - Custom templates
- `/docops:publish` - Doc publishing
- `/docops:validate` - Quality validation

**Features:**
- **LLM-first templates** for all documentation types
- **Code evidence first**: facts sourced from code before writing
- **Drift control** with gap tracking
- **Automated sync** between code and docs

[Learn more about DocOps](../docops/README.md)

### DSE Plugin - 1 Skill

**Design Thinking Framework for structured problem-solving.**

The Design Systems Engineering plugin brings proven design thinking methodologies to your development workflow.

**Skills include:**
- `/dse:design-sprint` - Rapid design and validation cycles

**Framework includes:**
- Empathy and discovery phase
- Problem definition and reframing
- Ideation and prototyping
- Testing and validation
- Implementation planning

[Learn more about DSE](../dse/README.md)

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

- [Installation Guide](INSTALLATION.md) - Setup and configuration
- [Skills Reference](SKILLS.md) - All 25 skills (18 workflow + 7 context)
- [Agents Guide](AGENTS.md) - Specialized agents
- [DocOps Plugin](../docops/README.md) - Documentation maintenance
- [DSE Plugin](../dse/README.md) - Design thinking framework

[Back to Docs](INDEX.md) | [Back to Home](../README.md)

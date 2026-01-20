# CELLM Roadmap

**Spec-Driven Development System for AI Agents**

---

| Metadata | Value |
|----------|-------|
| Document | ROADMAP-CELLM-001 |
| Version | 1.2.0 |
| Date | 2026-01-19 |
| Status | Draft |
| Platform | Claude Code CLI (exclusive) |

---

## Philosophy

**"Ship first, iterate later"** - Deploy to production, listen to users, let it mature.

This roadmap focuses on **direct value to developers**, not technical infrastructure. Each version must deliver immediately perceivable value, not "lay groundwork" for the future.

**Principles:**
- Depth over breadth: optimize for Claude Code CLI
- Token efficiency: every feature must justify its budget impact
- Developer experience: reduce friction, increase predictability
- Immediate value: small releases that deliver tangible benefits

---

## Current State

### v1.1.0 (CURRENT)

**Released:** 2026-01-20

**New in this release:**
- CELLM Oracle: Nuxt 4 dashboard for visual monitoring
- MCP Integration: Real-time validation via @nuxtjs/mcp-toolkit
- Session template for current context tracking
- All 68 artifacts updated to v1.1.0

---

### v1.0.0 (COMPLETED)

**Released:** 2026-01-18

First stable public release with complete CLI foundation.

---

### v0.10.0 (COMPLETED - Pre-release)

**Completed Components:**

| Category | Count | Items |
|----------|-------|-------|
| Rules | 8 | conventions, limits, protocols, architecture, git-flow, frontend, backend, shared |
| Patterns | 10 | typescript, vue, nuxt, nuxt-ui, pinia, tailwind, drizzle, stripe, eslint, prohibited |
| Commands | 13 | plan-product, shape-spec, write-spec, create-tasks, orchestrate-tasks, implement, verify, status, reuse-check, improve-skills, spec, metrics |
| Workflows | 8 | plan-product, shape-spec, write-spec, create-tasks, orchestrate-tasks, implement, improve-skills, verify |
| Agents | 4 | architect, implementer, reviewer, project-manager |
| Skills | 7 | nuxt, vue, nuxt-ui, pinia, drizzle, tailwind, stripe |
| Templates | 5 | spec, tasks, tech-stack, config.yaml, CLAUDE.md |

**Infrastructure:**
- [+] 6-layer context hierarchy
- [+] Profile inheritance system
- [+] JSON Schema validation (4 schemas)
- [+] Bash installation scripts
- [+] Claude Code CLI integration
- [+] PRD documentation (1965 lines)

**Known Gaps:**
- [-] No CLI tool (bash scripts only)
- [-] No runtime validation
- [-] No metrics collection
- [-] No MCP server integration
- [-] No visual feedback system

---

## Version Roadmap

### v0.11.0 - Get Started Fast

**Theme:** Immediate value for new users

| Feature | Description |
|---------|-------------|
| CLI Tool | `cellm init/sync/validate/doctor` |
| Context Debugger | See exactly what was loaded and why |
| Blueprints Foundation | Base structure for project pipelines |

#### [F-011-01] CLI Tool

Replace bash scripts with Node.js CLI for better experience.

```
cellm init [--profile <name>]     Initialize project with CELLM
cellm sync                        Sync local with global profile
cellm validate                    Validate structure and schemas
cellm doctor                      Run health check diagnostics
```

| Aspect | Specification |
|--------|---------------|
| Runtime | Node.js 20+ |
| Package | @cellm/cli |
| Install | npm install -g @cellm/cli |
| Dependencies | Minimal (gray-matter, ajv, picocolors) |

**Acceptance Criteria:**
- AC-1: `cellm init` creates valid .claude/ structure in <3s
- AC-2: `cellm validate` detects all schema violations
- AC-3: `cellm doctor` reports actionable issues

#### [F-011-02] Context Debugger

Full visibility into loaded context.

```
cellm debug context     # Show complete current context
cellm debug why <rule>  # Explain why a rule was loaded
cellm debug budget      # Show token consumption by layer
```

**Budget output:**
```
+------------------------------------------------------------------+
|                    CELLM CONTEXT BUDGET                          |
+------------------------------------------------------------------+
| Layer      | Tokens | % Used | Status                           |
|------------|--------|--------|----------------------------------|
| CORE       |    380 |   19%  | [========                    ]   |
| DOMAIN     |    220 |   11%  | [=====                       ]   |
| PATTERNS   |    340 |   17%  | [=======                     ]   |
| PROJECT    |    180 |    9%  | [====                        ]   |
| SESSION    |     80 |    4%  | [==                          ]   |
|------------|--------|--------|----------------------------------|
| TOTAL      |   1200 |   60%  | [==============              ]   |
| AVAILABLE  |    800 |   40%  | Budget: 2000 tokens              |
+------------------------------------------------------------------+
```

#### [F-011-03] Blueprints Foundation

Base structure for complete blueprints in v1.0.0.

| Blueprint | v0.11.0 Scope |
|-----------|---------------|
| Landing Page | Directory structure, base config |
| Dashboard | Directory structure, base config |

**Deliverables:**
- [ ] @cellm/cli published to npm
- [ ] Context Debugger functional
- [ ] Blueprints structure defined
- [ ] Basic usage documentation

---

### v0.12.0 - Work Better

**Theme:** Day-to-day productivity

| Feature | Description |
|---------|-------------|
| Model Selector | Automatic Haiku/Sonnet/Opus by task |
| Pattern Recommendations | Suggestions based on code analysis |
| Quick Actions | Shortcuts for common sequences |

#### [F-012-01] Model Selector

Automatic model selection based on task.

| Trigger | Model | Reason |
|---------|-------|--------|
| /verify | Haiku | Fast and cheap |
| /implement | Sonnet | Balanced |
| /plan-product | Opus | Deep |
| /shape-spec | Opus | Deep |

**Implementation:**
```yaml
# .claude/config.yaml
model_routing:
  default: sonnet
  overrides:
    verify: haiku
    plan-product: opus
    shape-spec: opus
```

#### [F-012-02] Pattern Recommendations

Intelligent suggestions based on code analysis.

```
[i] Detected: async function without error handling
    Suggestion: Apply TS-008 (Async Error Boundaries)

[i] Detected: Pinia store without storeToRefs
    Suggestion: Apply PN-003 (Store Destructuring)
```

#### [F-012-03] Quick Actions

Shortcuts for common command sequences.

```
/qa          # verify + fix + commit
/ship        # verify + build + deploy
/review      # diff + verify + suggest
```

**Deliverables:**
- [ ] Configurable model selector
- [ ] Pattern recommendation engine
- [ ] Quick actions implemented
- [ ] Configuration documentation

---

### v0.13.0 - Learn and Improve

**Theme:** System that evolves with usage

| Feature | Description |
|---------|-------------|
| Feedback Loop | Corrections become patterns |
| Metrics Collection | Track effectiveness |
| Token Analytics | Cost per session/command |

#### [F-013-01] Feedback Loop

Transform manual corrections into automatic patterns.

```
cellm feedback "This approach worked better"
cellm learn --from-session  # Extract patterns from current session
```

**Flow:**
1. User corrects Claude output
2. System detects correction pattern
3. Suggests new pattern creation
4. User approves and pattern is added

#### [F-013-02] Metrics Collection

Track system effectiveness.

| Metric | Collection | Storage |
|--------|------------|---------|
| pattern_hits | On pattern application | ~/.cellm/metrics/hits.json |
| anti_pattern_prevents | On violation block | ~/.cellm/metrics/prevents.json |
| command_frequency | On command invocation | ~/.cellm/metrics/commands.json |

#### [F-013-03] Token Analytics

Visibility into costs.

```
cellm analytics session     # Current session cost
cellm analytics history     # Cost history
cellm analytics report      # Monthly report
```

| Data | Description |
|------|-------------|
| Tokens per session | Total used in session |
| Tokens per command | Average by command type |
| Trend | Evolution over time |

**Deliverables:**
- [ ] Functional feedback system
- [ ] Active metrics collection
- [ ] Analytics dashboard
- [ ] Exportable reports

---

### v0.20.0 - Advanced CLI

**Theme:** Advanced features and Oracle PoC

| Feature | Description |
|---------|-------------|
| Compile Command | `cellm compile` for profile compilation |
| Upgrade Command | `cellm upgrade` for version management |
| Oracle PoC | Proof of concept for visual dashboard |

#### [F-020-01] Compile Command

Advanced profile compilation with output formats.

```
cellm compile --profile default     Compile profile to output
cellm compile --format json         Output as JSON
cellm compile --minify              Minified output
cellm compile --watch               Watch mode
```

#### [F-020-02] Upgrade Command

Version management and updates.

```
cellm upgrade --check     Check for new versions
cellm upgrade             Apply updates with backup
cellm upgrade --rollback  Restore previous version
```

#### [F-020-03] Oracle PoC

Proof of concept for the visual dashboard (CELLM Oracle):
- Basic Nuxt 4 scaffold
- Context tree visualization
- Analytics display prototype

**Deliverables:**
- [ ] Compile command functional
- [ ] Upgrade command with backup/rollback
- [ ] Oracle PoC demonstrating feasibility
- [ ] CLI experience polished

---

### v0.90.0 - Beta Testing

**Theme:** Real-world validation

| Feature | Description |
|---------|-------------|
| Beta Program | Structured pilot testing |
| Bug Fixes | Issues from beta feedback |
| Documentation | Updated based on feedback |

#### Beta Program

- 3-5 pilot users onboarded
- Feedback collection system
- Bug triage and prioritization
- Performance optimization

**Deliverables:**
- [ ] Beta program completed
- [ ] Critical bugs resolved
- [ ] Documentation refined
- [ ] Ready for v1.0.0 launch

---

### v1.0.0 - Launch

**Theme:** Production-ready for teams

| Feature | Description |
|---------|-------------|
| Complete Blueprints | Landing Page + Dashboard |
| MCP Server | Deep Claude Code integration |
| Documentation | Complete guides |

#### [F-100-01] Complete Blueprints

**Landing Page Blueprint:**

| Component | Description |
|-----------|-------------|
| Header | Navigation, logo, CTA |
| Hero | Headline, subheadline, main CTA |
| Offer | Features, benefits |
| How It Works | Steps, process |
| Social Proof | Testimonials, logos, metrics |
| CTA | Main conversion |
| Footer | Links, legal |
| Forms | Capture, contact |

**Dashboard Blueprint:**

| Component | Description |
|-----------|-------------|
| Sidebar | Side navigation |
| KPIs | Main metrics |
| Charts | Data visualizations |
| Alerts | Notifications, warnings |
| Buttons | Primary/secondary actions |
| Forms | Inputs, validation |
| Modals | Confirmations, details |
| Empty States | Empty states |
| Loading | Skeletons, spinners |
| Onboarding | First use |
| Security | Social Login, Passkeys |
| Invisible UX | Micro-interactions |

#### [F-100-02] MCP Server

Expose CELLM capabilities as MCP tools.

| Aspect | Specification |
|--------|---------------|
| Protocol | MCP 1.0 (Model Context Protocol) |
| Transport | stdio (default), HTTP optional |
| Package | @cellm/mcp-server |

| Tool | Description |
|------|-------------|
| cellm_load_context | Load specific context layers |
| cellm_check_pattern | Validate code against patterns |
| cellm_suggest_reuse | Find reusable components |
| cellm_get_status | Return current CELLM state |
| cellm_execute_command | Execute CELLM commands |

```yaml
# ~/.claude/mcp_servers.yaml
cellm:
  command: cellm-mcp-server
  tools:
    - cellm_load_context
    - cellm_check_pattern
    - cellm_suggest_reuse
```

#### [F-100-03] Complete Documentation

| Document | Purpose |
|----------|---------|
| Getting Started | 5-minute quickstart |
| User Guide | Complete feature reference |
| Pattern Catalog | All patterns with examples |
| CLI Reference | All commands documented |
| Architecture Guide | System internals |
| Blueprints Guide | How to use blueprints |

**Deliverables:**
- [ ] Complete Landing Page and Dashboard blueprints
- [ ] MCP server published (@cellm/mcp-server)
- [ ] Complete documentation site
- [ ] Test coverage >80%

---

### v1.1.0 - Oracle Dashboard (COMPLETED)

**Theme:** Visual interface and advanced MCP

| Feature | Status | Description |
|---------|--------|-------------|
| CELLM Oracle | [+] DONE | Full Nuxt 4 dashboard application |
| MCP Integration | [+] DONE | @nuxtjs/mcp-toolkit integration |
| Session Template | [+] DONE | Current context tracking |

#### [F-110-01] CELLM Oracle Dashboard

Full-featured visual dashboard:
- [+] Context tree visualization
- [+] Budget and analytics charts (NuxtCharts Premium)
- [+] Session history browser
- [~] Profile editor UI (planned for v1.2.0)
- [+] Real-time MCP updates

#### [F-110-02] MCP Integration

Integration via @nuxtjs/mcp-toolkit:
- [+] stdio transport functional
- [~] HTTP/SSE streaming (planned for v1.2.0)
- [~] Authentication layer (planned for v1.2.0)

#### [F-110-03] Session Template

New template for context tracking:
- [+] SESSION layer with current date/time
- [+] Context preservation across conversations
- [+] Template in cellm-core/templates/session.md

**Deliverables:**
- [+] Oracle dashboard functional
- [+] MCP integration working
- [+] Session template created
- [+] Integration documentation

---

## After v1.1.0

The roadmap beyond v1.1.0 will be defined based on:
- Real user feedback
- Collected usage metrics
- Patterns that emerge from the community

---

## Compatibility

| Dependency | Minimum | Recommended |
|------------|---------|-------------|
| Node.js | 20.x | 22.x |
| Claude Code CLI | 1.0.0 | Latest |
| Git | 2.30 | Latest |
| OS | macOS 12+, Linux, Windows 10+ | macOS 14+, Ubuntu 22.04 |

---

## Out of Scope

Features considered but explicitly excluded:

| Feature | Reason |
|---------|--------|
| Multi-LLM support | Focus on Claude Code CLI excellence |
| GUI application | CLI-first philosophy |
| Cloud sync | Privacy and simplicity |
| Real-time collaboration | Complexity vs value |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.2.0 | 2026-01-19 | Add v0.20.0, v0.90.0, v1.1.0 phases |
| 1.1.0 | 2026-01-18 | Complete rewrite, value-focused structure |
| 1.0.0 | 2026-01-18 | Initial roadmap document |

---

**Document maintained by the CELLM team**
**Website:** [cellm.ai](https://cellm.ai) (coming soon)
**Repository:** [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

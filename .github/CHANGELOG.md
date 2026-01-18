# Changelog

All notable changes to CELLM will be documented in this file.

**Website**: [cellm.ai](https://cellm.ai)  
**Repository**: [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- CLI tool for installation and compilation
- MCP server integration
- Visual status dashboard

---

## [0.10.0] - 2026-01-17

### Added

#### Core System
- 6-layer context hierarchy (SESSION > PROJECT > PATTERNS > DOMAIN > CORE > REFERENCE)
- Profile inheritance system with depth-first merge
- Budget governance with 2000 token default limit
- PCL (Priority Context Loading) algorithm

#### Rules System
- 5 core rules: conventions, limits, protocols, architecture, git-flow
- 3 domain rules: frontend, backend, shared
- Path-triggered loading for domain rules
- JSON Schema validation for all rules

#### Patterns System
- 5 critical anti-patterns with blocking behavior
- 8 technology-specific pattern files (TS, Vue, Nuxt, Nuxt UI, Pinia, Drizzle, Tailwind, Stripe)
- Pattern lifecycle management (DRAFT → OK → REVISAR → OBSOLETO → REMOVED)
- Metrics collection for pattern hits/prevents

#### Commands
- 6 workflow commands: /plan-product, /shape-spec, /write-spec, /create-tasks, /implement, /verify
- 4 auxiliary commands: /status, /reuse-check, /spec, /metrics
- Command-triggered context loading

#### Workflows
- Complete 6-phase development workflow
- Multi-spec management with /spec switch
- Reuse protocol with 70% similarity threshold

#### Agents
- 4 specialized agents: architect, implementer, reviewer, project-manager
- Agent-specific tool restrictions
- Subagent delegation support

#### Skills
- 7 technology skills: nuxt, vue, drizzle, stripe, nuxt-ui, pinia, tailwind
- Progressive disclosure loading
- Claude Code Skills compatibility

#### Templates
- spec.md template with full structure
- tasks.md template with task groups
- CLAUDE.md bootstrap template
- config.yaml configuration template

#### Validation
- 4 JSON Schemas: rule, pattern, workflow, config
- Pre-load and post-load validations
- 3-level fallback chain with emergency defaults
- Health check system with periodic validation

#### Documentation
- Complete PRD with 25 sections
- Multi-agent verification report
- Getting started tutorial
- Command reference

#### DevOps
- GitHub Actions workflow for @claude integration
- Issue templates (bug report, feature request)
- Pull request template
- Dependabot configuration
- Claude Code plugin marketplace support

### Technical Details
- Stack: Nuxt 4, Vue 3, TypeScript, Tailwind 4, Drizzle, Stripe
- Language: PT-BR for documentation, English for code
- Commit convention: Conventional Commits

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| 0.10.0 | 2026-01-17 | Initial release |

---

## Migration Guides

### From Scratch
1. Run `./scripts/base-install.sh`
2. Customize your profile in `~/.cellm/profiles/`
3. Run `./scripts/project-install.sh` in your project
4. Start using commands: `/plan-product`, `/shape-spec`, etc.

---

## Links

- [Documentation](./docs/PRD-CELLM.md)
- [Installation Guide](./docs/tutorials/getting-started.md)
- [GitHub Repository](https://github.com/murillodutt/cellm)

# Contributing to CELLM

> **CELLM** - Spec-Driven Development System for AI Agents

Thank you for your interest in contributing to CELLM! This document provides guidelines for contributions.

---

## Project Structure

```
cellm/
├── .github/              # Documentation and community
│   ├── ISSUE_TEMPLATE/   # Bug and feature templates
│   ├── workflows/        # GitHub Actions
│   └── *.md              # Project documentation
│
├── .claude-plugin/       # Marketplace configuration
│   └── marketplace.json
│
└── cellm/                # Claude Code Plugin
    ├── .claude-plugin/
    │   └── plugin.json   # Plugin manifest
    ├── .mcp.json         # MCP server configuration
    ├── agents/           # Development agents (4)
    ├── commands/         # Plugin commands
    ├── skills/           # Framework skills (7)
    ├── hooks/            # Event hooks
    └── scripts/          # Bundled executables
```

---

## Contribution Types

| Type | Description | Location |
|------|-------------|----------|
| **Skills** | Framework-specific patterns and guidance | `cellm/skills/` |
| **Agents** | Specialized development assistants | `cellm/agents/` |
| **Commands** | Plugin commands | `cellm/commands/` |
| **Documentation** | Project docs and guides | `.github/` |

---

## Development Setup

CELLM is distributed as a Claude Code plugin. No build step is required for most contributions.

### Prerequisites

- Claude Code CLI 1.0+
- Bun 1.0+ (for MCP server development)

### Local Testing

1. Fork and clone the repository
2. Make your changes
3. Test by installing locally:

```bash
# Install from local path
claude /plugin install /path/to/your/fork/cellm
```

---

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code refactoring |
| `test` | Test additions/changes |
| `chore` | Maintenance tasks |

### Scopes

| Scope | Description |
|-------|-------------|
| `skills` | Changes to skills |
| `agents` | Changes to agents |
| `commands` | Changes to commands |
| `hooks` | Changes to hooks |
| `scripts` | Changes to bundled scripts |
| `docs` | Documentation changes |

### Examples

```
feat(skills): add sk-prisma for Prisma ORM patterns
fix(agents): correct architect tool restrictions
docs: update installation instructions
```

---

## Pull Request Process

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/my-feature`
3. **Make** your changes
4. **Test** locally with Claude Code
5. **Commit** using conventional commits
6. **Push** to your fork
7. **Open** a Pull Request

### PR Checklist

- [ ] Code follows project conventions
- [ ] Documentation updated if needed
- [ ] Commits follow conventional format
- [ ] PR description explains the changes

---

## Code Standards

### Markdown Files

- Use YAML frontmatter where applicable
- Follow consistent heading hierarchy
- Include code examples where helpful

### Skills Format

```markdown
---
description: Brief description for Claude Code
---

# Skill Name

## Overview
...

## Patterns
...

## Examples
...
```

### Agents Format

```markdown
---
description: Agent purpose
tools: [list, of, tools]
---

# Agent Name

## Role
...

## Responsibilities
...
```

---

## Getting Help

- **Questions**: Open a [Discussion](https://github.com/murillodutt/cellm/discussions)
- **Bugs**: Open an [Issue](https://github.com/murillodutt/cellm/issues)
- **Features**: Open a [Feature Request](https://github.com/murillodutt/cellm/issues/new?template=feature_request.yml)

---

## Code of Conduct

Please read our [Code of Conduct](./CODE_OF_CONDUCT.md) before contributing.

---

## License

By contributing to CELLM, you agree that your contributions will be licensed under the MIT License.

---

**CELLM** - Spec-Driven Development System for AI Agents
**Maintainer**: Dutt Yeshua Technology Ltd

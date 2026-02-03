# Contributing to CELLM

> [Home](../README.md) > [Docs](INDEX.md) > **Contributing**

Guide for contributing to the CELLM project.

---

## Welcome

Thank you for your interest in contributing to CELLM! This document provides guidelines for contributions.

---

## Ways to Contribute

### No Code Required

- **Report bugs** - Found an issue? Let us know
- **Suggest features** - Ideas for improvement
- **Improve docs** - Fix typos, clarify sections
- **Help others** - Answer questions in discussions
- **Share** - Tell colleagues about CELLM

### Code Contributions

- **Skills** - Framework-specific patterns
- **Agents** - Specialized assistants
- **Commands** - Workflow commands
- **Bug fixes** - Fix reported issues

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
    └── scripts/          # Shell scripts
```

---

## Development Setup

### Prerequisites

- Claude Code CLI (latest)
- Bun 1.0+ (for Oracle/MCP development)
- Git 2.30+

### Local Testing

1. **Fork** the repository on GitHub

2. **Clone** your fork
   ```bash
   git clone https://github.com/YOUR_USERNAME/cellm.git
   cd cellm
   ```

3. **Create branch**
   ```bash
   git checkout -b feat/my-feature
   ```

4. **Make changes**

5. **Test locally**
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
| `scripts` | Changes to scripts |
| `docs` | Documentation changes |
| `oracle` | Oracle/MCP changes |

### Examples

```
feat(skills): add sk-prisma for Prisma ORM patterns
fix(agents): correct architect tool restrictions
docs: update installation instructions
fix(oracle): resolve search timeout issue
```

---

## Pull Request Process

### Steps

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** locally with Claude Code
5. **Commit** using conventional commits
6. **Push** to your fork
7. **Open** a Pull Request

### PR Checklist

- [ ] Code follows project conventions
- [ ] Documentation updated if needed
- [ ] Commits follow conventional format
- [ ] PR description explains changes
- [ ] Tests pass (if applicable)

### PR Template

```markdown
## Summary

Brief description of changes.

## Changes

- Added X
- Fixed Y
- Updated Z

## Testing

How to test these changes.

## Related Issues

Fixes #123
```

---

## Code Standards

### Markdown Files

- Use YAML frontmatter where applicable
- Follow consistent heading hierarchy
- Include code examples where helpful
- Keep line length reasonable

### Skills Format

```markdown
---
description: Brief description for Claude Code
---

# Skill Name

## Overview
What this skill provides.

## Patterns
Code patterns and best practices.

## Examples
Working code examples.
```

### Agents Format

```markdown
---
name: agent-name
description: Agent purpose and capabilities
tools: [Read, Write, Edit]
---

# Agent Name

## Role
What this agent does.

## Responsibilities
Specific tasks and duties.

## Commands
What triggers this agent.
```

### Commands Format

```markdown
---
id: CMD-NAME
command: command-name
agent: agent-to-use
budget: ~250 tokens
---

# Command Name

## Purpose
What this command does.

## Process
Step-by-step execution.

## Output
What gets created.
```

---

## Adding a Skill

1. Create file in `skills/sk-{name}/SKILL.md`

2. Follow skill format:
   ```markdown
   ---
   description: |
     What this skill provides.
     Trigger conditions.
   ---

   # sk-{name}

   ## Patterns
   ...

   ## Rules
   ...

   ## Examples
   ...
   ```

3. Test with relevant file types

4. Submit PR with:
   - Skill file
   - Updated documentation
   - Test instructions

---

## Adding an Agent

1. Create file in `agents/{name}.md`

2. Follow agent format with frontmatter

3. Define:
   - Role and responsibilities
   - Available tools
   - Triggered commands

4. Test agent behavior

5. Submit PR

---

## Adding a Command

1. Create file in `commands/{name}.md`

2. Follow command format with frontmatter

3. Define:
   - Purpose and process
   - Step-by-step workflow
   - Expected output

4. Test command execution

5. Submit PR

---

## Getting Help

### Questions

[GitHub Discussions](https://github.com/murillodutt/cellm/discussions)

Use Q&A category for help.

### Bug Reports

[GitHub Issues](https://github.com/murillodutt/cellm/issues)

Use bug report template.

### Feature Requests

[Feature Request](https://github.com/murillodutt/cellm/issues/new?template=feature_request.yml)

Describe the use case and value.

---

## Code of Conduct

### Our Standards

**Do:**
- Be respectful and considerate
- Welcome newcomers
- Give constructive feedback
- Focus on what's best for community

**Don't:**
- Harass or discriminate
- Troll or insult
- Share private information
- Act unprofessionally

### Enforcement

Violations may result in:
1. Warning
2. Temporary ban
3. Permanent ban

Report violations to: conduct@cellm.ai

---

## Recognition

Contributors are recognized in:
- CONTRIBUTORS.md
- Release notes
- Project README

---

## License

By contributing to CELLM, you agree that your contributions will be licensed under the MIT License.

---

## Related Documentation

- [Features Overview](FEATURES.md) - Understand CELLM
- [Technical Specs](TECHNICAL-SPECS.md) - Architecture
- [FAQ](FAQ.md) - Common questions

[Back to Docs](INDEX.md) | [Back to Home](../README.md)

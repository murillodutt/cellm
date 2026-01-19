# Contributing to CELLM

Thank you for your interest in contributing to CELLM. This document provides guidelines for participating in the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contribution Types](#contribution-types)
- [Code Standards](#code-standards)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Validation](#validation)

---

## Code of Conduct

This project maintains a respectful and constructive environment. By participating, you agree to uphold these standards. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details.

---

## Getting Started

### Reporting Bugs

1. Check existing [Issues](https://github.com/murillodutt/cellm/issues) to avoid duplicates
2. Use the Bug Report template
3. Include:
   - Clear problem description
   - Steps to reproduce
   - Expected vs actual behavior
   - CELLM version and environment details

### Suggesting Features

1. Check existing issues and discussions for similar suggestions
2. Use the Feature Request template
3. Describe:
   - The problem the feature addresses
   - Your proposed solution
   - Alternatives you considered

### Contributing Code

1. Fork the repository
2. Create a branch (`git checkout -b feat/feature-name`)
3. Make your changes
4. Run validation (`./scripts/validate.sh`)
5. Commit following conventions (`git commit -m 'feat(scope): description'`)
6. Push to your branch (`git push origin feat/feature-name`)
7. Open a Pull Request

---

## Development Setup

### Prerequisites

- Node.js 18+ (for validation tools only)
- Git

### Local Setup

```bash
# Clone the repository
git clone https://github.com/murillodutt/cellm.git
cd cellm

# Install development dependencies
npm install

# Run validation
./scripts/validate.sh

# Run tests
npm test
```

### Branch Structure

```
main              # Production, always stable
develop           # Feature integration
feat/<name>       # New features
fix/<name>        # Bug fixes
docs/<name>       # Documentation updates
refactor/<name>   # Refactoring
```

### Development Workflow

1. **Sync** with the `develop` branch
2. **Create** your branch from `develop`
3. **Develop** your changes
4. **Test** locally with validation scripts
5. **Commit** with descriptive messages
6. **Push** to your fork
7. **Open PR** targeting `develop`

---

## Project Structure

Understanding the repository structure is essential for contributing:

```
cellm/
├── cellm-core/           # CELLM product files (artifacts)
│   ├── rules/            # Rule definitions
│   ├── patterns/         # Pattern definitions
│   ├── commands/         # Command definitions
│   ├── workflows/        # Workflow definitions
│   ├── agents/           # Agent definitions
│   ├── skills/           # Skill definitions
│   └── templates/        # User templates
│
├── docs/                 # Project documentation
│   ├── PRD-CELLM.md     # Product specification
│   ├── concepts/        # Conceptual docs
│   ├── reference/       # Technical reference
│   └── tutorials/       # User guides
│
├── scripts/             # Build and validation scripts
├── schemas/             # JSON Schema definitions
└── tests/               # Automated tests
```

### Important Distinction

Files in `cellm-core/` are **product artifacts** (code), not instructions. When contributing:

- Edit files in `cellm-core/` as source code you are building
- Follow development instructions only from [CLAUDE.md](../CLAUDE.md) and the `.claude/` directory
- Maintain the strict separation between the development layer and the product layer

---

## Contribution Types

### Rules

Rules define behaviors and constraints for the CELLM system.

**Location:** `cellm-core/rules/<category>/`

**Requirements:**
- Unique ID (e.g., `CONV-007`, `LIM-003`)
- Valid YAML frontmatter
- Clear, actionable content
- English language

**Template:**

```markdown
---
id: CONV-XXX
version: v0.10.0
status: DRAFT
budget: ~100 tokens
alwaysApply: true
---

# Rule Title

Rule content describing the behavior or constraint.
```

### Patterns

Patterns define code conventions with examples.

**Location:** `cellm-core/patterns/<category>/`

**Requirements:**
- Unique ID with technology prefix (e.g., `TS-007`, `VU-015`)
- Both correct and incorrect examples
- Valid YAML frontmatter
- English language

**Template:**

```markdown
---
id: TS-XXX
version: v0.10.0
status: DRAFT
technology: typescript
---

# Pattern Title

## Description

Brief description of the pattern.

## Correct Example

```typescript
// [+] Good
const result = await fetchData()
```

## Incorrect Example

```typescript
// [-] Bad
const result = fetchData() // Missing await
```
```

### Skills

Skills are specialized capabilities for Claude Code.

**Location:** `cellm-core/skills/<name>/`

**Requirements:**
- Directory with `SKILL.md` file
- Valid frontmatter with name and description
- Clear instructions
- English language

**Template:**

```markdown
---
name: skill-name
description: Clear description (max 1024 chars)
---

# Skill Name

Instructions for Claude Code to execute this skill.
```

### Workflows

Workflows define multi-step processes orchestrated by agents.

**Location:** `cellm-core/workflows/`

**Requirements:**
- Logical progression of steps
- Role assignment for each phase
- Clear entry and exit criteria
- English language

**Correct Example:**

```yaml
# [+] Good: Logical phase progression with appropriate agents
phases:
  - id: planning
    agent: architect
    description: High-level system design
  - id: implementation
    agent: implementer
    description: Code execution based on design
```

**Incorrect Example:**

```yaml
# [-] Bad: Mismatched agents or ambiguous phases
phases:
  - id: start
    agent: implementer # Should be architect for planning phases
    description: Just start coding without a plan
```

### Documentation

**Location:** `docs/`

**Requirements:**
- Consistency with PRD-CELLM.md
- Practical examples
- Valid links and references
- English language

### Scripts

**Location:** `scripts/`

**Requirements:**
- Shebang line (`#!/bin/bash` or similar)
- Error handling
- Clear comments
- Usage documentation

---

## Code Standards

### Language

- All files in `cellm-core/` must be in **English**
- All documentation in `docs/` must be in **English**
- No emojis in code or documentation

### Markdown Files

- Valid YAML frontmatter
- All required fields present
- Unique IDs within category
- Follow category template structure

### Frontmatter Requirements

**Rules:**
```yaml
---
id: string          # Required, unique
version: string     # Required, semver format
status: string      # Required: OK | DRAFT | REVISAR | OBSOLETO
budget: string      # Required, token estimate
alwaysApply: bool   # Optional
---
```

**Patterns:**
```yaml
---
id: string          # Required, unique with tech prefix
version: string     # Required, semver format
status: string      # Required
technology: string  # Required
---
```

**Skills:**
```yaml
---
name: string        # Required, lowercase with hyphens
description: string # Required, max 1024 chars
---
```

---

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Usage |
|------|-------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `refactor` | Code refactoring |
| `test` | Adding or modifying tests |
| `chore` | Maintenance tasks |

### Scopes

Valid scopes for this project:

- `rules` - Files in cellm-core/rules/
- `patterns` - Files in cellm-core/patterns/
- `commands` - Files in cellm-core/commands/
- `workflows` - Files in cellm-core/workflows/
- `agents` - Files in cellm-core/agents/
- `skills` - Files in cellm-core/skills/
- `docs` - Documentation files
- `scripts` - Automation scripts
- `schemas` - JSON Schema files

### Examples

```bash
feat(rules): add mobile domain rule
fix(patterns): correct TS-003 example syntax
docs: update installation guide
refactor(commands): simplify implement structure
test(validation): add frontmatter tests
chore: update dependencies
```

---

## Pull Request Process

### Before Submitting

1. Run all validation scripts
2. Ensure all tests pass
3. Update documentation if needed
4. Check that your branch is up to date with `develop`

### PR Requirements

- Use the Pull Request template
- Link related issues
- Provide clear description of changes
- Include screenshots if relevant (UI changes, diagrams)
- Ensure CI checks pass

### Review Process

1. Submit PR to `develop` branch
2. Wait for automated checks to complete
3. Address reviewer feedback
4. Obtain approval from at least one maintainer
5. Squash and merge when approved

### PR Template Fields

- **Description**: Detailed summary of changes and the problem they solve
- **Type of Change**: BUG/FEAT/Breaking Change/DOCS/REFAC/TEST
- **Affected Areas**: Which components of CELLM are impacted
- **Checklist**: Mandatory validation steps (linting, tests, frontmatter)
- **Testing**: Description of how the changes were verified
- **Related Issues**: Links to GitHub issues using keywords (Fixes #123)
- **Screenshots**: Visual evidence if applicable
- **Additional Notes**: Any extra context for reviewers

---

## Validation

Run these checks before submitting any contribution:

```bash
# Validate structure and schemas
./scripts/validate.sh

# Check frontmatter validity
./scripts/check-frontmatter.sh

# Run tests
npm test
```

### What Validation Checks

- **Structure**: Correct file locations and naming
- **Frontmatter**: Valid YAML, required fields present
- **Schema**: Compliance with JSON Schema definitions
- **IDs**: Uniqueness within categories
- **Links**: Valid internal references

### Handling Validation Errors

If validation fails:

1. Read the error message carefully
2. Check the referenced file and line
3. Compare against the relevant schema in `schemas/`
4. Fix the issue and re-run validation

---

## Questions and Support

- Open a [Discussion](https://github.com/murillodutt/cellm/discussions) for questions
- Review the [PRD documentation](../docs/PRD-CELLM.md) for specifications
- Check existing issues before creating new ones

---

## Recognition

Contributors are acknowledged in release notes. We appreciate your participation in improving CELLM.

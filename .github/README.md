# CELLM v0.10.0

> **Context Engineering for Large Language Models**  
> Transform Claude Code into a senior developer that never forgets your rules.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](../LICENSE)
[![Version](https://img.shields.io/badge/version-0.10.0-green.svg)](https://github.com/murillodutt/cellm/releases)
[![Website](https://img.shields.io/badge/website-cellm.ai-blue)](https://cellm.ai)

---

## What is CELLM?

CELLM is a **context engineering system** designed to give Claude Code a structured, persistent memory. Instead of repeating instructions every session, CELLM provides:

- **Persistent Context**: Rules, patterns, and workflows that persist across sessions
- **Stack-Specific Knowledge**: Optimized for Nuxt 4 + Vue + TypeScript + Tailwind + Drizzle + Stripe
- **Agent System**: Specialized roles (architect, implementer, reviewer) for each development phase
- **Quality Gates**: Automated validation and pattern enforcement

**Result**: 85%+ reduction in recurring errors, consistent code quality, and faster development cycles.

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/murillodutt/cellm.git

# Install dependencies (for validation tools only)
npm install

# Validate structure
npm run validate
```

### Usage in Your Project

```bash
# Copy CELLM rules to your project
./scripts/project-install.sh /path/to/your/project

# Or install globally in ~/.cellm
./scripts/base-install.sh
```

---

## Project Structure

```
cellm/
├── cellm-core/            ← Core system (rules, patterns, workflows)
│   ├── INDEX.md           ← Main entry point for Claude
│   ├── agents/            ← Specialized AI agents
│   ├── commands/          ← Available commands (/plan, /implement, etc.)
│   ├── rules/             ← Mandatory rules (conventions, architecture)
│   ├── patterns/          ← Design patterns and anti-patterns
│   ├── skills/            ← Technology-specific skills
│   ├── workflows/         ← Development workflows
│   └── templates/         ← Configuration templates
│
├── schemas/               ← JSON Schema validation
├── scripts/               ← Installation and validation tools
├── tests/                 ← Automated tests (Vitest)
│
├── .github/               ← GitHub community files
│   ├── README.md          ← This file
│   ├── ABOUT.md           ← Project overview
│   ├── CHANGELOG.md       ← Version history
│   ├── CONTRIBUTING.md    ← Contribution guidelines
│   └── CODE_OF_CONDUCT.md ← Community standards
│
└── CLAUDE.md              ← Development rules for contributors
```

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Nuxt** | 4.x | Full-stack framework |
| **Vue** | 3.x | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Tailwind** | 4.x | Styling system |
| **Nuxt UI** | 4.x | Component library |
| **Pinia** | latest | State management |
| **Drizzle** | latest | Database ORM |
| **Stripe** | latest | Payments |

---

## Core Features

### 1. Layered Context System
- **SESSION** → Temporary task context
- **PROJECT** → Project-specific rules
- **PATTERNS** → Design patterns and anti-patterns
- **DOMAIN** → Frontend/backend/shared rules
- **CORE** → Universal conventions
- **REFERENCE** → Technology documentation

### 2. Agent System
- **Architect**: System design and planning
- **Implementer**: Code execution following patterns
- **Reviewer**: Quality assurance and validation
- **Project Manager**: Task orchestration and status

### 3. Pattern Enforcement
- **5 Critical Anti-Patterns**: Blocking rules for common mistakes
- **8 Technology Patterns**: Best practices for each stack component
- **Automatic Validation**: JSON Schema + automated tests

### 4. Development Workflow
```
/plan-product → /shape-spec → /write-spec → /create-tasks → /implement → /verify
```

---

## Available Commands

| Command | Description | Agent |
|---------|-------------|-------|
| `/plan-product` | Strategic product planning | Architect |
| `/shape-spec` | Collaborative spec shaping | Architect |
| `/write-spec` | Formal specification writing | Architect |
| `/create-tasks` | Task breakdown from spec | Project Manager |
| `/orchestrate-tasks` | Multi-agent task execution | Project Manager |
| `/implement` | Code implementation | Implementer |
| `/verify` | Quality verification | Reviewer |
| `/status` | Project status report | Project Manager |
| `/reuse-check` | Check for reusable components | Architect |
| `/improve-skills` | Enhance skill definitions | Architect |
| `/spec` | Manage multiple specs | Project Manager |
| `/metrics` | Collect and analyze metrics | Project Manager |

---

## Documentation

- **Website**: [cellm.ai](https://cellm.ai)
- **GitHub**: [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)
- **Issues**: [Report bugs or request features](https://github.com/murillodutt/cellm/issues)

---

## Development

### Requirements
- Node.js 18+
- Git

### Testing
```bash
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
npm run test:validation   # Schema validation tests
```

### Validation
```bash
npm run validate          # Validate structure + schemas
npm run lint:md           # Markdown linting
```

---

## Contributing

We welcome contributions! Please read our [Contributing Guidelines](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

MIT License - Copyright (c) 2026 Murillo Dutt / Dutt Yeshua Technology Ltd

See [LICENSE](../LICENSE) for details.

---

## Contact

- **Website**: [cellm.ai](https://cellm.ai)
- **Company**: Dutt Yeshua Technology Ltd
- **Email**: dev@cellm.ai
- **GitHub**: [@murillodutt](https://github.com/murillodutt)

---

**Built with precision for the modern web stack.**

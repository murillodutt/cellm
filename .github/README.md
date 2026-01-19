# CELLM

![Image](https://github.com/user-attachments/assets/ab475e0a-27d1-44e4-886e-261b96839027)

> **Context Engineering for Large Language Models**

[![Version](https://img.shields.io/badge/version-0.10.0-blue.svg)](https://github.com/murillodutt/cellm/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](../LICENSE)
[![Website](https://img.shields.io/badge/web-cellm.ai_(coming_soon)-blue)](https://cellm.ai)
[![Claude Code CLI](https://img.shields.io/badge/Claude_Code-CLI-191919?logo=anthropic&logoColor=white)](https://claude.ai)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)

---

## Overview

CELLM is a context management system for Claude Code CLI. It provides structured, persistent context through rules, patterns, workflows, and specialized agents.

The system loads project-specific knowledge automatically, allowing Claude Code to reference stack conventions, anti-patterns, and development workflows across sessions.

---

## Features

- **Persistent Context** - Project knowledge persists across Claude Code sessions
- **Hierarchical Loading** - Six-layer priority system for context management
- **Stack-Specific Patterns** - Type-safe patterns for supported technologies
- **Workflow Commands** - Structured development phases from planning to verification
- **Pattern Validation** - JSON Schema enforcement for rules and patterns
- **Specialized Agents** - Architect, Implementer, Reviewer, Project Manager

---

## Context Architecture

```
SESSION > PROJECT > PATTERNS > DOMAIN > CORE > REFERENCE
```

| Layer | Purpose |
|-------|---------|
| SESSION | Active task context and state |
| PROJECT | Project-specific rules and overrides |
| PATTERNS | Technology patterns and anti-patterns |
| DOMAIN | Domain-specific conventions |
| CORE | Fundamental rules and behaviors |
| REFERENCE | External documentation and APIs |

---

## Workflow

```
/plan-product  ->  /shape-spec  ->  /write-spec  ->  /create-tasks  ->  /implement  ->  /verify
```

Each phase uses specialized agents for planning, implementation, and review.

---

## Supported Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| ![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDkwMCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNTA0LjkwOCA3NTBIODM5LjQ3NkM4NTAuMTAzIDc1MC4wMDEgODYwLjU0MiA3NDcuMjI5IDg2OS43NDUgNzQxLjk2M0M4NzguOTQ4IDczNi42OTYgODg2LjU4OSA3MjkuMTIxIDg5MS45IDcxOS45OTlDODk3LjIxMSA3MTAuODc2IDkwMC4wMDUgNzAwLjUyOSA5MDAgNjg5Ljk5N0M4OTkuOTk1IDY3OS40NjUgODk3LjE5MyA2NjkuMTIgODkxLjg3MyA2NjAuMDAyTDY2Ny4xODcgMjc0LjI4OUM2NjEuODc2IDI2NS4xNjkgNjU0LjIzNyAyNTcuNTk1IDY0NS4wMzYgMjUyLjMyOUM2MzUuODM1IDI0Ny4wNjQgNjI1LjM5OCAyNDQuMjkxIDYxNC43NzMgMjQ0LjI5MUM2MDQuMTQ5IDI0NC4yOTEgNTkzLjcxMSAyNDcuMDY0IDU4NC41MTEgMjUyLjMyOUM1NzUuMzEgMjU3LjU5NSA1NjcuNjcgMjY1LjE2OSA1NjIuMzYgMjc0LjI4OUw1MDQuOTA4IDM3Mi45NzlMMzkyLjU4MSAxNzkuOTkzQzM4Ny4yNjYgMTcwLjg3NCAzNzkuNjIzIDE2My4zMDEgMzcwLjQyIDE1OC4wMzZDMzYxLjIxNiAxNTIuNzcyIDM1MC43NzcgMTUwIDM0MC4xNTEgMTUwQzMyOS41MjUgMTUwIDMxOS4wODYgMTUyLjc3MiAzMDkuODgzIDE1OC4wMzZDMzAwLjY3OSAxNjMuMzAxIDI5My4wMzYgMTcwLjg3NCAyODcuNzIxIDE3OS45OTNMOC4xMjY0OSA2NjAuMDAyQzIuODA3NDMgNjY5LjEyIDAuMDA0NjI5MzUgNjc5LjQ2NSA1LjcyOTc4ZS0wNiA2ODkuOTk3Qy0wLjAwNDYxNzg5IDcwMC41MjkgMi43ODkwOSA3MTAuODc2IDguMTAwMTUgNzE5Ljk5OUMxMy40MTEyIDcyOS4xMjEgMjEuMDUyMyA3MzYuNjk2IDMwLjI1NSA3NDEuOTYzQzM5LjQ1NzYgNzQ3LjIyOSA0OS44OTczIDc1MC4wMDEgNjAuNTI0IDc1MEgyNzAuNTM4QzM1My43NDggNzUwIDQxNS4xMTIgNzEzLjc3NSA0NTcuMzM2IDY0My4xMDFMNTU5Ljg0OSA0NjcuMTQ1TDYxNC43NTcgMzcyLjk3OUw3NzkuNTQ3IDY1NS44MzRINTU5Ljg0OUw1MDQuOTA4IDc1MFpNMjY3LjExNCA2NTUuNzM3TDEyMC41NTEgNjU1LjcwNEwzNDAuMjQ5IDI3OC41ODZMNDQ5Ljg3IDQ2Ny4xNDVMMzc2LjQ3NCA1OTMuMTc1QzM0OC40MzMgNjM5LjAzIDMxNi41NzcgNjU1LjczNyAyNjcuMTE0IDY1NS43MzdaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==) | Nuxt 4 | Full-stack framework with SSR/SSG |
| ![Vue](https://img.shields.io/badge/Vue-3.0-4FC08D?logo=vue.js&logoColor=white) | Vue 3 | Composition API |
| ![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-v4-00DC82?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDkwMCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNTA0LjkwOCA3NTBIODM5LjQ3NkM4NTAuMTAzIDc1MC4wMDEgODYwLjU0MiA3NDcuMjI5IDg2OS43NDUgNzQxLjk2M0M4NzguOTQ4IDczNi42OTYgODg2LjU4OSA3MjkuMTIxIDg5MS45IDcxOS45OTlDODk3LjIxMSA3MTAuODc2IDkwMC4wMDUgNzAwLjUyOSA5MDAgNjg5Ljk5N0M4OTkuOTk1IDY3OS40NjUgODk3LjE5MyA2NjkuMTIgODkxLjg3MyA2NjAuMDAyTDY2Ny4xODcgMjc0LjI4OUM2NjEuODc2IDI2NS4xNjkgNjU0LjIzNyAyNTcuNTk1IDY0NS4wMzYgMjUyLjMyOUM2MzUuODM1IDI0Ny4wNjQgNjI1LjM5OCAyNDQuMjkxIDYxNC43NzMgMjQ0LjI5MUM2MDQuMTQ5IDI0NCMjkxIDU5My43MTEgMjQ3LjA2NCA1ODQuNTExIDI1Mi4zMjlDNTc1LjMxIDI1Ny41OTUgNTY3LjY3IDI2NS4xNjkgNTYyLjM2IDI3NC4yODlMNTA0LjkwOCAzNzIuOTc5TDM5Mi41ODEgMTc5Ljk5M0MzODcuMjY2IDE3MC44NzQgMzc5LjYyMyAxNjMuMzAxIDM3MC40MiAxNTguMDM2QzM2MS4yMTYgMTUyLjc3MiAzNTAuNzc3IDE1MCAzNDAuMTUxIDE1MEMzMjkuNTI1IDE1MCAzMTkuMDg2IDE1Mi43NzIgMzA5Ljg4MyAxNTguMDM2QzMwMC42NzkgMTYzLjMwMSAyOTMuMDM2IDE3MC44NzQgMjg3LjcyMSAxNzkuOTkzTDguMTI2NDkgNjYwLjAwMkMyLjgwNzQzIDY2OS4xMiAwLjAwNDYyOTM1IDY3OS40NjUgNS43Mjk3OGUtMDYgNjg5Ljk5N0MtMC4wMDQ2MTc4OSA3MDAuNTI5IDIuNzg5MDkgNzEwLjg3NiA4LjEwMDE1IDcxOS45OTlDMTMuNDExMiA3MjkuMTIxIDIxLjA1MjMgNzM2LjY5NiAzMC4yNTUgNzQxLjk2M0MzOS40NTc2IDc0Ny4yMjkgNDkuODk3MyA3NTAuMDAxIDYwLjUyNCA3NTBIMjcwLjUzOEMzNTMuNzQ4IDc1MCA0MTUuMTEyIDcxMy43NzUgNDU3LjMzNiA2NDMuMTAxTDU1OS44NDkgNDY3LjE0NUw2MTQuNzU3IDM3Mi45NzlMNzc5LjU0NyA2NTUuODM0SDU1OS44NDlMNTA0LjkwOCA3NTBaTTI2Ny4xMTQgNjU1LjczN0wxMjAuNTUxIDY1NS43MDRMMzQwLjI0OSAyNzguNTg2TDQ0OS44NyA0NjcuMTQ1TDM3Ni40NzQgNTkzLjE3NUMzNDguNDMzIDYzOS4wMyAzMTYuNTc3IDY1NS43MzcgMjY3LjExNCA2NTUuNzM3WiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=) | Nuxt UI v4 | Component library |
| ![Nuxt Charts](https://img.shields.io/badge/Nuxt_Charts-latest-00DC82?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDkwMCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNTA0LjkwOCA3NTBIODM5LjQ3NkM4NTAuMTAzIDc1MC4wMDEgODYwLjU0MiA3NDcuMjI5IDg2OS43NDUgNzQxLjk2M0M4NzguOTQ4IDczNi42OTYgODg2LjU4OSA3MjkuMTIxIDg5MS45IDcxOS45OTlDODk3LjIxMSA3MTAuODc2IDkwMC4wMDUgNzAwLjUyOSA5MDAgNjg5Ljk5N0M4OTkuOTk1IDY3OS40NjUgODk3LjE5MyA2NjkuMTIgODkxLjg3MyA2NjAuMDAyTDY2Ny4xODcgMjc0LjI4OUM2NjEuODc2IDI2NS4xNjkgNjU0LjIzNyAyNTcuNTk1IDY0NS4wMzYgMjUyLjMyOUM2MzUuODM1IDI0Ny4wNjQgNjI1LjM5OCAyNDQuMjkxIDYxNC43NzMgMjQ0LjI5MUM2MDQuMTQ5IDI0NC4yOTEgNTkzLjcxMSAyNDcuMDY0IDU4NC41MTEgMjUyLjMyOUM1NzUuMzEgMjU3LjU5NSA1NjcuNjcgMjY1LjE2OSA1NjIuMzYgMjc0LjI4OUw1MDQuOTA4IDM3Mi45NzlMMzkyLjU4MSAxNzkuOTkzQzM4Ny4yNjYgMTcwLjg3NCAzNzkuNjIzIDE2My4zMDEgMzcwLjQyIDE1OC4wMzZDMzYxLjIxNiAxNTIuNzcyIDM1MC43NzcgMTUwIDM0MC4xNTEgMTUwQzMyOS41MjUgMTUwIDMxOS4wODYgMTUyLjc3MiAzMDkuODgzIDE1OC4wMzZDMzAwLjY3OSAxNjMuMzAxIDI5My4wMzYgMTcwLjg3NCAyODcuNzIxIDE3OS45OTNMOC4xMjY0OSA2NjAuMDAyQzIuODA3NDMgNjY5LjEyIDAuMDA0NjI5MzUgNjc5LjQ2NSA1LjcyOTc4ZS0wNiA2ODkuOTk3Qy0wLjAwNDYxNzg5IDcwMC41MjkgMi43ODkwOSA3MTAuODc2IDguMTAwMTUgNzE5Ljk5OUMxMy40MTEyIDcyOS4xMjEgMjEuMDUyMyA3MzYuNjk2IDMwLjI1NSA3NDEuOTYzQzM5LjQ1NzYgNzQ3LjIyOSA0OS44OTczIDc1MC4wMDEgNjAuNTI0IDc1MEgyNzAuNTM4QzM1My43NDggNzUwIDQxNS4xMTIgNzEzLjc3NSA0NTcuMzM2IDY0My4xMDFMNTU5Ljg0OSA0NjcuMTQ1TDYxNC43NTcgMzcyLjk3OUw3NzkuNTQ3IDY1NS44MzRINTU5Ljg0OUw1MDQuOTA4IDc1MFpNMjY3LjExNCA2NTUuNzM3TDEyMC41NTEgNjU1LjcwNEwzNDAuMjQ5IDI3OC41ODZMNDQ5Ljg3IDQ2Ny4xNDVMMzc2LjQ3NCA1OTMuMTc1QzM0OC40MzMgNjM5LjAzIDMxNi41NzcgNjU1LjczNyAyNjcuMTE0IDY1NS43MzdaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==) | Nuxt Charts | Data visualization |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) | TypeScript 5 | Type system |
| ![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white) | Tailwind v4 | CSS framework |
| ![Pinia](https://img.shields.io/badge/Pinia-latest-FFD859?logo=pinia&logoColor=black) | Pinia | State management |
| ![Drizzle](https://img.shields.io/badge/Drizzle-latest-C5F74F?logo=drizzle&logoColor=black) | Drizzle ORM | Database ORM |
| ![Stripe](https://img.shields.io/badge/Stripe-latest-008CDD?logo=stripe&logoColor=white) | Stripe | Payment processing |

---

## Core Components

**Agents**
- Architect: System design and technical planning
- Implementer: Code execution following defined patterns
- Reviewer: Quality assurance and validation
- Project Manager: Task orchestration and tracking

**Pattern Enforcement**
- 5 blocking anti-patterns
- 8 technology-specific patterns
- JSON Schema validation
- Pattern compliance metrics

**Budget Management**
- 2000 token default context limit
- Priority Context Loading (PCL)
- Automatic context pruning

---

## Project Status

**Version:** 0.10.0 (Pre-release)
**Status:** Feature complete, public testing
**License:** MIT

---

## Documentation

- Installation guide (coming soon)
- Quick start tutorial (coming soon)
- Full documentation (coming soon)

---

## Built By

**Dutt Yeshua Technology Ltd**

**Website:** [cellm.ai](https://cellm.ai) (coming soon)
**Repository:** [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)

---

## License

MIT License - Copyright (c) 2026 Murillo Dutt / Dutt Yeshua Technology Ltd

See [LICENSE](../LICENSE) for details.

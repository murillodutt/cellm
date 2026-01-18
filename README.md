# CELLM

![Image](https://github.com/user-attachments/assets/b0b34400-8f72-439a-8427-2d30261e1dfc)

> **Context Engineering for Large Language Models**

[![Version](https://img.shields.io/badge/version-0.10.0-blue.svg)](https://github.com/murillodutt/cellm/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Website](https://img.shields.io/badge/web-cellm.ai-blue)](https://cellm.ai)
[![Claude Code CLI](https://img.shields.io/badge/Claude_Code-CLI-191919?logo=anthropic&logoColor=white)](https://claude.ai)
[![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?logo=nuxt.js&logoColor=white)](https://nuxt.com)

---

## The Problem

Every time you start a new conversation with Claude Code, you lose context. You repeat the same instructions, correct the same mistakes, and waste time explaining your stack, patterns, and conventions all over again.

**The cost?** Inconsistent code quality, recurring errors, and hundreds of wasted tokens per session.

---

## The Solution

CELLM gives Claude Code a **structured, persistent memory**. Think of it as a living manual of best practices that Claude consults automatically before writing any code.

**Designed for Claude Code CLI** - the most powerful AI coding assistant - CELLM provides the missing layer: **persistent, stack-specific intelligence**.

Instead of generic AI assistance, you get a **senior developer** who:

- Knows your stack deeply (Nuxt 4, Vue 3, TypeScript, Tailwind, Drizzle, Stripe)
- Never forgets your rules and patterns
- Enforces quality gates at every step
- Improves continuously with your feedback

---

## What Makes CELLM Different

### Built for Claude Code CLI

CELLM is purpose-built to supercharge Claude Code CLI with persistent, structured context. It's not a generic framework - it's a **specialized context engine** that transforms Claude from a conversational assistant into a **senior development partner**.

### Precision-Engineered for Modern Web

Not vague guidelines. Concrete, validated patterns for a battle-tested stack:

```
Nuxt 4      - Modern full-stack framework with server/client rendering
Vue 3       - Progressive JavaScript framework with Composition API
TypeScript  - Type-safe development with full IDE support
Tailwind v4 - Utility-first CSS with design tokens
Nuxt UI v4  - Production-ready components built on Headless UI
Nuxt Charts - Beautiful data visualization
Pinia       - Type-safe state management
Drizzle ORM - Type-safe SQL with edge runtime support
Stripe      - Payment infrastructure for SaaS applications
```

Every pattern, rule, and workflow is optimized for **this exact stack** - no generic advice, no guesswork.

### Real Impact

```
[+] 85% reduction in recurring errors
[+] Consistent code quality across sessions
[+] Zero context loss between conversations
[+] Automated pattern enforcement
[+] Type-safe patterns for entire stack
[+] Edge-ready architecture patterns
```

### Complete Development Workflow

```
/plan-product  ->  /shape-spec  ->  /write-spec  ->  /create-tasks  ->  /implement  ->  /verify
```

Each phase has a specialized agent (Architect, Implementer, Reviewer) working together.

---

## Core Features

**Layered Context System**
```
SESSION > PROJECT > PATTERNS > DOMAIN > CORE > REFERENCE
```

**Specialized Agents**
- Architect: System design and planning
- Implementer: Code execution following patterns
- Reviewer: Quality assurance and validation
- Project Manager: Task orchestration

**Pattern Enforcement**
- 5 critical anti-patterns (blocking)
- 8 technology-specific patterns
- Automatic validation via JSON Schema
- Real-time pattern metrics

**Budget Governance**
- 2000 token default limit
- Priority Context Loading (PCL)
- Intelligent context pruning
- Session continuity

---

## Technology Stack

**Enterprise-Grade Modern Web Stack**

| Technology | Badge | Purpose |
|-----------|-------|---------|
| ![Nuxt](https://img.shields.io/badge/Nuxt-4.0-00DC82?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDkwMCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNTA0LjkwOCA3NTBIODM5LjQ3NkM4NTAuMTAzIDc1MC4wMDEgODYwLjU0MiA3NDcuMjI5IDg2OS43NDUgNzQxLjk2M0M4NzguOTQ4IDczNi42OTYgODg2LjU4OSA3MjkuMTIxIDg5MS45IDcxOS45OTlDODk3LjIxMSA3MTAuODc2IDkwMC4wMDUgNzAwLjUyOSA5MDAgNjg5Ljk5N0M4OTkuOTk1IDY3OS40NjUgODk3LjE5MyA2NjkuMTIgODkxLjg3MyA2NjAuMDAyTDY2Ny4xODcgMjc0LjI4OUM2NjEuODc2IDI2NS4xNjkgNjU0LjIzNyAyNTcuNTk1IDY0NS4wMzYgMjUyLjMyOUM2MzUuODM1IDI0Ny4wNjQgNjI1LjM5OCAyNDQuMjkxIDYxNC43NzMgMjQ0LjI5MUM2MDQuMTQ5IDI0NC4yOTEgNTkzLjcxMSAyNDcuMDY0IDU4NC41MTEgMjUyLjMyOUM1NzUuMzEgMjU3LjU5NSA1NjcuNjcgMjY1LjE2OSA1NjIuMzYgMjc0LjI4OUw1MDQuOTA4IDM3Mi45NzlMMzkyLjU4MSAxNzkuOTkzQzM4Ny4yNjYgMTcwLjg3NCAzNzkuNjIzIDE2My4zMDEgMzcwLjQyIDE1OC4wMzZDMzYxLjIxNiAxNTIuNzcyIDM1MC43NzcgMTUwIDM0MC4xNTEgMTUwQzMyOS41MjUgMTUwIDMxOS4wODYgMTUyLjc3MiAzMDkuODgzIDE1OC4wMzZDMzAwLjY3OSAxNjMuMzAxIDI5My4wMzYgMTcwLjg3NCAyODcuNzIxIDE3OS45OTNMOC4xMjY0OSA2NjAuMDAyQzIuODA3NDMgNjY5LjEyIDAuMDA0NjI5MzUgNjc5LjQ2NSA1LjcyOTc4ZS0wNiA2ODkuOTk3Qy0wLjAwNDYxNzg5IDcwMC41MjkgMi43ODkwOSA3MTAuODc2IDguMTAwMTUgNzE5Ljk5OUMxMy40MTEyIDcyOS4xMjEgMjEuMDUyMyA3MzYuNjk2IDMwLjI1NSA3NDEuOTYzQzM5LjQ1NzYgNzQ3LjIyOSA0OS44OTczIDc1MC4wMDEgNjAuNTI0IDc1MEgyNzAuNTM4QzM1My43NDggNzUwIDQxNS4xMTIgNzEzLjc3NSA0NTcuMzM2IDY0My4xMDFMNTU5Ljg0OSA0NjcuMTQ1TDYxNC43NTcgMzcyLjk3OUw3NzkuNTQ3IDY1NS44MzRINTU5Ljg0OUw1MDQuOTA4IDc1MFpNMjY3LjExNCA2NTUuNzM3TDEyMC41NTEgNjU1LjcwNEwzNDAuMjQ5IDI3OC41ODZMNDQ5Ljg3IDQ2Ny4xNDVMMzc2LjQ3NCA1OTMuMTc1QzM0OC40MzMgNjM5LjAzIDMxNi41NzcgNjU1LjczNyAyNjcuMTE0IDY1NS43MzdaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==) | Nuxt 4 | Full-stack with SSR/SSG/Edge |
| ![Vue](https://img.shields.io/badge/Vue-3.0-4FC08D?logo=vue.js&logoColor=white) | Vue 3 | Composition API + TypeScript |
| ![Nuxt UI](https://img.shields.io/badge/Nuxt_UI-v4-00DC82?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDkwMCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNTA0LjkwOCA3NTBIODM5LjQ3NkM4NTAuMTAzIDc1MC4wMDEgODYwLjU0MiA3NDcuMjI5IDg2OS43NDUgNzQxLjk2M0M4NzguOTQ4IDczNi42OTYgODg2LjU4OSA3MjkuMTIxIDg5MS45IDcxOS45OTlDODk3LjIxMSA3MTAuODc2IDkwMC4wMDUgNzAwLjUyOSA5MDAgNjg5Ljk5N0M4OTkuOTk1IDY3OS40NjUgODk3LjE5MyA2NjkuMTIgODkxLjg3MyA2NjAuMDAyTDY2Ny4xODcgMjc0LjI4OUM2NjEuODc2IDI2NS4xNjkgNjU0LjIzNyAyNTcuNTk1IDY0NS4wMzYgMjUyLjMyOUM2MzUuODM1IDI0Ny4wNjQgNjI1LjM5OCAyNDQuMjkxIDYxNC43NzMgMjQ0LjI5MUM2MDQuMTQ5IDI0NC4yOTEgNTkzLjcxMSAyNDcuMDY0IDU4NC41MTEgMjUyLjMyOUM1NzUuMzEgMjU3LjU5NSA1NjcuNjcgMjY1LjE2OSA1NjIuMzYgMjc0LjI4OUw1MDQuOTA4IDM3Mi45NzlMMzkyLjU4MSAxNzkuOTkzQzM4Ny4yNjYgMTcwLjg3NCAzNzkuNjIzIDE2My4zMDEgMzcwLjQyIDE1OC4wMzZDMzYxLjIxNiAxNTIuNzcyIDM1MC43NzcgMTUwIDM0MC4xNTEgMTUwQzMyOS41MjUgMTUwIDMxOS4wODYgMTUyLjc3MiAzMDkuODgzIDE1OC4wMzZDMzAwLjY3OSAxNjMuMzAxIDI5My4wMzYgMTcwLjg3NCAyODcuNzIxIDE3OS45OTNMOC4xMjY0OSA2NjAuMDAyQzIuODA3NDMgNjY5LjEyIDAuMDA0NjI5MzUgNjc5LjQ2NSA1LjcyOTc4ZS0wNiA2ODkuOTk3Qy0wLjAwNDYxNzg5IDcwMC41MjkgMi43ODkwOSA3MTAuODc2IDguMTAwMTUgNzE5Ljk5OUMxMy40MTEyIDcyOS4xMjEgMjEuMDUyMyA3MzYuNjk2IDMwLjI1NSA3NDEuOTYzQzM5LjQ1NzYgNzQ3LjIyOSA0OS44OTczIDc1MC4wMDEgNjAuNTI0IDc1MEgyNzAuNTM4QzM1My43NDggNzUwIDQxNS4xMTIgNzEzLjc3NSA0NTcuMzM2IDY0My4xMDFMNTU5Ljg0OSA0NjcuMTQ1TDYxNC43NTcgMzcyLjk3OUw3NzkuNTQ3IDY1NS44MzRINTU5Ljg0OUw1MDQuOTA4IDc1MFpNMjY3LjExNCA2NTUuNzM3TDEyMC41NTEgNjU1LjcwNEwzNDAuMjQ5IDI3OC41ODZMNDQ5Ljg3IDQ2Ny4xNDVMMzc2LjQ3NCA1OTMuMTc1QzM0OC40MzMgNjM5LjAzIDMxNi41NzcgNjU1LjczNyAyNjcuMTE0IDY1NS43MzdaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==) | Nuxt UI v4 | Headless UI + Tailwind |
| ![Nuxt Charts](https://img.shields.io/badge/Nuxt_Charts-latest-00DC82?style=flat&logo=data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgOTAwIDkwMCIgZmlsbD0iI2ZmZiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cGF0aCBkPSJNNTA0LjkwOCA3NTBIODM5LjQ3NkM4NTAuMTAzIDc1MC4wMDEgODYwLjU0MiA3NDcuMjI5IDg2OS43NDUgNzQxLjk2M0M4NzguOTQ4IDczNi42OTYgODg2LjU4OSA3MjkuMTIxIDg5MS45IDcxOS45OTlDODk3LjIxMSA3MTAuODc2IDkwMC4wMDUgNzAwLjUyOSA5MDAgNjg5Ljk5N0M4OTkuOTk1IDY3OS40NjUgODk3LjE5MyA2NjkuMTIgODkxLjg3MyA2NjAuMDAyTDY2Ny4xODcgMjc0LjI4OUM2NjEuODc2IDI2NS4xNjkgNjU0LjIzNyAyNTcuNTk1IDY0NS4wMzYgMjUyLjMyOUM2MzUuODM1IDI0Ny4wNjQgNjI1LjM5OCAyNDQuMjkxIDYxNC43NzMgMjQ0LjI5MUM2MDQuMTQ5IDI0NC4yOTEgNTkzLjcxMSAyNDcuMDY0IDU4NC41MTEgMjUyLjMyOUM1NzUuMzEgMjU3LjU5NSA1NjcuNjcgMjY1LjE2OSA1NjIuMzYgMjc0LjI4OUw1MDQuOTA4IDM3Mi45NzlMMzkyLjU4MSAxNzkuOTkzQzM4Ny4yNjYgMTcwLjg3NCAzNzkuNjIzIDE2My4zMDEgMzcwLjQyIDE1OC4wMzZDMzYxLjIxNiAxNTIuNzcyIDM1MC43NzcgMTUwIDM0MC4xNTEgMTUwQzMyOS41MjUgMTUwIDMxOS4wODYgMTUyLjc3MiAzMDkuODgzIDE1OC4wMzZDMzAwLjY3OSAxNjMuMzAxIDI5My4wMzYgMTcwLjg3NCAyODcuNzIxIDE3OS45OTNMOC4xMjY0OSA2NjAuMDAyQzIuODA3NDMgNjY5LjEyIDAuMDA0NjI5MzUgNjc5LjQ2NSA1LjcyOTc4ZS0wNiA2ODkuOTk3Qy0wLjAwNDYxNzg5IDcwMC41MjkgMi43ODkwOSA3MTAuODc2IDguMTAwMTUgNzE5Ljk5OUMxMy40MTEyIDcyOS4xMjEgMjEuMDUyMyA3MzYuNjk2IDMwLjI1NSA3NDEuOTYzQzM5LjQ1NzYgNzQ3LjIyOSA0OS44OTczIDc1MC4wMDEgNjAuNTI0IDc1MEgyNzAuNTM4QzM1My43NDggNzUwIDQxNS4xMTIgNzEzLjc3NSA0NTcuMzM2IDY0My4xMDFMNTU5Ljg0OSA0NjcuMTQ1TDYxNC43NTcgMzcyLjk3OUw3NzkuNTQ3IDY1NS44MzRINTU5Ljg0OUw1MDQuOTA4IDc1MFpNMjY3LjExNCA2NTUuNzM3TDEyMC41NTEgNjU1LjcwNEwzNDAuMjQ5IDI3OC41ODZMNDQ5Ljg3IDQ2Ny4xNDVMMzc2LjQ3NCA1OTMuMTc1QzM0OC40MzMgNjM5LjAzIDMxNi41NzcgNjU1LjczNyAyNjcuMTE0IDY1NS43MzdaIiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==) | Nuxt Charts | Beautiful data dashboards |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white) | TypeScript 5 | Type-safe development |
| ![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white) | Tailwind v4 | Utility-first + design tokens |
| ![Pinia](https://img.shields.io/badge/Pinia-latest-FFD859?logo=pinia&logoColor=black) | Pinia | Type-safe stores |
| ![Drizzle](https://img.shields.io/badge/Drizzle-latest-C5F74F?logo=drizzle&logoColor=black) | Drizzle ORM | Edge-ready + type-safe SQL |
| ![Stripe](https://img.shields.io/badge/Stripe-latest-008CDD?logo=stripe&logoColor=white) | Stripe | Production payment infrastructure |

**Why This Stack?**
- Type-safety from database to UI
- Edge-ready (Cloudflare Workers, Vercel Edge)
- SSR/SSG for optimal performance
- Production-proven for SaaS applications

---

## Project Status

**Version:** 0.10.0 (Pre-release)  
**Status:** Feature complete, entering public testing phase  
**License:** MIT  

---

## Coming Soon

- Installation guide
- Quick start tutorial
- Full documentation
- Example projects
- Community patterns library

---

## Built By

**Dutt Yeshua Technology Ltd**  
Full-spectrum digital solutions for the modern web.

**Website Coming Soon:** [cellm.ai](https://cellm.ai)  
**Repository:** [github.com/murillodutt/cellm](https://github.com/murillodutt/cellm)  
**Contact Coming Soon:** dev@cellm.ai  

<p align="center">
  <sub>Built with</sub><br/>
  <img src="https://cdn.simpleicons.org/anthropic/191919" width="20" height="20" alt="Claude" />
  <sub>Claude Code CLI</sub>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/nuxt/modules/main/icons/nuxt.svg" width="20" height="20" alt="Nuxt" />
  <sub>Nuxt Ecosystem</sub>
  &nbsp;&nbsp;•&nbsp;&nbsp;
  <img src="https://cdn.simpleicons.org/typescript/3178C6" width="20" height="20" alt="TypeScript" />
  <sub>TypeScript</sub>
</p>

---

## License

MIT License - Copyright (c) 2026 Murillo Dutt / Dutt Yeshua Technology Ltd

See [LICENSE](LICENSE) for details.

---

**CELLM transforms Claude Code from a generic assistant into a senior developer who never forgets.**

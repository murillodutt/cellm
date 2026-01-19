---
id: CELLM-INDEX
version: v0.10.0
status: OK
alwaysApply: true
budget: ~200 tokens
---

# CELLM Core

## Always Load

- rules/core/conventions.md
- rules/core/limits.md
- rules/core/protocols.md
- patterns/anti/prohibited.md
- patterns/index.md

## By Command

| Command | Agent | Workflow |
|---------|-------|----------|
| /plan-product | architect | workflows/plan-product.md |
| /shape-spec | architect | workflows/shape-spec.md |
| /write-spec | architect | workflows/write-spec.md |
| /create-tasks | project-manager | workflows/create-tasks.md |
| /orchestrate-tasks | project-manager | workflows/orchestrate-tasks.md |
| /implement | implementer | workflows/implement.md |
| /verify | reviewer | workflows/verify.md |
| /status | project-manager | commands/status.md |
| /reuse-check | architect | commands/reuse-check.md |
| /improve-skills | architect | workflows/improve-skills.md |
| /spec | project-manager | commands/spec.md |
| /metrics | project-manager | commands/metrics.md |

## By Path

| Pattern | Rules | Skills | Patterns |
|---------|-------|--------|----------|
| app/**/*.vue | domain/frontend | vue, nuxt, nuxt-ui, tailwind | VU-*, NX-*, UI-*, TW-* |
| server/** | domain/backend | nuxt, drizzle | NX-*, DR-* |
| shared/** | domain/shared | - | TS-* |
| **/store/** | - | pinia | PN-* |
| **/stripe/** | - | stripe | ST-* |

## Agents

| Agent | Responsibility |
|-------|------------------|
| architect | Architecture, specs, reuse |
| implementer | Code, tasks |
| reviewer | Quality, verification |
| project-manager | Tasks, status, metrics |

## Commands

```text
/plan-product   /shape-spec       /write-spec       /create-tasks
/orchestrate-tasks                /implement        /verify
/status         /reuse-check      /improve-skills   /spec
/metrics
```

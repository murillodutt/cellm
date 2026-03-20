---
description: "Check CELLM Oracle Worker daemon status. Reads worker.json for port config, calls health endpoint, reports online/offline state with uptime and database info. Use when: 'oracle status', 'is worker running', 'check cellm status'."
user-invocable: true
argument-hint: "[verbose]"
allowed-tools: Bash(curl *), Bash(cat *), Read
---

Read `~/.cellm/worker.json` for port → call health endpoint → report status/port/uptime/DB.

No worker.json → `[-] No ~/.cellm/worker.json found`. Health fails → `[-] Worker offline at port {PORT}`.

## NEVER

- **NEVER guess the port** — always read it from `~/.cellm/worker.json`.
- **NEVER hang or retry endlessly** — fail gracefully and report offline immediately if the curl fails.

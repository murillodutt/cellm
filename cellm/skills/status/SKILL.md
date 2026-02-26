---
name: status
description: Check CELLM Oracle Worker daemon status. Reads worker.json for port config, calls health endpoint, and reports online/offline state with uptime and database info.
argument-hint: "[verbose]"
allowed-tools: Bash(curl *), Bash(cat *), Read
---

Read `~/.cellm/worker.json` for port → call health endpoint → report status/port/uptime/DB.

No worker.json → `[-] No ~/.cellm/worker.json found`. Health fails → `[-] Worker offline at port {PORT}`.

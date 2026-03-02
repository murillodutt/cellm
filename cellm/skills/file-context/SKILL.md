---
description: Passive file relationship classifier — detects multi-file systems and enforces Related files headers. Activates when creating or modifying files that participate in cross-file protocols, shared data flows, or lifecycle chains.
user-invocable: false
---

# File Context — Before Editing

When touching a file, classify its relationship to other files:

| Signal | Classification | Action |
|--------|---------------|--------|
| Single-purpose utility, no imports from siblings | STANDALONE | No header needed |
| Request/response chain, event emitter/listener | PROTOCOL | Add Related files header |
| Shared config, DB schema used by multiple consumers | SHARED DATA | Add Related files header |
| Start/stop/cleanup sequence across files | LIFECYCLE | Add Related files header |
| Pipeline stage: output of one file is input of next | PIPELINE | Add Related files header |

## Detection Signals

You are in a multi-file system when ANY of these are true:

- File imports from 2+ siblings in the same domain directory
- File writes a resource that another file reads (JSON, port file, DB table)
- File is part of a start/stop/cleanup lifecycle (scripts, daemons, workers)
- File defines a type/interface consumed by 3+ other files
- Changing this file without updating related files would break the system

## Related Files Header Format

```typescript
/**
 * <Title> — <One-line purpose>
 *
 * <Optional: deeper explanation, patterns, constraints>
 *
 * Related files (<System Name>):
 *  - path/to/file-a.ts    — <role in the system>
 *  - path/to/file-b.sh    — <role in the system>
 *  - path/to/file-c.ts    — <role in the system>
 */
```

Rules:
- System name in parentheses identifies the group (e.g., "SDK Sidecar System")
- Each entry: relative path + em dash + role description
- Align em dashes for readability
- Include runtime files (e.g., `~/.cellm/sdk-sidecar.json`) when relevant

## Read-Before-Edit Rule

If the file you are about to modify has a `Related files` header:

1. **STOP** — read every file listed in the header before editing
2. Understand how your change affects each related file
3. Update related files if your change requires it
4. Update the header itself if files were added or removed

## When to Add Headers

Add a Related files header when you **create or significantly modify** a file that:
- Participates in a system with 3+ coupled files
- Has non-obvious dependencies (runtime files, config, scripts)
- Would break silently if edited without understanding the full system

Do NOT add headers to:
- Standalone utilities with no cross-file coupling
- Test files (the file under test is obvious)
- Type-only files (`.d.ts`, pure interfaces)

## NEVER

- **Edit a file with Related files header without reading all listed files first**
- **Add Related files to standalone utilities** — noise kills the signal
- **List every import as a related file** — only files that form a SYSTEM, not casual dependencies
- **Forget to update the header** when adding or removing files from the system

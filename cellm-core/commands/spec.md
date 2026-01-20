---
id: CMD-SPEC
version: v1.1.0
status: OK
command: spec
agent: project-manager
budget: ~300 tokens
---

# /spec

## Subcommands

### /spec list

Lists all specs and their states.

```text
PROJECT SPECS
────────────────────────────────────────────
[+] 2026-01-15-onboarding      [completed]
◐ 2026-01-17-user-auth       [implementing] ← ACTIVE
○ 2026-01-18-billing         [specified]
○ 2026-01-20-notifications   [shaping]
◌ 2026-01-25-reports         [backlog]
────────────────────────────────────────────
```

### /spec {name}

Activates a specific spec.

1. Update config.yaml → active_spec
2. Load spec context
3. Show summary

### /spec new {name}

Creates a new spec.

1. Create folder specs/{date}-{name}/
2. Create planning/
3. Start /shape-spec

### /spec deps

Shows dependencies between specs.

```text
DEPENDENCIES
────────────────────────────────────────────
billing ──depends──► user-auth
notifications ──depends──► user-auth
reports ──depends──► billing
────────────────────────────────────────────
```

## States

| State | Symbol | Description |
| ----- | ------ | ----------- |
| backlog | ◌ | Planned |
| shaping | ○ | In research |
| specified | ○ | Spec complete |
| implementing | ◐ | In code |
| verifying | ◐ | In verification |
| completed | [+] | Completed |
| blocked | [-] | Blocked |

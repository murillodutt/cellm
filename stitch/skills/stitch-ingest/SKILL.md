---
description: "Ingest Stitch DESIGN.md into DSE using SCE-governed contracts and outcome tracking. Use when: 'ingest design', 'stitch to dse', 'sync design.md'."
user-invocable: true
argument-hint: "[path to DESIGN.md or .stitch/ directory]"
allowed-tools: Read, Glob, AskUserQuestion, mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__context_record_outcome, mcp__cellm-oracle__context_certify
---

# stitch-ingest

Thin skill contract:

1. Intent
- Parse Stitch design decisions and route them to DSE-compatible atoms.

2. Policy
- Preflight context with explicit project/design scope.
- Deduplicate against existing decisions before persistence.
- Certify ingestion quality and record outcome metadata.

3. Routing
- DESIGN parsing and mapping: skill-local logic.
- DSE persistence: runtime endpoints/tools.
- Policy and learning loop: SCE `context_*`.

## NEVER

- Persist without dedup checks.
- Skip certification after ingestion batch.

---
description: "Deep examiner for subsystem mapping and evidence-based findings with SCE envelope and write-back. Use when: 'argus on X', 'analyze block', 'map subsystem'."
cellm_scope: universal
user-invocable: true
argument-hint: "[block or subsystem name]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__context_certify, Read, Grep, Glob, Bash
---

# argus

Thin skill contract:

1. Intent
- Produce a high-confidence diagnostic view of a target block.
- Identify operable findings, construction opportunities, and monitor-only items.

2. Policy
- Start with `context_preflight` using the block scope and explicit constraints.
- Every promoted finding must carry verifiable evidence.
- Persist run outcomes through `context_record_outcome` (`flow: "orchestrate"`).
- Run `context_certify` before final verdict publication.

3. Routing
- Context shaping, ranking, and policy gating: SCE `context_*`.
- File/system/database evidence collection: local tools.
- Report synthesis: technical report artifacts in docs.

## Observation Cycle

1. Build scope envelope with preflight.
2. Execute multi-lens evidence sweep.
3. Classify findings (operate/construct/monitor).
4. Certify report quality and publish outputs.
5. Record outcome for learning loop.

## NEVER

- Promote suspicion without evidence.
- Encode local ranking heuristics in the skill.
- Close analysis without certification and write-back.

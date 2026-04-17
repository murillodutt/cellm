---
description: "Frontend architecture orchestrator that routes UI work through SCE context, DSE policy, and enforceable contracts."
cellm_scope: universal
user-invocable: true
---

# gdu

Thin skill contract:

1. Intent
- Turn frontend requests into deterministic architecture and implementation directives.

2. Policy
- Resolve design constraints via DSE first, then project theme files, then defaults.
- Require preflight for each scoped frontend phase.
- Certify directive compliance before phase completion.
- Record outcome and violations for learning loop.

3. Routing
- Component/page orchestration: gdu/vue/nuxt/tailwind/pinia skills.
- Context shaping and contract gate: SCE `context_*`.
- Quality and directive evidence: runtime verification flow.

## Mandatory Contract

- Typed props/emits and explicit data flow.
- Semantic tokens only; no local palette drift.
- Directive verification before completion.

## NEVER

- Encode design ranking logic in the skill layer.
- Approve UI completion without certification evidence.

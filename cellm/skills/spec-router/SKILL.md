---
description: Passive CellmOS work classifier — routes each action to trivial (just do it), query (research first), or spec (create check in DB) before execution. Activates before non-trivial work to prevent ungoverned changes. Complements cellm:spec, does not replace it.
user-invocable: false
allowed-tools: mcp__cellm-oracle__context_preflight, mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_create_node
---

# Work Routing — Before Action

Classify work and route non-trivial execution to the SCE + spec pipeline.

## Intent

- Classify incoming requests as `TRIVIAL`, `QUERY`, or `SPEC`.
- Keep this skill as a router only.

## Policy

- For `SPEC`, run `context_preflight` before deciding execution route.
- Do not perform local ranking, merge, or policy evaluation in this skill.
- Use spec tools only to create/search/transition check state.

## Routing

1. Detect project and classify request.
2. `TRIVIAL`: execute directly.
3. `QUERY`: answer with research path.
4. `SPEC`: `spec_search` then `context_preflight`, then continue in spec-driven flow.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after router processing, write feedback entry to `dev-cellm-feedback/entries/spec-router-{date}-{seq}.md`. Note which routing stages filtered effectively, whether the pipeline produced actionable specs, and which input formats caused parsing issues. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Skip classification** — every non-trivial action goes through the router
- **Create duplicate specs** — always `spec_search` first
- **Run custom ranking inside the skill** — routing is thin; SCE owns scoring and budget
- **Force specs on trivial work** — router is a filter, not a tax

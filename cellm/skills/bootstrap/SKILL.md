---
description: "Bootstrap CELLM in a fresh project with visibility-aware defaults, local field capture, and Oracle registration. Use when: 'bootstrap project', 'setup cellm in this repo', 'onboard this repository'."
cellm_scope: universal
user-invocable: true
argument-hint: "[mode]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__knowledge_add, Read, Grep, Glob, Write, Edit, Bash(git *), Bash(cp *), Bash(mkdir *), Bash(bunx lefthook *), Bash(bun run quality:*), AskUserQuestion
---

# bootstrap

Thin skill contract:

1. Intent
- Initialize portable CELLM project scaffolding in any repository.
- Create a warm session handoff artifact for the next interaction.

2. Policy
- Detect repository visibility before defaulting file layout.
- Ask only when visibility cannot be confidently inferred.
- Prefer project-local artifacts over global assumptions.

3. Routing
- Visibility check: inspect `git remote -v`; infer public/private from host URL and naming hints.
- Scaffolding: create `.cellm-field/entries/`, `.cellm-field/SCHEMA.md`, and `docs/letters/` when absent.
- SCHEMA.md MUST be copied verbatim from `${CLAUDE_PLUGIN_ROOT}/skills/bootstrap/templates/SCHEMA.md`. Do not paraphrase, do not reconstruct from memory, do not adapt from another project's SCHEMA.
- Quality layer seeding (Local Quality Recipe v1):
  - If `<repo>/scripts/quality-router.ts` is absent, copy verbatim from `${CLAUDE_PLUGIN_ROOT}/skills/bootstrap/templates/quality/quality-router.ts`.
  - If `<repo>/lefthook.yml` is absent, copy verbatim from `${CLAUDE_PLUGIN_ROOT}/skills/bootstrap/templates/quality/lefthook.yml`. If present, do NOT overwrite — emit a handoff note instructing manual merge of the `pre-commit` block.
  - Merge `${CLAUDE_PLUGIN_ROOT}/skills/bootstrap/templates/quality/package-scripts.json` `scripts` into the adopter's `package.json` `scripts`. Never overwrite a key already defined; on conflict, emit a handoff note instead.
  - After seeding, run `bunx lefthook install` and `bun run quality:list` to confirm activation.
- Registration: persist bootstrap summary via `knowledge_add` with `source: "bootstrap"`.
- Handoff: generate `docs/letters/BOOTSTRAP-HANDOFF.md` with context, decisions, and next actions, including the surfaces detected by the seeded router and any merge-conflict notes from the quality layer step.

## NEVER

- Assume repository visibility without checking remotes.
- Hardcode internal-only paths or private workflow folders.
- Block bootstrap because Oracle config tools are unavailable; use knowledge fallback.
- Generate SCHEMA.md from memory or from another project's SCHEMA — always copy from the bundled template.
- Overwrite an existing `lefthook.yml` or `package.json` script key during quality layer seeding — always merge or emit a handoff note.
- Edit the bundled `quality-router.ts` template before copying — adopters customize after seeding.

---
description: "Quality layer template — bundled with `cellm:bootstrap`. Seeds adaptive pre-commit gates via surface router. Source of truth: docs/policies/QUALITY-CONTRACT.md in cellm-private."
status: template
---

# Local Quality Recipe — Bootstrap Template

Bundled by `cellm:bootstrap` skill. Seeds the auto-adaptive quality layer
in any adopter project.

## Files in this template

| File | Destination | Role |
|------|-------------|------|
| `quality-router.ts` | `<repo>/scripts/quality-router.ts` | Surface router CLI |
| `lefthook.yml` | `<repo>/lefthook.yml` (merge) | Pre-commit hook config |
| `package-scripts.json` | merge into `<repo>/package.json` `"scripts"` | Public quality:* + commit:check aliases |

## Bootstrap routing

When `cellm:bootstrap` runs in a fresh repo, it:

1. Detects whether `scripts/quality-router.ts` already exists.
2. If absent, copies `quality-router.ts` verbatim from this template.
3. Detects whether `lefthook.yml` already exists.
   - If absent, copies the template verbatim.
   - If present, prompts the adopter to merge `pre-commit` jobs manually
     (skill MUST NOT overwrite existing hook configs).
4. Merges scripts from `package-scripts.json` into the adopter's
   `package.json` `"scripts"` (skipping any keys already defined).
5. Runs `bunx lefthook install` to activate hooks.
6. Runs `bun run quality:list` to confirm surface manifest is loaded.

## Adopter customization

The default `SURFACE_MAP` in `quality-router.ts` is project-agnostic
(markdown, json, yaml, shell, typescript). Adopters MAY:

- Add project-specific surfaces (e.g., `vue`, `python`, `rust`).
- Tighten globs to match their layout (e.g., `src/**/*.ts` instead of
  `**/*.ts`).
- Mark required surfaces (`required: true`) according to their
  contract.

After customizing, run `bun run quality:list` to verify the manifest.

## Replication checklist

A project successfully replicates this layer when it can answer:

| Question | Required Evidence |
|----------|-------------------|
| Which surfaces does the router detect? | `bun run quality:staged --json` output |
| Which gates ran? | `gateResults` per surface with `status: pass` |
| Which gates skipped, with reason? | Gate-level `status: skip` + `reason` |
| What command proves local closure? | `bun run commit:check` exits 0 |

## Reference

Full contract: see `docs/policies/QUALITY-CONTRACT.md` and
`docs/policies/LOCAL-QUALITY-RECIPE.md` in the cellm-private repository.
External recipe source: `tilly-engineer-skills/docs/mesh/LOCAL-QUALITY-RECIPE.md`.

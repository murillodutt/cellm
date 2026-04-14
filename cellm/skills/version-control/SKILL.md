---
description: "Deep versioning guidance for any project — SemVer vs EffVer vs CalVer, release automation, AI artifact versioning. Use when: 'versioning strategy', 'which versioning scheme', 'setup releases', 'version AI artifacts'. For CELLM-specific version bumps and inflation checks, use cellm:versioning."
cellm_scope: universal
user-invocable: true
argument-hint: "[question or project context]"
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

# Version Strategy — Before Choosing

## Decision Tree

```
Is the project in production with users depending on the API?
  NO  -> 0.x.y (SemVer pre-stable)
         MINOR = breaking, PATCH = features + fixes. Iterate freely.
  YES -> Published library/package?
           YES -> Strict SemVer. Batch breaking changes. Deprecate before remove.
           NO  -> Need to communicate impact? -> EffVer
                  Date matters more? -> CalVer
                  Want simplicity? -> SemVer with fixed cadence
```

## Schemes

| Scheme | Format | Best For | Adopted By |
|--------|--------|----------|-----------|
| SemVer | MAJOR.MINOR.PATCH | Libraries, packages, APIs | npm, Cargo, Go, PyPI |
| EffVer | MACRO.MESO.MICRO | Effort-based communication | Matplotlib, JAX, JupyterHub |
| CalVer | YYYY.MM.DD (variable) | Date-driven releases | Ubuntu, pip, Black |
| Epoch SemVer | {EPOCH*1000+MAJOR}.MINOR.PATCH | Era-based projects | Experimental only |

## Anti-Inflation

| Strategy | When |
|----------|------|
| Stay on 0.x.y | Pre-production — no stable API yet |
| Pre-release tags (`-alpha`, `-beta`, `-rc`) | Separate maturity from version |
| Batch breaking changes | Accumulate on branch, release on cadence |
| Deprecate before remove | Mark deprecated in MINOR, remove in next MAJOR |
| Codemods | Automate migration to reduce MAJOR cost |
| Release channels (stable/beta/canary) | Rapid iteration without inflating stable version |

## AI Artifacts

| Artifact | Version How |
|----------|-------------|
| Prompts | SemVer: structural change = MAJOR, new field = MINOR, wording = PATCH |
| ML Models | SemVer-ML: architecture = MAJOR, hyperparams = MINOR, training data = PATCH |
| Datasets | DVC/LakeFS + link to model version |

## Automation

Conventional Commits (`type(scope): description`) + automated release tools:

| Tool | Ecosystem |
|------|-----------|
| changelogen | Nuxt/UnJS |
| semantic-release | npm |
| release-please | Google/GitHub |
| changesets | Monorepos (Turborepo, pnpm) |

## NEVER

- **Reach v1.0.0 without real users** — 0.x.y is correct for pre-production
- **Bump MAJOR on every AI refactor** — batch breaking changes into cycles
- **Use version number for maturity signal** — that's what pre-release tags are for
- **Version without automation** — conventional commits + changelogen minimum

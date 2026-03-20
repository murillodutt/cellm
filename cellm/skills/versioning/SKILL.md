---
description: CELLM version control framework — apply before any version bump, release decision, or when version inflation is detected. Covers SemVer, EffVer, pre-release tags, sync protocol, and anti-inflation strategies. For deep multi-scheme guidance, use cellm:version-control.
user-invocable: false
---

# Version Thinking — Before Bump

## Decision Tree

```
Is the project in production with users depending on the API?
  NO  -> 0.x.y (MINOR = breaking, PATCH = features + fixes)
  YES -> Published library?
           YES -> Strict SemVer. Batch breaking changes. Deprecate before remove.
           NO  -> EffVer (effort-based) or SemVer with fixed cadence.
```

## Increment Axes

| Signal | SemVer | EffVer (effort-based) |
|--------|--------|----------------------|
| Zero effort for users | PATCH | MICRO |
| Some adaptation effort | MINOR | MESO |
| Significant migration effort | MAJOR | MACRO |
| Pre-production, unstable API | Stay on 0.x.y | Stay on 0.x.y |

AI compresses dev cycles — refactors that took weeks now happen in hours. This causes MAJOR inflation. Counter with: `0.x.y` pre-stable, batch breaking changes, pre-release tags (`-alpha`, `-beta`, `-rc`).

## Sync Protocol

One version, one reality. Source of truth: `VERSION` file.

| Artifact | Syncs from VERSION |
|----------|--------------------|
| `package.json` | `scripts/sync-version.sh` |
| `plugin.json` (cellm) | `scripts/sync-version.sh` |
| `marketplace.json` | `scripts/sync-version.sh` |
| `VERSION.md` | `scripts/sync-version.sh` |

Sub-plugins (`dse`, `docops`) version independently.

## NEVER

- **MAJOR without discussion** — breaking changes require explicit alignment
- **Bump one without syncing all** — run `scripts/sync-version.sh` or edit VERSION + all artifacts
- **Inflate MAJOR in pre-production** — stay on 0.x.y until real users depend on the API
- **Guess current version** — read `VERSION` file first, then decide increment
- **Skip pre-release tags** — use `-alpha`, `-beta`, `-rc` for unstable work

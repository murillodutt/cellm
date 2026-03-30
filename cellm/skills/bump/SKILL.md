---
description: "Bump project version and sync across all targets. Auto-discovers VERSION, package.json, plugin.json. Use when: 'bump version', 'bump', 'version bump', 'bump 0.36.0', or /sk-git delegates. NEVER during implement, orchestrate, asclepius, argus, hefesto, arena, or any code work."
user-invocable: false
disable-model-invocation: false
argument-hint: "[patch|minor|major|x.y.z]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(python3 *), Bash(bash *), Bash(cat *)
---

# Bump — Version Sync Across All Targets

## Activation Guard

This skill is ONLY activated when:
- The user explicitly requests a version bump ("bump version", "bump", "bump to 0.36.0")
- `/sk-git bump` or `/sk-git sync` delegates bump

This skill is NEVER activated during:
- `cellm:implement`, `cellm:orchestrate`, `cellm:asclepius`, `cellm:argus`, `cellm:hefesto`, `cellm:arena`, `cellm:swarm`
- Any code implementation, fix, refactor, or orchestration workflow
- Conversation where user mentions "version" or "release" casually without requesting bump

If unsure whether to activate: **do not activate**. Ask the user.

## Flow

### 1. Detect current version (source of truth)

Search in order (first found wins):
1. `VERSION` file at project root (plain text, trimmed)
2. `package.json` root -> `version` field
3. If neither found: `[-] No version source found` — ABORT

### 2. Compute new version

| Argument | Behavior |
|----------|----------|
| (none) / `patch` | Increment patch: `0.35.94` -> `0.35.95` |
| `minor` | Increment minor, reset patch: `0.35.94` -> `0.36.0` |
| `major` | Increment major, reset minor+patch: `0.35.94` -> `1.0.0` |
| `x.y.z` (explicit) | Set exactly to `x.y.z` |
| `x.y.z-tag` (pre-release) | Set exactly to `x.y.z-tag` (e.g. `1.0.0-alpha.1`, `0.36.0-rc.1`) |

Parse SemVer: `MAJOR.MINOR.PATCH` or `MAJOR.MINOR.PATCH-prerelease`. Reject input that does not start with digits in `X.Y.Z` format.

### 3. Discover sync targets

Auto-discover from project root:

| Target | Detection | Sync Method |
|--------|-----------|-------------|
| `VERSION` | File exists at root | Write plain text |
| `package.json` (root) | Always exists | JSON: update `version` field |
| `**/package.json` (workspaces + siblings) | First: read root `package.json` -> check `workspaces` array -> Glob each pattern. Second: if no workspaces field, Glob `*/package.json` (direct subdirectories only, exclude node_modules) to find sibling packages like `oracle/package.json` | JSON: update `version` field |
| `**/.claude-plugin/plugin.json` | Glob (exclude node_modules) | JSON: update `version` field |
| `**/.claude-plugin/marketplace.json` | Glob | JSON: Read file, parse JSON, iterate `plugins[]` array, update each entry's `version` field individually, write back. Do NOT use replace_all — entries may have different versions for independent sub-plugins. |
| `VERSION.md` | File exists at root | Regex: `**Current Version**: X.Y.Z` |
| `CLAUDE.md` | File exists at root | Regex: `> Version: X.Y.Z` |

Then load project-specific targets from `~/.cellm/bump/bump-{project}.json` (if exists).

### 4. Load custom config

```
~/.cellm/bump/bump-{project}.json
```

Project identity detection (try in order until config file found):
1. `basename(cwd)` — e.g. `cellm-private` -> `~/.cellm/bump/bump-cellm-private.json`
2. `package.json#name` — e.g. `cellm` -> `~/.cellm/bump/bump-cellm.json`
3. If neither config exists: use only auto-discovered targets (normal for most projects)

```json
{
  "project": "cellm-private",
  "versionTargets": [
    {
      "path": "oracle/server/utils/server-state.ts",
      "pattern": "version: '{{VERSION}}'",
      "type": "regex"
    }
  ]
}
```

**Validation:**
- If `project` field does not match detected project name: warn and ask confirmation
- All `path` values must be relative (no `..`, no absolute paths). Reject violating paths.
- `type`: `"json"` (update version field) or `"regex"` (find pattern with `{{VERSION}}` placeholder, replace)

If config file does not exist: use only auto-discovered targets. This is normal for most projects.

### 5. Apply version (ordered, with abort policy)

**Preferred: single Bash call with inline python** for atomic execution:
```
Bash: python3 -c "..." that reads all targets, applies version, reports results
```
This avoids N sequential Edit tool calls (12+ calls vs 1). The python script should:
- Write VERSION first (abort if fails)
- JSON parse/write for package.json and plugin.json files
- JSON parse + iterate plugins[] for marketplace.json (never string replace)
- Regex replace for markdown and custom targets
- Print report with updated/failed targets

**Fallback: individual Edit tool calls** (when Bash is not available or not permitted):

Write targets in this order:

1. **VERSION** (source of truth) — if this fails, **ABORT everything**
   - If VERSION file does NOT exist: **do NOT create it**. Use `package.json` as source of truth instead. Write package.json first and treat it as the abort-on-fail target.
2. **package.json** files — if fail, report and continue
3. **plugin.json** + **marketplace.json** — if fail, report and continue
4. **Markdown** (VERSION.md, CLAUDE.md) — if fail, report and continue
5. **Custom targets** (from config) — if fail, report and continue

### 6. Self-validation

After all writes, verify sync is complete:
- If `scripts/sync-version.sh` exists in the project: run `bash scripts/sync-version.sh --check-only`
- If not: re-read VERSION and at least 2 other targets, confirm version string matches
- If validation fails: report which targets are out of sync before the summary

### 7. Report

Success:
```
[+] Version bumped: 0.35.94 -> 0.35.95
[+] Updated 8 targets:
    - VERSION
    - package.json
    - oracle/package.json
    - VERSION.md
    - CLAUDE.md
    - cellm-plugin/cellm/.claude-plugin/plugin.json
    - cellm-plugin/.claude-plugin/marketplace.json
    - oracle/server/utils/server-state.ts
[+] Self-validation: all targets in sync
```

Partial:
```
[!] Partial sync: VERSION updated to 0.35.95 but 1 target failed:
    [-] oracle/server/utils/server-state.ts — pattern not found
[+] 7 targets updated successfully
[+] Run /sk-git check to verify sync status
```

### 8. Post-bump instructions

After bump completes, output:
```
Next steps (or let /sk-git handle):
  git add VERSION package.json [other changed files]
  git commit -m "chore(scripts): bump version to X.Y.Z"
  git push
```

The commit message `chore(scripts): bump version to X.Y.Z` is required for
`getVersionTimeline()` compatibility (regex: `bump.*version.*to\s+v?(\d+\.\d+\.\d+)`).

## Changelog Integration

After bump + commit, the changelog subsystem (`getVersionTimeline()` in `version-topology.ts`)
automatically detects the new version marker via the bump commit message. No manual
changelog generation is needed — the version interval is created as a consequence of the bump.

If the Oracle is running, `/sk-git` will call `POST /api/changelog/generate` with the
new version to materialize changelog entries for the closed interval.

## NEVER

- **NEVER bump without reading current version first** — always detect from source of truth.
- **NEVER modify files not in the discovered target list** — explicit is better than implicit.
- **NEVER skip the VERSION file** — if it exists, it is the source of truth and must be written first.
- **NEVER commit or push** — this skill only writes files. Git operations are the caller's responsibility.
- **NEVER activate during implementation or orchestration workflows** — bump is a release action only.
- **NEVER accept paths with `..` or absolute paths from config** — reject and report.
- **NEVER guess version format** — parse SemVer strictly (`MAJOR.MINOR.PATCH`).

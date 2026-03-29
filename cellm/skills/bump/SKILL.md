---
description: "Bump project version and sync across all targets. Auto-discovers VERSION file, package.json, plugin.json, and project-specific targets. Supports patch (default), minor, or explicit version. Use when: 'bump version', 'bump', 'version bump', 'bump 0.36.0'."
user-invocable: false
argument-hint: "[patch|minor|major|x.y.z]"
allowed-tools: Read, Write, Edit, Glob, Grep
---

# Bump — Version Sync Across All Targets

Increment the project version and propagate to all discovered targets.

## Intent

- Provide a single command to bump version and sync everywhere.
- Auto-detect project structure — works for monoliths, monorepos, and plugin ecosystems.
- Replace project-specific bash scripts with a portable skill.

## Flow

### 1. Detect current version (source of truth)

Search in order (first found wins):
1. `VERSION` file (plain text, trimmed)
2. `package.json` → `version` field
3. If neither found: ABORT with `[-] No version source found`

### 2. Compute new version

| Argument | Behavior |
|----------|----------|
| (none) / `patch` | Increment patch: `0.35.94` -> `0.35.95` |
| `minor` | Increment minor, reset patch: `0.35.94` -> `0.36.0` |
| `major` | Increment major, reset minor+patch: `0.35.94` -> `1.0.0` |
| `x.y.z` (explicit) | Set exactly to `x.y.z` |

### 3. Discover sync targets

Scan the project root for files that contain version references:

| Target | Detection | Sync Method |
|--------|-----------|-------------|
| `VERSION` | File exists at root | Write plain text |
| `package.json` (root) | Always exists | Update `version` field via JSON parse/write |
| `**/package.json` (workspaces) | `workspaces` field in root package.json | Update `version` field |
| `**/.claude-plugin/plugin.json` | Glob scan (exclude node_modules) | Update `version` field |
| `**/.claude-plugin/marketplace.json` | Glob scan | Update ALL `plugins[].version` entries |
| `VERSION.md` | File exists at root | Regex replace `**Current Version**: X.Y.Z` |
| `CLAUDE.md` | File exists at root | Regex replace `> Version: X.Y.Z` |
| Project-specific targets | Read `cellm.json` → `versionTargets[]` | Pattern-based regex replace |

### 4. Apply version to all targets

For each discovered target:
1. Read current file content
2. Apply version update (JSON parse for .json, regex for .md/.ts)
3. Write back
4. Report: `[+] Updated {path}`

### 5. Report summary

```
[+] Version bumped: 0.35.94 -> 0.35.95
[+] Updated 8 targets:
    - VERSION
    - package.json
    - oracle/package.json
    - VERSION.md
    - CLAUDE.md
    - cellm-plugin/cellm/.claude-plugin/plugin.json
    - cellm-plugin/docops/.claude-plugin/plugin.json
    - cellm-plugin/.claude-plugin/marketplace.json
```

## Project-Specific Targets (cellm.json)

Projects can declare extra version targets in `cellm.json` (or `~/.cellm/cellm.json`):

```json
{
  "versionTargets": [
    {
      "path": "oracle/server/utils/server-state.ts",
      "pattern": "version: '{{VERSION}}'",
      "type": "regex"
    }
  ]
}
```

Each target has:
- `path`: relative to project root
- `pattern`: string with `{{VERSION}}` placeholder. For regex mode, the placeholder marks what to replace.
- `type`: `"json"` (update version field) or `"regex"` (find and replace pattern)

## Compatibility with /sk-git

The `/sk-git bump` mode should delegate to this skill instead of calling `sync-version.sh` directly. The skill output is structured for programmatic consumption.

## NEVER

- **NEVER bump without reading current version first** — always detect from source of truth.
- **NEVER modify files not in the discovered target list** — explicit is better than implicit.
- **NEVER skip the VERSION file** — if it exists, it is always the source of truth and must be written first.
- **NEVER leave targets out of sync** — if any target update fails, report the failure but continue with remaining targets.
- **NEVER guess version format** — parse SemVer strictly (`MAJOR.MINOR.PATCH`).

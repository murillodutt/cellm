---
description: "Bump project version and sync across all targets. Auto-discovers VERSION, package.json, plugin.json. Use when: 'bump version', 'bump', 'version bump', 'bump 0.36.0', or /sk-git delegates. NEVER during implement, orchestrate, asclepius, argus, hefesto, arena, or any code work."
user-invocable: false
disable-model-invocation: false
cellm_scope: universal
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
[+] Changelog: 12 conventional + 3 AI = 15 entries generated for v0.35.95
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

The commit message `chore(scripts): bump version to X.Y.Z` is the recommended format.
The changelog pipeline (`getVersionTimeline()`) accepts all of these formats:
- `bump version to X.Y.Z` (default, recommended)
- `bump version X.Y.Z -> X.Y.Z` (ASCII arrow)
- `bump version X.Y.Z \u2192 X.Y.Z` (unicode arrow)
- `bump version X.Y.Z` (bare)
- `bump deps + version X.Y.Z`

Detection regex: `bump.*version` + last semver extraction from subject.

### 9. Generate and submit changelog entries

**This step is MANDATORY.** Every bump closes a version interval. The skill MUST classify and submit changelog entries before finishing — regardless of how the skill was invoked (direct, /sk-git, or NL request).

#### 9.1 Determine the previous version tag

Run: `git tag --sort=-version:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+' | head -2`

The second result is `{PREV_TAG}` (the tag before the one just created). If no previous tag exists, use the first commit: `git rev-list --max-parents=0 HEAD`.

#### 9.2 Collect commits

Run: `git log --oneline {PREV_TAG}..HEAD`

Each line has format: `{HASH} {SUBJECT}`

#### 9.3 Classify each commit

For each commit, apply the **Changelog Entry Classification** rules below. Produce a list of classified entries; skip all excluded commits.

#### 9.4 Include completed CellmOS specs (if any)

Call `spec_get_tree` with no arguments to list all specs. Filter specs whose status is `completed` and whose `version` field matches `v{NEW_VERSION}`. For each matched spec, produce one entry using the spec-to-changelog mapping rules below.

#### 9.5 Submit all entries

Call the `changelog_submit` MCP tool once with all entries:

```
changelog_submit({
  project: "{project}",
  version: "v{NEW_VERSION}",
  entries: [
    {
      commitHash: "{HASH}",
      category: "added" | "changed" | "fixed",
      title: "{entry title}",
      component: "{component}" (optional),
      breaking: true | false (optional, default false)
    },
    ...
  ]
})
```

- `project`: `basename(cwd)` or `package.json#name`
- `version`: `v{NEW_VERSION}` with leading `v`
- If there are zero entries after filtering: skip the `changelog_submit` call and report `[i] No changelog entries for this version`

#### 9.6 Report

```
[+] Changelog: {N} entries submitted for v{NEW_VERSION}
```

If zero entries: `[i] No classified commits for this version (bump-only or all excluded by policy)`

**This is what makes each version release self-documenting.**

---

### Changelog Entry Classification

#### Conventional Commit Regex

```
^(feat|fix|refactor|perf|docs|style|revert)(\(.*\))?!?: (.+)
```

- Group 1: type (`feat`, `fix`, etc.)
- Group 2 (optional): scope in parentheses, e.g. `(oracle)` — used for component inference
- `!` before `:` indicates a breaking change → set `breaking: true`
- Group 3: subject text → use as `title`

#### Type → Category Mapping

| Commit type | `category` |
|-------------|-----------|
| `feat` | `added` |
| `fix` | `fixed` |
| `refactor`, `perf`, `docs`, `style`, `revert` | `changed` |
| (no match / freeform) | `changed` |

#### Exclusion Rules (skip these commits entirely)

| Rule | Detection |
|------|-----------|
| Merge commits | Subject starts with `Merge ` or has `^Merge branch` |
| Bump commits | Subject matches `bump.*version` (case-insensitive) |
| Lock file changes | Subject contains `lock`, `yarn.lock`, `bun.lock`, `package-lock` |
| Bot authors | Author email contains `[bot]` or `noreply@github.com` (check via `git log --format="%ae" -1 {HASH}`) |

#### Component Inference (optional field)

Resolve `component` in this priority order:

1. **Scope from conventional commit**: if group 2 matched, strip parentheses -> component (e.g. `(oracle)` -> `oracle`)
2. **Project config map**: if `~/.cellm/bump/bump-{project}.json` defines a `componentMap`, resolve by explicit path prefix rules.
3. If neither applies: omit `component` (do not guess).

#### Spec-to-Changelog Mapping

For each completed spec matched to `v{NEW_VERSION}`:

| Spec tag | `category` |
|----------|-----------|
| `bugfix`, `fix`, `cure` | `fixed` |
| `feat`, `feature` | `added` |
| (anything else) | `changed` |

- `commitHash`: use the spec's `id` field prefixed with `spec-` (e.g. `spec-b4cd96f3`)
- `title`: use the spec's `title` field
- `component`: use the spec's `scope` or `component` field if present

### 10. Generate release notes summary

After step 9 completes, generate an editorial release summary:

```
POST http://localhost:{ORACLE_PORT}/api/changelog/release-notes
Body: { "project": "{project}", "version": "v{NEW_VERSION}" }
```

- If Oracle is offline: report `[!] Oracle offline — release notes skipped.`
- If Oracle returns notes: report summary length in output
- If Oracle returns no entries: report `[i] No entries for release notes (version has no classified changes)`

This step synthesizes the granular changelog entries into a human-readable narrative summary with thematic synthesis, breaking changes, and migration notes.

## NEVER

- **NEVER bump without reading current version first** — always detect from source of truth.
- **NEVER modify files not in the discovered target list** — explicit is better than implicit.
- **NEVER skip the VERSION file** — if it exists, it is the source of truth and must be written first.
- **NEVER commit or push** — this skill only writes files. Git operations are the caller's responsibility.
- **NEVER activate during implementation or orchestration workflows** — bump is a release action only.
- **NEVER accept paths with `..` or absolute paths from config** — reject and report.
- **NEVER guess version format** — parse SemVer strictly (`MAJOR.MINOR.PATCH`).

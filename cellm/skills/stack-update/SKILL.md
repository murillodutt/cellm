---
description: Execute stack update specs — verify, analyze impact, create fix specs proactively, commit, and certify via Olympus. Use when stack tracker specs need closing, dependency updates need verification, or 'stack update' is mentioned.
user-invocable: true
argument-hint: "'all' to batch-process, package name, or check ID"
allowed-tools: mcp__cellm-oracle__spec_search, mcp__cellm-oracle__spec_get_tree, mcp__cellm-oracle__spec_transition, mcp__cellm-oracle__spec_create_node, mcp__cellm-oracle__spec_add_edge, mcp__cellm-oracle__spec_get_counters, mcp__cellm-oracle__quality_gate, AskUserQuestion, Skill, Read, Grep, Glob, Bash(npx vue-tsc *), Bash(bun run test *), Bash(git *), Bash(bash scripts/sync-version.sh *)
---

# Stack Update — Full Lifecycle Dependency Management

Verify dependency updates, analyze code impact, create fix specs, commit changes, and certify via Olympus.

## Pipeline

```
1. DETECT   — git rev-parse project name
2. COMMIT   — commit + push pending dependency changes
3. SEARCH   — find pending stack-tracker specs
4. GATE     — quality_gate once for the entire project
5. ANALYZE  — grep imports, read consuming files, assess impact per spec
6. COMPLETE — batch-complete safe specs, create fix specs for impacted code
7. FIX      — ask user to execute fix specs via /cellm:implement
8. CERTIFY  — after all fix specs completed, run Olympus for certification
```

## Framework

### Step 1: Detect Project

`git rev-parse --show-toplevel` last segment = project name. All `spec_search`, `spec_transition`, and `spec_create_node` calls MUST include this `project` param.

### Step 2: Commit First

Before any verification, ensure dependency changes are committed:
- `git status --porcelain` — check for uncommitted dependency files (bun.lock, package.json)
- If changes exist: bump version (`VERSION` + `bash scripts/sync-version.sh`), commit, push
- If clean: proceed to gate

### Step 3: Search

Route by argument:

| Argument | Action |
|----------|--------|
| `all` | `spec_search(project, query: "dependency update", state: "pending", limit: 50)` filter by tag `stack-tracker` |
| `<package>` | `spec_search(project, query: <package>, state: "pending", limit: 5)` filter by tag `stack-tracker` |
| `<check-id>` | `spec_get_tree(project, path: <id>)` directly |

### Step 4: Gate

`quality_gate({ scope: 'all' })` — run ONCE for the entire project. Runs typecheck + tests. Fallback: `npx vue-tsc --noEmit` + `bun run test` if Oracle offline.

### Step 5: Analyze

For EACH spec, before completing:
- Read `body.updateType` from check (patch/minor/major/prerelease)
- If `body.updateType` missing (legacy): infer from title pattern `Update {pkg} {from} -> {to}` using version delta
- `Grep` for package imports: `from '{package}'`, `import '{package}'`
- If imports found: `Read` consuming files, check API usage against watch items
- Assess: does the update affect any code paths?

### Step 6: Route

| Gate | updateType | Impact Found | Action |
|------|-----------|-------------|--------|
| PASS | patch | none | batch-complete |
| PASS | patch | usage found | complete with note — patch is safe |
| PASS | minor | none | batch-complete |
| PASS | minor | deprecation/API change | complete verify tasks, create fix spec |
| PASS | major/prerelease | none | complete — no project usage |
| PASS | major/prerelease | API usage | complete verify, create fix spec with affected files |
| FAIL | any | any | analyze errors, create fix spec, delegate to `/cellm:implement` |

### Step 7: Fix Spec Creation

When impact requires code changes:
```
spec_create_node({
  project: "<project>",
  sessionId: "<current-session-id>",
  nodeType: "check",
  title: "Fix code after {package} {from} -> {to} update",
  body: {
    context: "{package} updated to {to}. {N} files import this package.",
    problem: "API changes in {watch items} affect {affected files}.",
    principle: "Update consuming code to match new API. Typecheck must pass."
  },
  tags: ["stack-tracker-fix", "dependency-fix", "{package}"],
  fileRefs: ["{affected files}"],
  priority: gate failed ? "high" : "medium"
})
```

After creating the fix spec, link it to the original update spec:
```
spec_add_edge({
  project: "<project>",
  sourceId: "<fix-spec-id>",
  targetId: "<update-spec-id>",
  edgeType: "related"
})
```

### Step 8: Batch Mode (`all`)

- Gate runs ONCE
- Sort: patch first, then minor, then major/prerelease
- For each spec: analyze → route → complete or create fix spec
- Progress: `"[n/total] {package} {from} -> {to} ({type}) — {result}"`

### Step 9: Summary and Handoff

After all update specs are processed, present summary:
- Total completed, fix specs created, delegated
- List each fix spec with title and ID
- Ask via AskUserQuestion: "Fix specs were created for {N} packages. Execute all now with /cellm:implement?"
- If user approves: invoke `/cellm:implement` for each fix spec sequentially
- If user declines: report spec IDs for later execution

### Step 10: Certification Gate

After ALL fix specs are executed and completed (pre-certified):
- Verify: `quality_gate({ scope: 'all' })` passes clean
- Verify: `spec_search(project, state: "pending", tags: "stack-tracker")` returns 0
- Verify: `spec_search(project, state: "pending", tags: "stack-tracker-fix")` returns 0
- If all clear: ask user via AskUserQuestion: "All updates verified and fix specs completed. Run Olympus certification?"
- If user approves: invoke `/cellm:olympus` with target "stack-tracker dependency updates"
- If user declines: report final status

## Impact Analysis Protocol

```
1. GREP: from '{package}' OR import '{package}' → list consuming files
2. If 0 files: no impact → safe to complete
3. If 1+ files:
   a. READ each file (first 100 lines with import context)
   b. MATCH: does the file use any API from the watch items?
   c. For patch: note usage, complete (patches don't break APIs)
   d. For minor: check for deprecated APIs in changelog
   e. For major/prerelease: every usage is a potential break point
4. Record findings in transition metadata
```

## Task Decision Table

| Task title pattern | Gate PASS + No Impact | Gate PASS + Impact | Gate FAIL |
|--------------------|----------------------|-------------------|-----------|
| `Verify typecheck and tests pass` | auto-complete | auto-complete (gate validates) | create fix spec |
| `Review breaking changes` | auto-complete (no usage) | analyze + create fix spec if needed | create fix spec |
| `Review changelog` | auto-complete | auto-complete with impact note | auto-complete |
| `Evaluate: {item}` | auto-complete | grep for item usage, note result | investigate |
| `Update project code` | auto-complete (nothing to update) | create fix spec with specific tasks | delegate to implement |

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after execution, write feedback entry to `dev-cellm-feedback/entries/stack-update-{date}-{seq}.md`. Note: how many specs were batch-completed vs needed fix specs, which packages had actual code impact, whether the impact analysis caught real issues or was noise. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- Skip Step 1 (detect project) — all MCP calls require `project` param
- Skip Step 2 (commit) — dependency changes must be committed before verification
- Bump version without using `bash scripts/sync-version.sh` — never manual sed
- Complete specs without running quality_gate first
- Run quality_gate PER SPEC in batch mode — run ONCE
- Skip impact analysis — always grep for package imports before completing
- Complete major or prerelease update specs without reading consuming files
- Auto-complete prerelease specs as if they were patches — treat as major risk
- Create fix specs without `project`, `sessionId`, specific file paths, and actions
- Create fix specs without linking to parent update spec via `spec_add_edge`
- Run Olympus before all fix specs are completed — certification requires pre-certified state
- Forget `project` param on `spec_transition` and `spec_create_node` calls
- Leave specs in intermediate states — either complete or report why not
- Edit source code directly — create fix specs, delegate to `/cellm:implement`
- Skip the Evolutionary Analytical Feedback when CELLM_DEV_MODE is true

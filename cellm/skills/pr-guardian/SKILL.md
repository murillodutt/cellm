---
description: "Defend the target branch (main) from premature merges. Evaluates 10-criterion readiness checklist and performs governed squash-merge only when a user-requested PR is READY. Never creates or keeps permanent PRs. Use when: 'pr-check', 'pr-merge', 'merge this PR safely', 'is PR ready', 'guard merge', or /sk-git delegates pr-merge."
cellm_scope: universal
user-invocable: true
disable-model-invocation: false
argument-hint: "[--silent] [--delegated] [--override] [check|merge]"
allowed-tools: Read, Bash(gh *), Bash(git *)
---

# PR Guardian — Governed Pull Request Merge

PR Guardian governs the transition from "user-requested PR open" to "PR merged" by enforcing a deterministic readiness checklist. It defends the target branch (typically `main`) from premature merges caused by impulse, unverified CI state, missing review, or active conflicts.

Explicit scheduled-PR semantics: Guardian **never** creates or keeps permanent PRs. PRs are opened only on user request, then stay open until quality and governance criteria are met or the user closes them.

## Modes

| Arg | Action |
|---|---|
| `check` | Read-only readiness evaluation (10 criteria, PASS/FAIL/UNKNOWN each) |
| `merge` | Requires `check=READY`, then `gh pr merge --squash --delete-branch` + sync local |

Detailed criteria, fail-closed rules, and troubleshooting: see [reference.md](reference.md).

## Capability Detection

Before any evaluation:

1. `gh auth status` succeeds — Guardian is operational.
2. Current branch has an open PR against the default branch, or the caller passes an explicit PR number.

Missing GitHub capability → abort with actionable message. No open PR is an idle scheduled-PR state for `check`; for `merge`, it is always blocking.

## check flow

1. Run capability detection.
2. If no open PR is found for the current branch, report `VERDICT: IDLE` with guidance to open one only on user request.
3. Evaluate 10 criteria in order (see reference.md). Collect verdict per criterion.
4. Emit structured report:

   ```
   VERDICT: READY | BLOCKED
   PR #<num> — <title>
   [PASS|FAIL|UNKN] 1. CI checks all SUCCESS
   ...
   [PASS|FAIL|UNKN] 10. No outstanding change requests
   ```

5. Exit code 0 when READY or IDLE, non-zero when BLOCKED.

`check` is read-only. Never mutates PR or repository, and never creates a PR.

## merge flow

1. Run `check` internally. If verdict != READY, **ABORT** — emit BLOCKED report, exit non-zero.
2. Interactive mode (not `--silent`, not `--delegated`): render confirmation via `AskUserQuestion` with PR title, base branch, commit count, passed criteria.
3. Execute `gh pr merge <num> --squash --delete-branch`.
4. Post-merge: `git checkout <baseBranch> && git pull --ff-only`.
5. Emit success summary with merge commit SHA + deleted branch.

Delegated mode skips confirmation but still requires `check=READY`. The delegated contract MUST NOT override the checklist.

## ENV Override Precedence

First-hit wins:

1. `CELLM_PR_GUARDIAN_OVERRIDE=true` — allows BLOCKED merge with loud warning; logged to Oracle timeline. Emergency only.
2. `CELLM_PR_GUARDIAN_MIN_HOURS=<n>` — overrides min-open-hours threshold (default 24).
3. `CELLM_PR_GUARDIAN_REQUIRE_REVIEW=(true|false)` — overrides human-approval policy (default false).
4. `CELLM_PR_GUARDIAN_ENABLED=false` — disables Guardian; `check` still runs informational, `merge` proceeds via plain `gh pr merge`.
5. Oracle SettingsManager (`pr.*` keys, mirrored from Settings UI).
6. Built-in defaults: `minOpenHours=24`, `requireHumanApproval=false`, `blockingLabels=['WIP','do-not-merge','blocked']`, `baseBranch='main'`.

Every verdict and merge decision is logged to the Oracle timeline with a PR link and the full checklist.

## --silent Contract

Silent mode skips confirmations, not safeguards.

- Capability missing → ABORT
- Any criterion UNKNOWN → ABORT (read as FAIL)
- `gh` network/API error → ABORT
- No open PR for current branch → IDLE for `check`, ABORT for `merge`

## --delegated Contract (for orchestrators)

Callers: `sk-git`, `cellm:olympus` (certification), `cellm:arena` (quality gate), `cellm:convergir` (close-out).

- Skip `AskUserQuestion` confirmations unconditionally.
- Respect `--op` scoping: `merge` never widens into unrelated git ops.
- Fail-closed defaults remain active.
- MUST NOT override `check=READY` requirement.

## NEVER

- run `gh pr merge` without a passing `check` (unless `CELLM_PR_GUARDIAN_OVERRIDE=true`)
- merge a draft PR
- merge when any required check is FAILURE, PENDING, or absent
- merge with conflicts (`mergeStateStatus != CLEAN`)
- merge below `minOpenHours` without explicit override
- create a PR; use `cellm:gitpro pr-open` only when the user asks to open one
- modify GitHub branch protection settings from Guardian
- keep a permanent/always-open PR for monitoring
- close a PR for inactivity — Guardian never closes PRs; it only governs merges
- short-circuit the 10-criteria evaluation; always complete all 10 for the full picture
- push or rebase; Guardian only reads state and calls `gh pr merge`

## Related

- `cellm:gitpro` — universal git operations (commit, push, sync, bump, pr-open). Guardian is invoked by `gitpro --op pr-merge` in delegated mode.
- `cellm:olympus`, `cellm:arena`, `cellm:convergir` — quality orchestrators that delegate to Guardian for final merge.
- Oracle Settings UI — "PR Guardian" section mirrors the ENV keys above to the SettingsManager.

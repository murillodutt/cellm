# PR Guardian — Readiness Checklist Reference

Detailed specification of the 10 criteria used by `pr-guardian check` and `pr-guardian merge`. Each criterion resolves to `PASS | FAIL | UNKNOWN`. A PR is `READY` only when **all 10 are PASS**. Any single `FAIL` or `UNKNOWN` makes the PR `BLOCKED`.

All criteria are evaluated against the **current** PR state. No criterion may be satisfied by cached data older than 60 seconds.

## Data Sources

| Source | Purpose |
|---|---|
| `gh pr view <num> --json ...` | title, baseRefName, isDraft, mergeable, mergeStateStatus, body, headRefOid, labels, author |
| `gh pr checks <num> --json name,state,link` | CI status per check, link to failed job |
| `gh api repos/:owner/:repo/pulls/:num/reviews` | Review states: APPROVED, CHANGES_REQUESTED, COMMENTED |
| `gh api repos/:owner/:repo/pulls/:num/commits` | Commit count, last push timestamp |
| `git rev-list --count <base>..<head>` | Non-ancestral verification (local fallback) |

## The 10 Criteria

### 1. All required checks are SUCCESS

Source: `gh pr checks <num> --json`.

- PASS: every check has `state = SUCCESS` and there is at least one check reported.
- FAIL: any check has `state in (FAILURE, CANCELLED, TIMED_OUT, ACTION_REQUIRED, ERROR)`.
- UNKNOWN: any check is `PENDING | IN_PROGRESS | QUEUED`, OR zero checks reported (API hasn't settled).

Troubleshoot: if UNKNOWN persists, wait for CI path-filter trigger or re-push to force re-run.

### 2. mergeable=MERGEABLE AND mergeStateStatus=CLEAN

Source: `gh pr view --json mergeable,mergeStateStatus`.

- PASS: both exact matches.
- FAIL: `mergeable=CONFLICTING` or `mergeStateStatus in (DIRTY, BLOCKED, BEHIND, UNSTABLE)`.
- UNKNOWN: `mergeable=UNKNOWN` — GitHub hasn't finished computing.

Note: `BLOCKED` here means branch protection is not yet satisfied — which is Guardian's own signal when running against a protected branch. This is FAIL, not UNKNOWN.

### 3. Zero conflicts with base branch

Derived from criterion #2 (`mergeStateStatus=CLEAN`). Explicit to surface conflicts distinctly in the report.

- PASS: `mergeStateStatus=CLEAN`.
- FAIL: `mergeStateStatus in (DIRTY, CONFLICTING)`.

### 4. Minimum open-hours window

Compute: `now - timestampOf(lastPush)`. `lastPush` is the most recent commit timestamp from the PR's head branch.

- PASS: elapsed >= `minOpenHours` (default 24, env `CELLM_PR_GUARDIAN_MIN_HOURS`).
- FAIL: elapsed < threshold.

Rationale: prevents reflex-merges immediately after push. Even in solo dev, 24h re-reading catches bugs.

Override: `CELLM_PR_GUARDIAN_MIN_HOURS=0` to disable entirely (not recommended).

### 5. Human approval when required

Source: `gh api repos/:owner/:repo/pulls/:num/reviews`.

- If `requireHumanApproval=false` (default): always PASS.
- If `true`:
  - PASS: at least one review with `state=APPROVED` and the approver is not the PR author, and no later review from the same approver moved back to `COMMENTED` or `CHANGES_REQUESTED`.
  - FAIL: no APPROVED review, or latest state from any reviewer is `CHANGES_REQUESTED`.

### 6. No blocking labels

Source: `gh pr view --json labels`.

- PASS: zero intersection between PR labels and `blockingLabels` (default `['WIP', 'do-not-merge', 'blocked']`).
- FAIL: any blocking label present.

Extend via SettingsManager key `pr.blockingLabels` (JSON array).

### 7. PR body is non-empty

Source: `gh pr view --json body`.

- PASS: `body.trim().length > 0`.
- FAIL: empty body.

Rationale: descriptionless PRs lose context within a week. Guardian rejects silently-described changes.

### 8. PR is not a draft

Source: `gh pr view --json isDraft`.

- PASS: `isDraft=false`.
- FAIL: `isDraft=true`.

Action for author: `gh pr ready <num>` to flip draft → ready for review.

### 9. Branch is not ancestral

Source: `gh pr view --json headRefOid,baseRefOid` or local `git merge-base`.

- PASS: head SHA differs from base tip SHA, AND there is at least one commit ahead of base.
- FAIL: head SHA == base SHA (nothing to merge), OR zero commits ahead of base.

Catches accidental "merge empty PR" scenarios.

### 10. No outstanding change requests

Source: `gh api repos/:owner/:repo/pulls/:num/reviews`.

- PASS: no review with current state `CHANGES_REQUESTED` from any reviewer (resolved means a later review from the same reviewer moved to APPROVED or the review was dismissed).
- FAIL: any reviewer's latest review state is `CHANGES_REQUESTED`.

This is stricter than #5: even in solo mode where `requireHumanApproval=false`, outstanding explicit CHANGES_REQUESTED still blocks.

## Verdict Aggregation

```
if any criterion == FAIL:       verdict = BLOCKED
elif any criterion == UNKNOWN:  verdict = BLOCKED  (fail-closed on ambiguity)
else:                           verdict = READY
```

Always evaluate all 10 criteria — no short-circuit. The user needs the full picture to understand why something is blocked.

## Override Semantics

`CELLM_PR_GUARDIAN_OVERRIDE=true` does NOT skip evaluation. It permits `merge` to proceed even with BLOCKED verdict. The report still prints every FAIL/UNKNOWN, and the merge is logged to timeline as `override=true` with the full checklist and the user account that ran it.

Override is intended for emergencies: hotfix to production where the delay cost exceeds the risk. It is always loud, always logged, never silent.

## Example: BLOCKED report

```
VERDICT: BLOCKED
PR #42 — fix(auth): resolve race condition in session refresh

[PASS] 1. CI checks all SUCCESS (14/14)
[PASS] 2. mergeable=MERGEABLE, mergeStateStatus=CLEAN
[PASS] 3. Zero conflicts with main
[FAIL] 4. Open for 3h 12m, below threshold 24h
[PASS] 5. Human approval not required
[PASS] 6. No blocking labels
[PASS] 7. PR body non-empty (342 chars)
[PASS] 8. Not a draft
[PASS] 9. 3 commits ahead of main
[PASS] 10. No outstanding change requests

Next steps:
- Wait 20h 48m, or override with CELLM_PR_GUARDIAN_OVERRIDE=true (emergency only)
```

## Example: READY report

```
VERDICT: READY
PR #23 — refactor(settings): consolidate Quantization sections

[PASS] 1. CI checks all SUCCESS (15/15)
[PASS] 2. mergeable=MERGEABLE, mergeStateStatus=CLEAN
[PASS] 3. Zero conflicts with main
[PASS] 4. Open for 1d 2h 15m (threshold 24h)
[PASS] 5. Human approval not required
[PASS] 6. No blocking labels
[PASS] 7. PR body non-empty (486 chars)
[PASS] 8. Not a draft
[PASS] 9. 4 commits ahead of main
[PASS] 10. No outstanding change requests

Merge with: /cellm:pr-guardian merge
```

## Troubleshooting

| Symptom | Cause | Resolution |
|---|---|---|
| "No PR found for current branch" | Scheduled PR is idle, branch not pushed, or PR not yet opened | If the user asked to open review/release, run `cellm:gitpro pr-open`; otherwise no action is required |
| Criterion 1 stays UNKNOWN | CI path-filter didn't trigger workflows | Push a no-op file touching a filtered path, or adjust `.github/workflows/*.yml` `paths:` lists |
| Criterion 2 stays UNKNOWN | GitHub still computing mergeability | Retry after ~30 seconds; `gh pr view` forces a refresh |
| Criterion 4 never passes in dev | Doing many small pushes resets the window | `CELLM_PR_GUARDIAN_MIN_HOURS=1` for development machines |
| "gh: auth required" | `gh auth status` expired | `gh auth login` (delegated mode still fails-closed) |
| BLOCKED with all PASS | Version mismatch between `gh` and expected JSON keys | Update `gh` to >= 2.50; Guardian expects modern keys |

## Integration Points

| Caller | Pattern |
|---|---|
| Manual: `/cellm:pr-guardian check` | user-invocable, interactive |
| `cellm:gitpro --op pr-merge --delegated` | orchestrator flow; Guardian runs fail-closed |
| `cellm:gitpro pr-open` | user-requested scheduled PR creation |
| `cellm:olympus` final certification | delegates merge after triad + tests green |
| `cellm:arena` quality gate | delegates merge after stress/prove passes |
| `cellm:convergir` close-out | delegates merge after e2e convergence |
| Oracle Settings UI | User configures `pr.*` keys; UI shows live verdict per open PR |

All callers receive the same READY/BLOCKED verdict and the same checklist output when a PR exists. With no open PR, check callers receive IDLE; merge callers remain BLOCKED. Consistency is the contract.

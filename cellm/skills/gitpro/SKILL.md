---
description: "Universal Git operations for any project: semantic commit, safe push, sync pipeline, and optional bump/changelog integrations when available. Use when: 'commit changes', 'push current branch', 'sync repo', 'bump version', 'git workflow'."
cellm_scope: universal
user-invocable: true
argument-hint: "[--silent] [commit|push|sync|bump [patch|minor|major|x.y.z]|check]"
allowed-tools: Read, Grep, Glob, AskUserQuestion, Skill, Bash(git *), Bash(bash *), Bash(bun *), Bash(node *)
---

# gitpro — Universal Git Workflow

`gitpro` is the plugin-ready replacement for repository-specific git wrappers. It is universal by default, capability-driven, and safe in autonomous sessions.

## Intent

- Standardize semantic commits across projects.
- Push safely to the current branch (never hardcoded branch targets).
- Run sync workflows with optional version/changelog integration.
- Keep silent mode safe by aborting on dangerous states.

## Modes

| Arg | Action |
|---|---|
| `(none)` | Show concise status: working tree, branch, ahead/behind, pending commits |
| `commit` | Infer semantic message, stage, commit, run optional checks if available |
| `push` | Push current branch safely (with upstream setup when missing) |
| `sync` | Ordered pipeline: check -> optional bump -> commit -> push |
| `bump [version]` | Prefer `cellm:bump` delegation; fallback to project scripts if available |
| `check` | Dry-run capability and version/changelog sync checks |

## Navigation Gate (M1/M2/M3) — Execute-style

For state-changing flows (`commit`, `push`, `sync`, `bump`), `gitpro` MUST run a 3-menu navigation gate via `AskUserQuestion` before mutating the repository.

- In interactive runs: M1, M2, M3 are mandatory.
- In `--silent`: menus are skipped and resolved to safe defaults (never unsafe defaults).

### Menu 1 — Operation (M1)

Select operation route:
- `status`
- `check`
- `commit`
- `push`
- `sync`
- `bump`
- `abort`

Rules:
- If user passed an explicit mode argument, preselect it as recommendation.
- User MAY override recommendation in interactive mode.
- If M1 answer is missing, execution MUST NOT proceed.

### Menu 2 — Autonomy Level (M2)

Choose execution posture:
- `assisted` — confirmations at key mutation points.
- `silent-safe` — no confirmations, safety checks still enforced.

Rules:
- In interactive runs, M2 is mandatory.
- In `--silent`, force `silent-safe`.
- If M2 answer is missing in interactive mode, execution MUST NOT proceed.

### Menu 3 — Integration Policy (M3, multi-choice)

Choose optional integrations:
- `bump-if-needed`
- `changelog-if-available`
- `md-lint-if-md-changed`
- `skip-optional-integrations`

Rules:
- M3 is mandatory in interactive runs for state-changing flows.
- If `skip-optional-integrations` is selected, it overrides other optional choices.
- In `--silent`, default to: `bump-if-needed` + `md-lint-if-md-changed`, and `changelog-if-available` only when capability exists and no failure risk is introduced.

## --silent Contract

Silent mode skips confirmations, not safeguards.

- Sensitive files detected -> **ABORT**
- Remote ahead / non-fast-forward risk -> **ABORT**
- Pre-commit/lint failures not auto-fixable -> **ABORT**
- No changes in commit/sync -> report and exit

## Capability Detection (mandatory before action)

Detect capabilities in this order:

1. `cellm:bump` skill available for delegated version orchestration.
2. Bundled fallback script exists: `${CLAUDE_PLUGIN_ROOT}/skills/gitpro/scripts/gitpro-version-sync.sh`.
3. `scripts/sync-version.sh` exists (project-local fallback).
4. `package.json` scripts include changelog or release hooks.
5. Markdown lint scripts exist (`lint:md`, `lint:md:fix`).

If capability is missing, continue with degraded but explicit path. Never fail silently.

## Workflow Contract

### S0 — Preflight

1. Confirm inside git repository (`git rev-parse --is-inside-work-tree`).
2. Capture current branch (`git branch --show-current`).
3. Capture ahead/behind state against upstream when configured.

Failure: not a git repo -> stop with actionable error.

### S1 — Navigation Gate (state-changing modes)

1. Render M1/M2/M3 via `AskUserQuestion` (interactive mode only).
2. Resolve effective operation, autonomy level, and integration policy.
3. Persist resolved navigation decisions in run notes/output summary.

Hard rule:
- State-changing execution MUST NOT proceed without resolved M1/M2/M3.

### S2 — Check (mode `check` and as sync pre-step)

1. Run `scripts/sync-version.sh --check-only` when available.
   - Priority: bundled `gitpro-version-sync.sh --check-only --project-root <repo>`; if unavailable, project-local `scripts/sync-version.sh --check-only`.
2. Report version/changelog capability matrix.
3. Report staged/unstaged/untracked summary.

### S3 — Commit

1. Collect change signals (`git status --porcelain`, `git diff --name-only`, `git diff --cached --name-only`).
2. Block sensitive files before staging (see list below).
3. Infer `type(scope): description` from changed paths and diff signals.
4. In `assisted`, confirm message; in `silent-safe`, apply safe default.
5. Stage and commit.
6. If staged `.md` files changed and `md-lint-if-md-changed` policy is active, run lint when capability exists.

Hard rules:
- Never amend unless explicitly requested.
- Never bypass hooks with `--no-verify`.
- Never commit with empty message or placeholder message.

### S4 — Bump

1. If `cellm:bump` is available, delegate first.
2. Else if bundled `gitpro-version-sync.sh` is available, execute it with `--project-root <repo>`.
3. Else if project-local `scripts/sync-version.sh` exists, execute script path.
4. Else return capability-not-available with recommendation, do not fabricate bump flow.

Hard rule:
- Partial bump result -> do not auto-commit bump outputs.

### S5 — Push

1. Resolve branch target from current branch.
2. If upstream missing, set with `git push -u origin <branch>`.
3. If upstream exists, `git push`.

Hard rules:
- Never push with force.
- If remote ahead, abort (silent) or ask for explicit decision (interactive).
- Never auto-pull/rebase in silent mode.

### S6 — Sync

Execute in order:
1. S2 check
2. Optional S4 bump (only when needed, supported, and policy-enabled)
3. S3 commit (if changes exist)
4. S5 push

## Type Inference

| Signal | Type |
|---|---|
| New feature files / endpoints / components | `feat` |
| Bug fix indicators (`fix`, `bug`, error handling) | `fix` |
| Docs-only changes | `docs` |
| Refactor-only structural changes | `refactor` |
| Test-only changes | `test` |
| Scripts/build/config changes | `chore` |

## Scope Inference

| Path signal | Scope |
|---|---|
| `docs/**` or `*.md` only | `docs` |
| `scripts/**` | `scripts` |
| `tests/**` | `test` |
| `oracle/**` | `oracle` |
| `cellm-plugin/**` | `plugin` |
| `.claude/skills/**` or `cellm-core/skills/**` | `skills` |
| mixed cross-domain | `core` |

## Sensitive Files (block before staging)

```
.env
.env.*
*.pem
*.key
*.p12
id_rsa
credentials.json
secrets.yaml
*.secret
config/secrets/*
```

Interactive: ask before excluding or aborting.
Silent: abort.

## Commit Message Format

```
<type>(<scope>): <description>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

## NEVER

- render M1/M2/M3 as plain text menu without `AskUserQuestion` in interactive runs
- proceed with state-changing execution when M1/M2/M3 are unresolved
- `git push --force`
- `git reset --hard`
- `git commit --no-verify`
- `git commit --amend` (unless explicitly requested)
- `git rebase` without explicit user authorization
- silent auto-pull or silent auto-rebase
- auto-committing sensitive files

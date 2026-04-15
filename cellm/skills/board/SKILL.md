---
description: "CELLM deep-onboarding mission orchestrator. Runs a contracted workflow over an external project and produces five required artifacts (JOURNAL, DSE, atoms seed, direction, boundary-status) with mandatory human gates, deterministic DSE fallback, and Oracle persistence. Use when: 'onboard this project deeply', 'run cellm board', 'deep onboarding mission', 'board on /path/to/repo', 'mission onboarding'. Not for shallow setup (use cellm:bootstrap) or single-doc generation (use docops:journal)."
cellm_scope: universal
user-invocable: true
argument-hint: "[absolute project path]"
allowed-tools: mcp__plugin_cellm_cellm-oracle__context_preflight, mcp__plugin_cellm_cellm-oracle__context_record_outcome, mcp__plugin_cellm_cellm-oracle__knowledge_add, mcp__plugin_cellm_cellm-oracle__dse_discover, mcp__plugin_cellm_cellm-oracle__dse_get, Read, Grep, Glob, Write, Edit, Skill, Bash(git *), Bash(ls *), Bash(test *), Bash(mkdir *), AskUserQuestion
---

# board — Deep Onboarding Mission

Mission-oriented orchestrator that turns an unknown external project into a complete, auditable CELLM onboarding pack. `board` does not invent analysis — it sequences existing CELLM capabilities behind explicit human gates and a strict artifact contract.

## Intent

- Reduce the recurring cost of deep onboarding while preserving output quality and auditability.
- Produce five required artifacts per run with a per-artifact status matrix.
- Persist durable project intelligence in Oracle so the next session starts warm.
- Surface ambiguity at human gates instead of guessing through it.

## Scope

| In scope | Out of scope |
|---|---|
| Deep onboarding of a single external project | Generic project scaffolding |
| Sequencing existing skills and tools | Reimplementing journal/DSE/knowledge logic |
| Mandatory gates and fallback protocol | Headless end-to-end without human confirmation |
| Run manifest and outcome record | Replacing collaborative technical review |

## Modes

Only **`assist`** is supported in v1. Both gates (S4 Tribal, S6 Direction) are mandatory. `guided-headless` and `manual-recovery` are reserved for later phases and MUST NOT be honored if requested in v1 — fall back to `assist` and tell the operator why.

## Inputs

| Input | Required | Notes |
|---|---|---|
| Absolute project path | yes | Must be readable; reject relative paths |
| Mode | no | Default `assist`; only mode honored in v1 |
| Project slug | no | Defaults to last path segment; used for Oracle scope |

## Normative Language

- `MUST`: mandatory requirement.
- `SHOULD`: strongly recommended unless a recorded exception exists.
- `MAY`: optional behavior.
- Allowed stage status values are strictly: `OK`, `PARTIAL`, `FAILED`.

## Workflow Contract

Each stage MUST end with explicit status (`OK`, `PARTIAL`, or `FAILED`). Never mark a stage `OK` with missing, placeholder, or unverifiable output.

### S0 — Preflight

1. Validate absolute path and project accessibility (`Bash(test *)`).
2. Detect existing CELLM artifacts and minimal stack signals (`Glob`, `Read` on `package.json`, `nuxt.config.*`, `pyproject.toml`, etc.).
3. Call `context_preflight` with `flow='board'` and consume policy envelope.
4. Emit `board-preflight` record with detected profile and stack hints.
5. If git context is unavailable, preflight MUST record `git_context: missing` in notes.

Failure: any unreadable path → abort run with `FAILED`, do not proceed. Missing git context is `PARTIAL` in preflight notes, but mission may continue.

### S1 — Census and Journal

1. Delegate `JOURNAL.md` generation to **docops:journal** for the target path.
2. Verify the produced file exists and has no `TODO: describe` placeholders in critical sections (project type, entry points, stack).
3. If placeholders remain in critical sections, mark the artifact `PARTIAL` and record the reason.

Hard rule: Mission MUST NOT proceed past S1 if `JOURNAL.md` is absent. If present but partial, mission MAY continue with artifact status `PARTIAL`.

### S2 — DSE Acquisition (with strict fallback)

Primary path:
1. Delegate to **cellm:dse-discover** with the project path.
2. Read the produced DSE preset (`dse_get` or local file under `.cellm/dse/`).

Fallback triggers (any one is sufficient):
- DSE payload empty.
- No color tokens detected.
- No framework detected AND no design-system signals found.
- Tool error or timeout.

Fallback protocol:
1. Walk the project for evidence: `tailwind.config.*`, `app.config.*`, `nuxt.config.*`, `theme.*`, primary CSS files, `package.json` UI dependencies.
2. Build a minimal valid DSE payload from observed evidence and runtime cues.
3. Write `.cellm/dse/DSE.md` with explicit `Source: fallback` and per-section evidence references.
4. Mark the artifact `OK (fallback)` in the matrix.

Hard rule: Mission MUST NOT proceed past S2 without a valid `DSE.md`. "Valid" means: evidence-backed sections, explicit confidence, and no placeholder tokens. If neither primary nor fallback can produce a valid DSE, abort with `FAILED`.

### S3 — Knowledge Seeding

1. Build a seed set of atoms from S1 + S2 findings (project purpose, stack, entry points, conventions, known risks).
2. Persist each atom via `knowledge_add` with `source: "board"` and `project: <slug>`.
3. Mirror the same set into `.cellm/knowledge/atoms-seed.md` (human-readable).
4. Reconcile counts: persisted atoms count MUST equal mirrored count.

Hard rule: Reconciliation mismatch → mark artifact `FAILED` and abort the run before S4. Persistence in v1 is synchronous; there is no decoupled retry path.

### S4 — Gate 1 (Tribal Knowledge)

Mandatory `AskUserQuestion` with the operator. Validate domain invariants the model cannot infer from code:

1. Are there historical constraints not visible in the repo?
2. Are there irreversible operations or destructive surfaces to flag?
3. Are there business rules that override code-level evidence?

Record answers verbatim into the run manifest. Unresolved ambiguity MUST be marked explicitly — never silently assumed. If the operator does not answer, Gate 1 status MUST be `FAILED`.

### S5 — Direction and Boundary

1. Synthesize `.cellm/direction.md` from S1+S2+S3+S4 evidence (focus, current target, blockers, confidence).
2. Synthesize `.cellm/boundary-status.md` (allowed surface, forbidden zones, escalation rules).
3. Each section MUST cite evidence origin (file path or gate answer).

### S6 — Gate 2 (Final Direction Validation)

Mandatory `AskUserQuestion`. Confirm with the operator that focus, blockers, and next steps are evidence-backed and acceptable. Record the verdict in the manifest.

If the operator rejects: mark direction artifacts `PARTIAL`, capture rejection reason, and continue to S7 to persist manifest + outcome with `PARTIAL` status — do not silently retry. If the operator is unavailable, Gate 2 status MUST be `FAILED`.

### S7 — Outcome Record

1. Build the artifact status matrix (see template below).
2. Ensure `.cellm/board/` exists before writing the manifest.
3. Write the machine-readable run manifest to `.cellm/board/run-<timestamp>.json`.
4. Call `context_record_outcome` with run summary, durations, gate verdicts, and matrix.
5. If `context_record_outcome` fails, the local run manifest MUST include `outcome_record: failed` and the run outcome cannot be `OK`.

## Artifact Contract

Five artifacts are required per run. The mission is `OK` only when all five are `OK` or `OK (fallback)`. Any `FAILED` makes the run `FAILED`. Any `PARTIAL` makes the run `PARTIAL`.

| # | Artifact | Path | Source |
|---|---|---|---|
| 1 | Project journal | `JOURNAL.md` | docops:journal |
| 2 | Design system | `.cellm/dse/DSE.md` | cellm:dse-discover or fallback |
| 3 | Knowledge seed | `.cellm/knowledge/atoms-seed.md` | board (mirrors Oracle atoms) |
| 4 | Direction | `.cellm/direction.md` | board (synthesis) |
| 5 | Boundary status | `.cellm/boundary-status.md` | board (synthesis) |

Quality rules:
- No placeholder sections in final outputs.
- No unresolved `TODO` tags outside an explicit `Open Questions` section.
- Confidence labels REQUIRED where uncertainty exists.
- Each artifact references evidence origin where applicable.
- Artifact matrix MUST include a non-empty `reason` for every `PARTIAL` or `FAILED` status.

## Run Manifest

`.cellm/board/run-<timestamp>.json` schema (machine-readable, used for replay auditing):

```
{
  "version": 1,
  "project": "<slug>",
  "path": "<absolute>",
  "mode": "assist",
  "started_at": "<iso>",
  "ended_at": "<iso>",
  "duration_seconds": <int>,
  "stages": [
    { "id": "S0", "status": "OK|PARTIAL|FAILED", "duration_seconds": <int>, "notes": "" }
  ],
  "gates": [
    { "id": "G1", "stage": "S4", "verdict": "approved|rejected", "answers": [] },
    { "id": "G2", "stage": "S6", "verdict": "approved|rejected", "answers": [] }
  ],
  "artifacts": [
    { "name": "JOURNAL.md", "status": "OK", "path": "JOURNAL.md", "reason": "" }
  ],
  "fallbacks": [ "S2:dse-empty" ],
  "interventions": <int>,
  "outcome": "OK|PARTIAL|FAILED"
}
```

## Routing Summary

```
S0 preflight  -> context_preflight + bash/glob
S1 journal    -> delegate docops:journal
S2 dse        -> delegate cellm:dse-discover, fallback inline if invalid
S3 knowledge  -> knowledge_add (sync) + Write local mirror, reconcile
S4 gate-1     -> AskUserQuestion (tribal invariants)
S5 direction  -> Write direction.md + boundary-status.md
S6 gate-2     -> AskUserQuestion (final validation)
S7 outcome    -> context_record_outcome + Write run manifest
```

## Operating Assumptions (v1)

These resolve the spec's open questions for v1. Revisit at the M1 pilot.

1. Both gates are always mandatory in `assist`. No profile-based bypass.
2. DSE fallback triggers on empty payload, missing colors, missing framework with no design-system signals, or tool error — no numeric confidence threshold.
3. Oracle persistence is synchronous and blocking. Failure aborts the stage.
4. Run manifest is always emitted, even on `FAILED` runs, for audit replay.

## NEVER

- Promise headless end-to-end execution. Both gates are part of the contract.
- Skip the DSE fallback when the primary path returns an invalid payload.
- Mark a run `OK` with any artifact in `PARTIAL` or `FAILED`.
- Persist atoms to Oracle without reconciling against the local mirror file.
- Reinvent journal, DSE, or knowledge logic — delegate to existing skills.
- Continue past S1 without `JOURNAL.md`, past S2 without `DSE.md`, or past S3 with reconciliation mismatch.
- Honor `guided-headless` or `manual-recovery` in v1; fall back to `assist` and explain.
- Silently assume tribal invariants — Gate 1 records ambiguity explicitly.

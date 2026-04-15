# Spec Guardrails Contract v1

Canonical execution contract persisted in `check.body.guardrailsContract`.

Purpose: remove ambiguity between decomposition and execution by turning
execution posture into explicit, machine-readable policy.

## Minimal Schema

```yaml
guardrailsContract:
  version: "v1"
  directivePrecedence:
    - user
    - adr_wave
    - skill
    - style
  executionModeContract:
    mode: balanced
    interruptBudgetPerPhase:
      throughput: 0
      balanced: 1
      conservative: -1
    escalationPolicy:
      throughput: blockers_only
      balanced: one_per_phase
      conservative: per_step_allowed
  loopBreaker:
    maxMetaUpdatesWithoutProgress: 2
    action: execute_next_safe_step
  hardBlockers:
    - regulatory_invariant_break
    - security_risk_critical
    - destructive_action_without_authority
    - source_of_truth_conflict
    - evaluation_api_failure
  phaseGatePolicy:
    perPhase:
      - contract_verify
      - typecheck
    finalGate:
      - contract_verify
      - lint
      - typecheck
      - test
      - build
      - olympus
  approvalInheritance:
    enabled: true
    reaskOnlyIf:
      - duplicate_spec
      - unclear_scope
      - missing_plan
  postDecomposeHandoff:
    executeImmediately: true
  trackingGranularity:
    default: phase_level
    audit: task_level
  evidenceRequirements:
    - diff_summary
    - gate_result
    - go_no_go_record
    - journal_entry
  outputStyle:
    emojis:
      policy: forbidden
      preserveInLiteralQuotes: true
    asciiMarkers:
      positive: "[+]"
      negative: "[-]"
      alert: "[!]"
      neutral: "[~]"
    compatibility:
      plainText: true
      basicMarkdown: true
```

## Enforcement Rules

1. `plan-to-spec` MUST write this contract (or an explicit superset) into
   `check.body.guardrailsContract` for new decompositions.
2. `execute` MUST read and validate this contract before Stage 2.
3. Missing/invalid contract behavior:
   - `critical`/`high` priority: fail-closed (block execution and escalate).
   - `medium`/`low` priority: continue with safe defaults and emit telemetry.
4. Runtime cadence (`throughput`/`balanced`/`conservative`) MUST follow
   `executionModeContract`.
5. Questions that violate `interruptBudgetPerPhase` are contract violations.
6. Loop breaker MUST trigger when `maxMetaUpdatesWithoutProgress` is reached.

## Notes

- This contract is CELLM policy over Claude Code primitives (skills/agents/hooks).
- It is additive and backward-compatible: existing fields (`approvalTicket`)
  remain valid and independent.

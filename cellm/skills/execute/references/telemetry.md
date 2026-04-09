# Telemetry and Continuous Improvement

## Execution Gate Metrics (mandatory -- recorded at Stage 2)

Track per execution run via `context_record_outcome` with deterministic keys:
- **`decomposition_source`**: `check.body.decompositionSource` if set, else `unknown` (never invent from free-text context).
- **`recommended_executor`**: CELLM recommendation from Strategy Selection Rules.
- **`selected_executor`**: user M1 choice.
- **`autonomy_level`**: user M2 outcome -- mode value (`throughput`, `balanced`, or `conservative`), NOT menu labels (A/B) or synonyms (`direct`/`assisted`).
- **`certification_choice`**: user M3 choice (array, e.g., `["convergir", "olympus"]`).
- **`blocked_reason`**: when fail-closed activates (e.g., `M2_not_answered`, `M3_not_answered`).

## Execution Metrics (always collected)

Track per execution run via `context_record_outcome`:
- **Override rate**: user strategy overrides / total steps proposed. Target: < 15%.
- **Phase reopen rate**: phases reopened after `go` / total phases. Target: < 5%.
- **Late no_go**: `no_go` detected after next step started. Target: 0.
- **Retry rate**: asclepius retries / total steps.
- **Decision coverage**: steps with recorded go/no-go / total steps. Target: 100%.
- **Approval prompt count**: explicit Stage 2 prompts shown in run.
- **Approval prompt skipped**: Stage 2 skipped by valid ticket.
- **Approval ticket reused/rejected**: ticket acceptance quality by reason.

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: write feedback to `dev-cellm-feedback/entries/execute-{date}-{seq}.md`. Include:
- Risk scores per phase: structural vs empirical, and whether strategy matched expectations
- Go/no-go verdicts: `go` / `conditional` / `no_go` counts, whether they caught real issues
- User overrides: which strategies were changed, rationale, whether override improved outcome
- Confidence bands: accuracy per band (did high-confidence steps actually pass without issues?)
- Execution mode used and whether user switched mid-run
- Total steps, step durations, skill composition used
- Retry cycles: how many, which phases, root cause pattern

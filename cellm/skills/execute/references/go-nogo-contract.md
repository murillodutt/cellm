# Go/No-Go MCP Contract

## Evaluate
When calling `go_no_go_evaluate`, pass IDs from the resolved spec tree:
- **phase_exit**: `{ projectKey, subjectType: "phase", subjectRef: { phaseId: "<phase-id>", phaseTypeKey: "<type>" }, decisionClass: "phase_exit" }`
  - `phaseTypeKey` is derived from the phase specialist role: `convergence-gate`, `db-specialist`, `security-specialist`, `ui-specialist`, `api-specialist`, or `general`. Always include it -- the execution planner uses it for empirical risk adjustment.
- **check_exit**: `{ projectKey, subjectType: "check", subjectRef: { checkId: "<check-id>" }, decisionClass: "check_exit" }`

## Record (mandatory after every evaluate)
Call `go_no_go_record` immediately after evaluation to persist the verdict. This creates an immutable audit trail.

## Render (in reports)
Call `go_no_go_render` to generate the decision matrix for inter-stage and final reports. Include the rendered output in user-facing reports.

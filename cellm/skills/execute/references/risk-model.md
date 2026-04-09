# Risk Score Model (per phase, 0-10)

Risk = structural score + empirical adjustment.

## Structural Score (static, from spec tree)

| Factor | Points |
|--------|--------|
| Specialist focus: DB / security / auth / migration | +3 |
| Check priority critical | +2 |
| Check priority high | +1 |
| Tasks with fileRefs in server/db/ or auth/ | +2 |
| Phase is Convergence Gate | +3 (forces spec-treat) |
| 4+ distinct fileRef paths (high coupling) | +2 |
| More than 6 tasks in phase | +1 |

## Empirical Adjustment (from go/no-go history)

Query `go_no_go_render` for the project. If historical data exists for similar phase types:
- Phase type had `no_go` rate > 30% in past checks -> +2
- Phase type had `conditional` rate > 50% -> +1
- Phase type had 100% `go` in past 3 checks -> -1 (min 0)

If no historical data, use structural score only.

## Confidence Band

| Risk | Band | Checkpoint Strategy |
|------|------|-------------------|
| 0-2 | High confidence | Confirm every N steps (N = total low-risk steps, min 2) |
| 3-5 | Medium confidence | Confirm per phase |
| 6-10 | Low confidence | Confirm per critical task within phase |

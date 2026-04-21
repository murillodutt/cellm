# CELLM Persona — Manual Validation Checklist

Run this checklist on **first Claude Code session after a release** that touches
`skills/tilly/docs/CELLM-PERSONA.md`, `skills/tilly/scripts/inject-persona.sh`, or `hooks/hooks.json`.

The automated test (`skills/tilly/tests/inject-persona.test.ts`, bun test) covers script integrity,
JSON validity, and content presence. This checklist validates what only a real session
can reveal: **does Claude actually behave according to the persona?**

---

## Pre-flight

- [ ] Plugin `cellm` installed and enabled in target project
- [ ] Oracle worker online (check via `/cellm:status` or `http://127.0.0.1:31415/api/health`)
- [ ] Version sync confirmed (`bash scripts/sync-version.sh --check-only`)

---

## Runtime checks (new session)

- [ ] **Hook fires at SessionStart** — check Claude Code logs for
      `inject-persona.sh` execution (no error messages)

- [ ] **Signal: `Wikipedia`** — send mid-turn, verify next reply compresses
      (ATOM blocks or short prose, not expansive paragraphs)

- [ ] **Signal: `ATOM de decisao`** — send mid-turn, verify reply reformats
      to `@options A/B/C` ATOM block with single objective question

- [ ] **Signal: `verify first`** — send when Claude is about to act without
      evidence, verify Claude pauses and consults source

- [ ] **Signal: `partner check`** — send when decision point, verify Claude
      stops and presents tradeoffs instead of deciding alone

- [ ] **Signal: `step back`** — send when Claude is deep in detail,
      verify Claude zooms out to big picture

- [ ] **Signal: `prose`** / **`ATOM`** — verify immediate format switch

- [ ] **Affect cue handling** — send `😂`, `❤️`, `haha`, `kkk`, `rsrs` without explicit command;
      verify Claude does not pause or reset execution

- [ ] **Audit-reception discipline** — provide an external technical audit with
      multiple findings, verify Claude performs `verify first -> claim
      classification (accept/reject/conditional) -> patch later` (never direct patch
      from source text)

- [ ] **No repeated clarification loop** — when the context already answers the
      next step, verify Claude does not ask a redundant question

- [ ] **Assumption then continuation** — when ambiguity is local and resolvable,
      verify Claude states the assumption once and keeps executing

- [ ] **Directive precedence respected** — when user directive conflicts with
      lower-priority persona/style guidance, verify Claude follows user directive
      and records any explicit pivot if scope changed

- [ ] **A/B/C only when needed** — when multiple paths are real, verify Claude
      compares options briefly, recommends one, and does not ask if the winner
      is already obvious by evidence

- [ ] **Road continuity preserved** — after choosing a path, verify Claude keeps
      the same objective and does not silently drift to an unrelated outcome

- [ ] **Documentation-first on uncertainty** — when framework/API/tool behavior is
      uncertain, verify Claude consults MCP knowledge sources (`context7`, `Nuxt`,
      `Nuxt-UI` when relevant) or official docs
      before proposing or executing the solution

---

## Behavioral checks

- [ ] **Relational framing maintained** — Claude treats interaction as
      partnership, uses "parceiro"/"amigo" tone when user writes Portuguese

- [ ] **States path once, then executes** — Claude explains the chosen path
      briefly, then keeps moving without repeated self-justification

- [ ] **Executive shape enforced** — default response structure is
      `Decision -> Action -> Evidence` without meta preamble

- [ ] **Questions only when truly external** — Claude asks binary or A/B/C only
      when a decision cannot be resolved from code, docs, specs, or prior direction

- [ ] **No validation theater** — no reconfirmation prompt when evidence already
      determines the next step

- [ ] **Affect non-blocking** — social cues (emoji/laughter/slang) are acknowledged
      briefly and execution continues unless user gives explicit direction change

- [ ] **No guessing from memory** — Claude does not rely on recalled docs or
      assumptions when authoritative documentation can be consulted

- [ ] **External audit treated as adversarial input** — verify Claude does not
      accept findings on source reputation alone; each load-bearing claim is backed
      by independent evidence

- [ ] **Execution mode semantics (`DIRECT`)** — after `cellm:execute` resolves
      `M2=DIRECT`, verify Claude does not pause between phases except on hard blockers

- [ ] **Interrupt budget enforced (`BALANCED`)** — verify max 1 objective
      escalation per phase unless blocker severity justifies exception

- [ ] **Closes blocks before pausing** — Claude never leaves task in_progress
      across sessions without explicit user handoff

- [ ] **No Wikipedia drift** — across multiple turns, Claude keeps prose
      direct and ATOM artifacts dense

- [ ] **No emoji output** — replies contain no emojis except when reproducing
      literal user quotes; non-verbal markers use only `[+]`, `[-]`, `[!]`, `[~]`

- [ ] **Does not reopen resolved branches** — after choosing a path, Claude
      continues execution instead of revisiting the same decision

- [ ] **Continues until blocker or finish** — Claude does not stop midstream
      when the next safe step is obvious from evidence

- [ ] **Loop breaker active** — after two consecutive status/meta-only updates
      without code/test progression, verify Claude executes next safe step
      instead of requesting reassurance

- [ ] **Final output matches the active plan** — the delivered work, validation,
      and handoff clearly map back to the chosen road or to an explicitly stated pivot

- [ ] **Proposal contract complete** — every non-trivial proposal includes
      owner, scope, and measurable acceptance criteria

---

## Regression checks

- [ ] **Existing SessionStart hooks still fire** — Oracle startup, init,
      context (persona should be last in chain)

- [ ] **Persona injection does not break other hooks** — check session
      startup completes without errors or timeouts

- [ ] **Token budget acceptable** — startup payload is condensed to persona +
      startup contract; verify no context overflow warnings

---

## Failure handling

If any runtime check fails:

1. Check `skills/tilly/scripts/inject-persona.sh` ran successfully (exit code 0, valid JSON output)
2. Check `skills/tilly/docs/CELLM-PERSONA.md` was modified correctly
3. Re-run automated test: `bun test cellm-plugin/cellm/skills/tilly/tests/inject-persona.test.ts`
4. If automated passes but manual fails: Claude is receiving context but not
   honoring it — persona content may need refinement or stronger phrasing

If multiple signals fail in same session:

- Persona may not have been injected (hook chain broken)
- Restart session, check hook logs
- Open issue with session transcript for analysis

# CELLM Persona — Manual Validation Checklist

Run this checklist on **first Claude Code session after a release** that touches
`CELLM-PERSONA.md`, `inject-persona.sh`, or `hooks/hooks.json`.

The automated test (`tests/inject-persona.test.sh`) covers script integrity, JSON
validity, and content presence. This checklist validates what only a real session
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

---

## Behavioral checks

- [ ] **Relational framing maintained** — Claude treats interaction as
      partnership, uses "parceiro"/"amigo" tone when user writes Portuguese

- [ ] **Thinks out loud before acting** — Claude narrates reasoning before
      executing any non-trivial change

- [ ] **One objective question per turn** — Claude ends replies with single
      A/B/C or binary choice, not open-ended "what do you want?"

- [ ] **Closes blocks before pausing** — Claude never leaves task in_progress
      across sessions without explicit user handoff

- [ ] **No Wikipedia drift** — across multiple turns, Claude keeps prose
      direct and ATOM artifacts dense

---

## Regression checks

- [ ] **Existing SessionStart hooks still fire** — Oracle startup, init,
      context (persona should be last in chain)

- [ ] **Persona injection does not break other hooks** — check session
      startup completes without errors or timeouts

- [ ] **Token budget acceptable** — persona adds ~60 lines of
      `additionalContext`; verify no context overflow warnings

---

## Failure handling

If any runtime check fails:

1. Check `inject-persona.sh` ran successfully (exit code 0, valid JSON output)
2. Check `CELLM-PERSONA.md` was modified correctly
3. Re-run automated test: `bash cellm-plugin/cellm/tests/inject-persona.test.sh`
4. If automated passes but manual fails: Claude is receiving context but not
   honoring it — persona content may need refinement or stronger phrasing

If multiple signals fail in same session:

- Persona may not have been injected (hook chain broken)
- Restart session, check hook logs
- Open issue with session transcript for analysis

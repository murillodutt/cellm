---
description: "Generate structured upstream feedback for the CELLM engineering team. Produces evidence-first Markdown at docs/evidence/<date>-cellm-feedback-*.md for bugs, anti-patterns, deprecation gaps, and harness surprises, with optional atom registration via knowledge_ops. Use when: 'feedback for CELLM', 'send to CELLM team', 'register this as atom', 'document this anti-pattern', 'report this bug upstream'. Trigger proactively on MCP schema/runtime mismatches, mechanical edit loops (>=3 sequential edits), short deprecation windows (<6 weeks), or reusable harness surprises. Do NOT trigger for routine feature work or project-local bugs."
cellm_scope: universal
user-invocable: true
argument-hint: "[slug | 'proactive']"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(git *), Bash(mkdir *), Bash(date *), mcp__plugin_cellm_cellm-oracle__knowledge_ops
---

# cellm-feedback — Evidence-first upstream feedback

## Why this skill exists

The CELLM engineering team (product, harness, Oracle, skill authors)
depends on field signal from Tilly and peer skills running in real
projects. Each session is a laboratory. When bugs, anti-patterns, or
optimization opportunities are observed, they should flow back as
structured evidence — not scattered Slack messages or ad-hoc atoms.

This skill standardizes that flow. It produces a single MD per finding
or batch of findings, optionally mirrors reusable items as CELLM atoms,
and enforces the minimum evidence contract: **method, evidence, impact,
proposal, owner, acceptance criteria**.

## When to trigger

### Explicit triggers
- User says: "feedback for CELLM", "send to CELLM team", "register this
  as atom", "document this anti-pattern", "report this bug upstream",
  "vamos aprender com isto", "evidência para a Tilly".
- `/cellm:cellm-feedback <slug>` — invocation with explicit slug.

### Proactive triggers (strong signal required)
Activate without waiting for the user when **any** of these is observed:

1. **MCP tool schema/runtime mismatch.** Example: tool declares a field
   as optional via `anyOf` but runtime returns `Invalid input: <field>:
   expected string, received undefined`. Severity: medium.
2. **Mechanical-edit loop.** ≥ 3 `Edit` tool calls with the same
   `old_string → new_string` pattern executed sequentially where a
   single Bash/Python script would have worked. Severity: high
   (token economy).
3. **Deprecation with short sunset.** Tool response contains
   `deprecation` field with `sunsetDate` < 6 weeks away and consumer
   skills still reference the deprecated name. Severity: medium.
4. **SessionStart hook silent truncation.** `additionalContext` exceeds
   display budget and is written to disk without inline warning to the
   agent. Severity: low-medium.
5. **Harness surprise.** A tool, hook, or skill exhibits non-obvious
   runtime behavior that the agent spent >1 turn figuring out **and**
   the behavior would likely repeat for another agent.
   Severity: varies.
6. **Documentation drift vs runtime.** A SKILL.md or reference doc
   in CELLM plugin files (skills/hooks/refs under `cellm-plugin/**`)
   mentions a path/tool/flag that no longer exists or has been renamed
   in the current plugin version. Consumer project docs do not trigger
   this rule. Severity: low.

### Do NOT trigger for
- Routine feature implementation or refactor.
- Product/business decisions specific to the consumer project.
- Bugs in application code that don't touch CELLM plugin, hooks, MCP
  tools, skills, or harness behavior.
- Minor typos in user-facing prose.
- One-off user preferences ("I don't like this output format").

## Flow

### 1. Classify the finding

For each observation, classify:

| Field | Values |
|---|---|
| `type` | `bug` / `anti-pattern` / `discovery` / `decision` / `meta` |
| `severity` | `critical` / `high` / `medium` / `low` |
| `scopeClass` | `project` / `harness` / `external-vendor` / `tooling` / `framework` |
| `reusable` | `true` (register as atom) / `false` (MD-only) |
| `channel` | `oracle-issue` / `plan` / `skill-update` / `atom-only` |

Reusable = the finding applies to **other projects**, not just the
current one. Bug in an MCP tool → reusable. A typo in a project-specific
ADR → not reusable.

### 2. Locate the evidence doc

Target path (always relative to project root of the consumer):

```
docs/evidence/<YYYY-MM-DD>-cellm-feedback-<slug>.md
```

If a doc for the same date + slug already exists, **append** to it as
a new numbered finding. Do not overwrite.

If no `docs/evidence/` dir exists in the consumer project, create it.

### 3. Write the MD — fixed template

Every MD follows this structure. Sections are mandatory unless marked
optional.

```markdown
# Session feedback — <title> (<YYYY-MM-DD>)

**Data:** <YYYY-MM-DD>
**Sessão:** <short context: skill name / project / task>
**Escopo:** <1-line description of findings>
**Destino:** equipe CELLM (triagem + decisão por item).
**Formato:** cada achado é auto-contido — método, evidência, impacto,
proposta, classificação. Equipe filtra o que entra em backlog.

---

## Sumário executivo

| # | Achado | Tipo | Severidade | Canal sugerido |
|---|---|---|---|---|
| 1 | ... | ... | ... | ... |

---

## 1. <finding title>

### Classificação
- type: <bug|anti-pattern|discovery|decision|meta>
- severity: <critical|high|medium|low>
- scopeClass: <project|harness|external-vendor|tooling|framework>
- reusable: <true|false>
- channel: <oracle-issue|plan|skill-update|atom-only>

### Observação
<what happened, concrete and short>

### Evidência
<commands run, tool call payloads, log excerpts, file/line refs>
At least one evidence item must be externally verifiable (repro command,
commit hash, file:line, or literal payload). Subjective narrative alone
fails the contract.

### Impacto
<measured or ordered-of-magnitude effect: tokens, latency, correctness>
Include at least one objective metric (tokens, seconds, count, or
correct/incorrect boolean). If only qualitative evidence is available,
prefix with `qualitative:` and justify why no metric was possible.

### Proposta
<concrete fix or mitigation>

### Owner sugerido
<team: harness / Oracle / skill authoring / governance>

### Acceptance criteria
- <objective criterion 1>
- <objective criterion 2>

---

## Anexos (optional)

### A. Commits de referência
- `<hash>` — <title>

### B. Atoms CELLM relacionados
- `<ka_xxx>` — <title>

### C. Atoms registrados nesta sessão
- `<ka_xxx>` — <anti-pattern name>
```

**Why the template is fixed:** CELLM team triages by skimming the
sumário executivo. Uniform structure lets them batch-triage 10
findings in minutes instead of parsing 10 different formats.

**Numbers are order-of-magnitude unless explicitly measured.** State
so. Do not fabricate precision.

### 4. Register atoms (when `reusable = true`)

For every reusable finding, register via `knowledge_ops.knowledge_add`:

```json
{
  "operation": "knowledge_add",
  "project": "<consumer-project-key>",
  "title": "<ANTI-NAME or short finding title>",
  "detail": "<≤2000 chars: what + rule + source>",
  "scope": "<dot.path, e.g. 'agent/tool-usage' or 'harness/mcp'>",
  "scopeClass": "harness",
  "tags": ["anti-pattern", "token-economy", ...],
  "confidence": 0.85,
  "sourceRef": "docs/evidence/<file>.md",
  "status": "active",
  "source": "tilly-self-audit"
}
```

**Important:** `scope` is required at runtime despite the JSONSchema
declaring it optional (known bug, documented in this skill's own
source evidence). Always pass a non-empty `scope` string.

After registration, cross-link atom IDs back into the MD under
Anexos §C.

### 5. Classify channel and signal next step

At the end of the MD, list what the CELLM team should do with each
finding:

- `oracle-issue` → file in Oracle issue tracker (future, manual today)
- `plan` → add to a WAVE plan for the CELLM project
- `skill-update` → update SKILL.md, PERSONA, or refs
- `atom-only` → persisted as atom; no further action needed

This is **triage help**, not a decision for the team. They accept or
reroute.

### 6. Commit

Commit message format:

```
docs(evidence): <imperative summary of findings>

<2-3 line expansion. List atom IDs if registered.>
```

Atomic commit: only the evidence MD and any updated atoms cross-link.
Do not bundle unrelated work.

## Output contract

This skill produces **exactly one new file per invocation** (or
appends to an existing same-day doc). Plus optional atom registrations.

Never produces:
- Code changes to the consumer project (that's other skills' job).
- Changes to the CELLM plugin itself (that's upstream work driven by
  the MD).
- Inline fixes for the reported bugs (the team decides).

## Signals

| Signal | Meaning |
|---|---|
| "register as atom" | Force `reusable = true` for current finding. |
| "MD-only" | Force `reusable = false`, skip atom step. |
| "append" | Append to today's existing doc instead of creating new. |
| "batch" | Collect N findings into one MD before writing. |

## Anti-patterns of this skill itself

- **Overuse** — activating for every small observation. Use the
  proactive trigger list as gate; if none match, wait for explicit
  request.
- **Prose inflation** — verbose "what happened" narratives. Keep the
  Observação section to 2-4 sentences. If context is needed, link
  to a transcript or file.
- **Fabricated severity** — calling everything "high". Reserve high for
  ≥20% token impact or correctness bugs. Default to medium/low.
- **Precision theater** — "~25.650 tokens saved" reads as measured but
  rarely is. Write "ordem de grandeza 20-30k" or "measured 25k".
- **Channel dumping** — marking everything `oracle-issue`. Most
  findings land as `atom-only` or `skill-update`.

## NEVER

- **Never write to ~/.claude/plugins/cache/** — that's ephemeral and
  overwritten on plugin update. Authoritative skill home is the
  cellm-private repo.
- **Never register an atom without `scope`** — runtime requires it.
- **Never include raw customer PII in evidence** — redact before
  writing. If a bug repro involves real CPF/CNPJ, hash or mask it.
- **Never bundle a CELLM feedback doc with unrelated code changes in
  the same commit** — atomic, searchable history matters for triage.
- **Never claim a finding is "CELLM's fault" without evidence** —
  describe observation neutrally; the team investigates.

## Reference implementation

First real use of this skill (and source of its own anti-pattern
catalog): `docs/evidence/2026-04-18-cellm-feedback-session-housekeeping.md`
in the `zqx` project. 7 findings, 5 atoms registered, playbook +
3 governance metrics included. Use it as canonical example of
density, tone, and evidence depth.

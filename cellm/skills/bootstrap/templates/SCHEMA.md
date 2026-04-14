# Field Report Entry Schema

> **Normative source of truth for entry frontmatter.** If this file and
> the project rule file disagree on field names or types, **this file wins**.

## Format

Every entry in `entries/` is a markdown file with YAML frontmatter followed by
three ATOM body blocks (`@context`, `@observation`, `@implication-for-cellm`).

The frontmatter is parsed by humans and by agents. It must be valid YAML and
it must validate against the fields below.

## Fields

### Required fields

| Field             | Type            | Constraint                                           | Description |
|-------------------|-----------------|------------------------------------------------------|-------------|
| `id`              | string          | format `YYYY-MM-DD-NNN`                              | Canonical entry ID, also used for cross-reference |
| `date`            | ISO date        | `YYYY-MM-DD`                                         | Day the event was registered |
| `session_hash`    | string          | 7-char git HEAD or `"uncommitted"`                   | Anchors entry to a specific repo state |
| `type`            | enum            | `friction \| decision \| gap \| win \| surprise`     | Event classification |
| `severity`        | enum            | `info \| low \| medium \| high \| critical`          | Impact on refinement priority |
| `cellm_subsystem` | array of enum   | see `Cellm subsystems` below                         | Which parts of CELLM the event touches |
| `trigger`         | string          | one sentence, literal                                | The atomic event description |
| `evidence`        | object          | see `Evidence object` below                          | Citations |
| `outcome`         | enum            | `observed \| resolved \| escalated \| deferred`      | State of the event at write time |
| `links`           | object          | see `Links object` below                             | Cross-references |

### Cellm subsystems (allowed values in `cellm_subsystem`)

- `mantra` — The mantra or mantra gate
- `ccm` — CCM adversarial loop protocol
- `spec` — CellmOS spec / plan-to-spec / spec router
- `oracle` — Oracle MCP tools, worker, DB
- `skill:<name>` — a specific skill (e.g. `skill:tilly`, `skill:bootstrap`)
- `docops` — Documentation operations
- `rule` — A CELLM rule file
- `knowledge` — Knowledge atoms / semantic search
- `pattern` — Project-specific tribal knowledge captured in patterns
- `dse` — Design System Engine
- `sce` — Structured Context Envelope / context preflight
- `other` — Does not fit the above; body must explain

Multiple subsystems allowed. Use `[skill:tilly, mantra]` when relevant.

### Evidence object

```yaml
evidence:
  files: [path/to/file.ts, path/to/other.md]
  commits: [<sha-short>]
  commands: ["git status"]
```

All three keys are arrays. Empty array is valid but at least **one** of
`files`, `commits`, `commands` must be non-empty. An entry with zero evidence
is invalid — opinions require citation.

### Links object

```yaml
links:
  adr: docs/decisions/YYYY-MM-DD-slug.md  # or null
  prev_entry: YYYY-MM-DD-NNN              # or null
  pr: "https://..."                        # optional
  issue: null                              # optional
```

- `adr`: required to be non-null for `type: decision` entries.
- `prev_entry`: used when this entry supersedes, refines, or corrects a
  previous one. Append-only archive — never edit past entries, chain instead.

## Body contract

Body is exactly three H2 sections in this order:

```markdown
## @context
## @observation
## @implication-for-cellm
```

No fourth section. No prose above the first H2. No trailing content below
the third section. If the entry needs more, split into two entries.

## Validation rules

An entry is **valid** if and only if:

1. Frontmatter is valid YAML.
2. All required fields are present and non-empty.
3. `id` matches format `YYYY-MM-DD-NNN`.
4. `type` is one of the five allowed values.
5. `severity` is one of the five allowed values.
6. `cellm_subsystem` is a non-empty array of allowed enum values.
7. `evidence` has at least one non-empty key among `files`, `commits`, `commands`.
8. Body has exactly the three required H2 sections in order.
9. `type: decision` entries have `links.adr` non-null.

## Version

- Schema version: `1.0.0`
- Shipped by: `cellm:bootstrap`

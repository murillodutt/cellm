---
description: "Ingest a Stitch DESIGN.md into the CELLM DSE as ATOM decisions. Parses the 5 canonical sections, maps each design element to an ATOM decision, deduplicates against existing DSE entries, and persists. Use when: 'ingest design', 'stitch to dse', 'import design system', 'sync design.md'."
user-invocable: true
argument-hint: "[path to DESIGN.md or .stitch/ directory]"
allowed-tools: Read, Glob, AskUserQuestion
---

# Stitch Ingest — DESIGN.md to DSE

Parse a Stitch-generated DESIGN.md and persist every design decision as an ATOM entry in the CELLM Design System Engine.

## Pipeline

1. **Locate** — resolve the DESIGN.md path:
   - If argument is a file path, use directly.
   - If argument is a directory, look for `DESIGN.md` inside it.
   - If no argument, search `.stitch/DESIGN.md` in the project root.
   - If not found, report absence and exit.

2. **Parse** — extract the 5 canonical sections:

   | Section | What to Extract |
   |---------|----------------|
   | Core Identity | Aesthetic philosophy, brand personality, design language keywords |
   | Color Foundation | Color names, hex values, functional roles (primary, accent, surface, text) |
   | Typography | Font families, weights, sizes, line-height, letter-spacing |
   | Components | Button styles, card patterns, nav patterns, form elements with exact values |
   | Layout | Max-width, grid system, breakpoints, spacing scale |

3. **ATOM Mapping** — convert each extracted element to an ATOM decision:

   ```
   "[INTENT — why/what] (currently [IMPLEMENTATION — how])"
   ```

   | DESIGN.md Element | DSE Entity Type | ATOM Example |
   |-------------------|----------------|--------------|
   | `Primary: #4F46E5 (Indigo)` | token | "Brand-aligned primary — identity anchor (currently indigo-600 #4F46E5 in app.config)" |
   | `Surface: #F9FAFB` | token | "Light neutral surface — content readability (currently gray-50 #F9FAFB as bg-muted)" |
   | `Font: Inter, 400/500/700` | token | "Clean sans-serif hierarchy — scannable text (currently Inter 400/500/700)" |
   | `Heading: 2.25rem/700` | token | "Bold heading scale — clear visual hierarchy (currently text-4xl font-bold)" |
   | `Button: rounded-lg, px-6 py-3` | component | "Generous touch targets — accessible interaction (currently rounded-lg px-6 py-3)" |
   | `Card: shadow-sm, rounded-xl, p-6` | component | "Subtle elevation cards — content grouping (currently shadow-sm rounded-xl p-6)" |
   | `Max-width: 1280px` | pattern | "Contained readable width — prevents eye strain (currently max-w-7xl 1280px)" |
   | `Grid: 12-column, gap-6` | pattern | "Flexible column grid — responsive composition (currently grid-cols-12 gap-6)" |
   | `Spacing: 4px base` | token | "Consistent 4px rhythm — visual harmony (currently 4px base scale)" |
   | `Border-radius: 0.75rem` | token | "Soft rounded aesthetic — friendly personality (currently rounded-xl 0.75rem)" |

4. **Dedup Check** — for each ATOM decision:
   - Call `dse_search` with the intent keywords.
   - If a match with >= 80% similarity exists, skip (report as existing).
   - If a partial match exists (50-79%), ask user: **Overwrite** or **Merge** (append as variant).

5. **Persist** — send new/updated decisions:
   - Call `POST /api/design-system/update` with the `decisions[]` array.
   - Group by entity type: tokens first, then components, then patterns, then compositions.

6. **Reindex** — call `dse_reindex` to rebuild the search index with new decisions.

7. **Report** — summary table:

   | Metric | Count |
   |--------|-------|
   | Sections parsed | N/5 |
   | ATOM decisions generated | N |
   | Already existing (skipped) | N |
   | Merged (user choice) | N |
   | New decisions persisted | N |

## ATOM Quality Rules

- Intent survives major version changes — describes WHAT and WHY, never just HOW
- Snapshot in parenthetical is the current implementation — replaceable
- ATOM test: remove the parenthetical — does the sentence still guide design? If not, rewrite
- Use Nuxt UI v4 semantic vocabulary in snapshots: `text-dimmed`, `bg-muted`, `border-default` — never raw Tailwind (`text-gray-400`)
- L2 only: never duplicate framework documentation

## Semantic Token Mapping

When converting DESIGN.md colors to ATOM snapshots, use semantic tokens:

| DESIGN.md Pattern | Semantic Token |
|-------------------|---------------|
| White / light background | `bg-default` |
| Light gray background | `bg-muted` |
| Dark text / headings | `text-highlighted` |
| Body text | `text-default` |
| Muted text / captions | `text-dimmed` |
| Border / divider | `border-default` |
| Primary action color | `primary` (app.config) |
| Danger / error color | `error` (app.config) |

## Graceful Degradation

| Condition | Behavior |
|-----------|----------|
| DESIGN.md not found | Report absence, suggest running `stitch:stitch-bridge analyze` first |
| Section missing from DESIGN.md | Parse available sections, report which are missing |
| DSE not available | Generate ATOM decisions to stdout, skip persist/reindex |
| `dse_search` fails | Skip dedup, persist all (warn about potential duplicates) |
| Malformed DESIGN.md | Parse what is possible, report unparseable sections |

## NEVER

- **Persist without dedup check** — always search existing DSE decisions first
- **Generate raw Tailwind in ATOM snapshots** — use semantic tokens from the mapping table
- **Skip user confirmation on merge conflicts** — partial matches require explicit Overwrite/Merge choice
- **Ingest framework defaults** — only persist project-specific design decisions from DESIGN.md
- **Overwrite existing ATOMs silently** — report every skip, merge, and creation in the summary

---
description: Frontend architecture orchestrator for Nuxt 4, Vue 3, Nuxt UI v4, and Tailwind v4. Routes to specialist GDU skills (vue, nuxt, tailwind, pinia) and enforces DSE decisions. Triggers when users request UI components, pages, layouts, or frontend work.
user-invocable: false
---

# Goold Design UI (GDU) Framework

GDU is a rigorous **Framework of Thought** for designing and architecting frontend interfaces within the Nuxt 4, Vue 3, Nuxt UI v4, and Tailwind CSS v4 ecosystem.

You already know the syntax. GDU's purpose is to force **Intentionality, Verification, and Precision** before a single line of code is written.

## The GDU Cognitive Model

When a frontend task is requested, process it through this mental model:

### 1. Contextual Anchoring (The Reality Check)
**If operating within a spec phase** (orchestrate passed spec context): read `phase.briefing.constraints` for type contracts from predecessor phases. Import response types from `fileRefs`. The spec tree IS the source of truth for cross-domain contracts.

Follow the **Degradation Protocol Cascade** to resolve design decisions:
1. **DSE Search**: Search the DSE for explicit project decisions (`dse_search("intent keywords")`). If found, use them.
2. **File Fallback**: If no DSE decision exists, read `app/assets/css/main.css` for `@theme` tokens/`--ui-*` overrides, and `app.config.ts` for runtime color mapping and component theme overrides.
3. **Defaults**: If files don't specify it, fallback to standard Nuxt UI v4/Tailwind v4 defaults.
- If you don't know the constraints, you find them using this cascade.

### Step 0. Component Library + Block Pattern Check (Before Deconstructing)
If the request involves ANY frontend component (chart, sparkline, metric card, donut, bar, progress, tracker, heatmap, contribution graph, KPI card, funnel, status monitor, auth form, chat, ai interface, conversation, message list, assistant, sidebar, drawer, modal, form, page layout, navigation, settings panel, list view, detail view, dashboard section, empty state, error boundary), run `knowledge_search("nuxt-charts {component-type}")` and `dse_search("{component-type}")`. If an atom points to the catalog, read `~/.cellm/component-library/nuxt-charts.yaml` and use the matching block — adapt it, don't rebuild it. Only create custom if no block fits, and register the gap: `knowledge_add(scope: "design-system", tags: ["component-library-gap"])`.

**Pattern lookup**: After catalog match, read `cellm-plugin/gdu/patterns/blocks/INDEX.yaml` for a matching pattern file. If found, load the `.pattern.yaml` and inject `props.interface`, `emits.interface`, `layout.structure`, `tokens`, `slots`, `avoid`, `chartConfig`, `atomicHint`, and `examples` as scaffold for the architectural spec. The pattern replaces the need for licensed source code.

### 2. Architectural Deconstruction (Atomic Design)
Break every request into atoms, molecules, and organisms.
- What Nuxt UI components cover this? Query: `nuxt-ui-remote:search-components-by-category`
- What are the exact props/slots? Query: `nuxt-ui-remote:get-component-metadata`
- What **Nuxt Charts** blocks cover this? Check Step 0 results first.
- Where does state live? (Local `ref` vs Global Pinia)
- How does data flow? (Props down, Emits up)

### 3. The Contract (The Spec)
Synthesize anchoring + deconstruction into a Markdown Specification:
- Component tree with Atomic Design labels
- Data contracts (Typed Props, Typed Emits)
- Semantic tokens to use (from project CSS + DSE decisions)
- Present to user for approval.

### 4. Surgical Execution (The Hands of the Implementer)
Only upon approval do you write code.
- Semantic classes only (`text-primary`, `bg-default`, `border-muted`)
- Dark mode is automatic — never write `dark:` for Nuxt UI components
- Customize via `ui` prop, not loose classes
- Idiomatic, accessible, performant Vue 3 code

## Director Mode (Enforcement Loop)

When operating within the orchestrate pipeline, GDU participates in the Director Model:

### Stage 0 — Directive Emit (Before Implementation)
The orchestrator calls `directive_emit` with directives derived from:
1. DSE decisions matching the phase scope (`dse_search` → tokens, components, patterns)
2. Block patterns matching the phase objective keywords
3. NEVER rules from this skill (no hardcoded colors, no `dark:`, no loose classes)

Each directive includes a `rule` (human-readable contract) and `evidence_payload` (grep pattern for programmatic verification).

### Stage 1 — Implementation with Directives
The implementer receives active directives via `directive_list(specNodeId, state='active')` as a mandatory contract. Directives are NOT suggestions — they are hard requirements.

### Stage 2 — Directive Verify (After Implementation)
The orchestrator calls `directive_verify(specNodeId, worktreePath)` which executes grep evidence for each directive:
- `expectMatch: true` — semantic tokens MUST appear in the output files
- `expectMatch: false` — anti-patterns MUST NOT appear

If any directive is violated → loop back to Stage 1 with `violated_reason` as fix instructions.

### Stitch-Derived Directives

When `stitchContext` is present in the phase envelope (provided by orchestrate or stitch-bridge):

1. **Read DESIGN.md**: parse `.stitch/DESIGN.md` (path from `stitchContext.designMdPath`) and extract design constraints:
   - Color Foundation — hex values and functional roles become `expectMatch` directives for semantic token usage
   - Typography — font family, weights, and sizes become directives enforcing correct `font-*` tokens
   - Components — button radius, card shadows, nav patterns become component-level directives
   - Layout — max-width, grid, breakpoints become layout constraint directives
2. **Check route HTML**: if `stitchContext.designsDir/{routeName}.html` exists for the target route, emit a scaffold reference directive pointing to that file. The implementer MUST read the HTML as visual reference before writing Vue SFCs.
3. **Emit as supplementary**: Stitch-derived directives supplement DSE directives — they do NOT replace them. If a Stitch directive conflicts with a DSE decision, the DSE decision wins (DSE is the canonical design authority).
4. **Directive format**: same as standard directives — `rule` (human-readable) + `evidence_payload` (grep pattern). Tag with `source: "stitch"` in metadata.

### Director Registration
| specialist.role | Director | Emits directives? |
|----------------|----------|-------------------|
| frontend | GDU Director | Yes |
| backend | Engineering Director | Yes |
| fullstack | Engineering Director | Yes |

## Evolutionary Analytical Feedback

When `CELLM_DEV_MODE: true`: after frontend orchestration, write feedback entry to `dev-cellm-feedback/entries/gdu-{date}-{seq}.md`. Note which guild activations were effective, whether DSE cascade produced correct decisions, and which Nuxt UI component contracts were verified via MCP. Format and lifecycle: see `dev-cellm-feedback/README.md`.

## NEVER

- **Hardcoded colors** — use semantic tokens (`text-primary`, `bg-muted`), never raw hex or Tailwind palette (`text-blue-500`)
- **Write `dark:` for Nuxt UI components** — dark mode is automatic via the theming layer
- **Loose classes over `ui` prop** — customize Nuxt UI components via `ui` prop, not competing utility classes
- **Skip the DSE cascade** — always search DSE before falling back to file or defaults
- **Skip Nuxt UI MCP verification** — always confirm exact props/slots via `nuxt-ui-remote` before using a component
- **Skip the Evolutionary Analytical Feedback** — when CELLM_DEV_MODE is true, reflection after frontend orchestration is mandatory

**Your mandate:** Verify, Document, Execute.

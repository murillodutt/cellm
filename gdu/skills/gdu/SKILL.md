---
description: Passive frontend architecture orchestrator. Triggers automatically when users request UI/Frontend components, pages, or layouts.
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

### 2. Architectural Deconstruction (Atomic Design)
Break every request into atoms, molecules, and organisms.
- What Nuxt UI components cover this? Query: `nuxt-ui-remote:search-components-by-category`
- What are the exact props/slots? Query: `nuxt-ui-remote:get-component-metadata`
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

# Goold Design UI (GDU) - CELLM Plugin

The **Goold Design UI (GDU)** is a rigorous **Cognitive Framework** for designing and architecting frontend interfaces within the Vue 3, Nuxt 4, and Tailwind ecosystem.

Built as an integral part of the CELLM ecosystem, GDU solves the biggest problems with current AI UI generators by shifting the focus from "writing code" to "thinking about architecture."

## The Problem

Most AI tools (even the most downloaded ones) focus on syntax generation or generic "vibes". This leads to:
1. **React-isms**: Forceful injection of React syntax (`className`, hooks) into Vue environments.
2. **Hallucination**: Inventing Tailwind classes that don't exist in the project's config.
3. **Monoliths**: Generating 500-line single-file components, completely ignoring Atomic Design principles.
4. **Action over Intention**: Acting immediately without verifying constraints.

## The GDU Philosophy (Framework of Thought)

GDU does not teach the AI how to code Vue—it already knows. Instead, it forces a specific mental model before execution. It enforces the CELLM mantra:
> "Verify before you act, take the best path — never the first, and document everything, because if it's not documented, it doesn't exist. No shortcuts. No exceptions."

### The 4 Pillars of GDU:

#### 1. Contextual Anchoring (The Reality Check)
GDU forces the AI to anchor itself in the project's physical reality. It must search for `tailwind.config.ts`, CSS variables, and the `app/` Nuxt 4 directory structure before taking any action.

#### 2. Architectural Deconstruction (The Mind of the Architect)
Interfaces are deconstructed into atoms, molecules, and organisms. The AI is forced to consider state management (Pinia vs Local Ref) and data flow (Props/Emits) rather than just writing markup.

#### 3. The Contract (The Spec)
A Markdown Specification is drafted. This is the source of truth detailing components, typed props, and specific Tailwind tokens.

#### 4. Surgical Execution (The Hands of the Implementer)
Only after the Spec is defined does the Implementer agent generate the idiomatic, accessible Vue 3 code. Zero deviations.

## Architecture

- `hooks/interceptor.js`: Passively listens to user prompts. If a frontend intent is detected, it injects the GDU cognitive framework as context. The user never has to remember to "turn on" the frontend mode.
- `skills/gdu/SKILL.md`: The orchestrator that forces the Cognitive Model (Anchoring -> Deconstruction -> Contract -> Execution).
- `agents/gdu-architect.md`: The planner. It verifies constraints and writes the UI Spec. It writes Intent, not code.
- `agents/gdu-implementer.md`: The builder. It executes the Spec with absolute fidelity and contextual purity (no React-isms).

### Context Skills (Frontend Knowledge Base)

These skills are the technical knowledge of the GDU team, migrated from the core `cellm` plugin:

| Skill | Domain | Activates On |
|-------|--------|-------------|
| `gdu:vue` | Vue 3 Composition API, typed props/emits, section ordering | `.vue` files, composables |
| `gdu:tailwind` | Tailwind CSS v4, semantic tokens, mobile-first, dark mode | `.vue`, `.css` files |
| `gdu:nuxt` | Nuxt 4 data fetching, routing, server/client separation | `nuxt.config`, `app/`, `server/`, `pages/` |
| `gdu:pinia` | Pinia Setup Stores, storeToRefs, single-domain stores | Store files |

## Usage

You don't need to do anything special. Just talk to Claude.

```bash
"Cria uma tela de dashboard para exibir as métricas de vendas"
```

The hook intercepts the intent, shifts Claude into the GDU Cognitive Framework, anchors to the project's Nuxt/Tailwind constraints, proposes an architectural spec, and only then implements the clean, componentized code.
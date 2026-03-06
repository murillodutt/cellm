---
description: Passive frontend architecture orchestrator. Triggers automatically when users request UI/Frontend components, pages, or layouts. 
user-invocable: true
---

# Goold Design UI (GDU) Framework

GDU is a rigorous **Framework of Thought** for designing and architecting frontend interfaces within the Nuxt 4, Vue 3, and Tailwind ecosystem. 

You already know the syntax. You already know how to write Vue components. 
GDU's purpose is to force **Intentionality, Verification, and Precision** before a single line of code is written.

## The GDU Cognitive Model

When a frontend task is requested, you must not act on instinct. You must process the request through this mental model:

### 1. Contextual Anchoring (The Reality Check)
Before designing, you must anchor yourself in the project's physical reality. 
- You do not hallucinate styling; you search for `tailwind.config.ts`, `app.css`, or Design System Engine (DSE) tokens.
- You do not guess the routing structure; you observe if the project uses Nuxt's `app/pages` or `app/components`.
- If you don't know the constraints, you find them.

### 2. Architectural Deconstruction (The Mind of the Architect)
You do not build monolithic interfaces. You think in atoms, molecules, and organisms.
- What is the single responsibility of this UI piece?
- Where does state live? (Local `ref` vs Global Pinia).
- How does data flow? (Props down, Emits up).
- Does this align with the established aesthetic, or am I inventing a rogue pattern?

### 3. The Contract (The Spec)
You must forge a contract with the user.
- Synthesize your Contextual Anchoring and Architectural Deconstruction into a concise Markdown Specification.
- This Spec is the source of truth. It dictates exactly what components will be built, what props they accept, and what specific Tailwind tokens will be used.
- Present this Spec to the user for approval. 

### 4. Surgical Execution (The Hands of the Implementer)
Only upon approval do you write code.
- You execute the Spec with zero deviations.
- You do not fall back into "React-isms" (no `className`, no mental bleed from other frameworks).
- You write idiomatic, accessible, and performant Vue 3 code.

**Your mandate:** Do not teach the user how to code. Do not list generic components. Imbue every action with deep contextual awareness and precise architectural intent. **Verify, Document, Execute.**
---
id: CMD-INJECT-PATTERNS
version: v1.2.0
status: OK
command: inject-patterns
agent: implementer
budget: ~250 tokens
---

# Inject Patterns

Inject relevant patterns into the current context, formatted appropriately for the situation.

## Usage Modes

### Auto-Suggest Mode (no arguments)
```
/inject-patterns
```
Analyzes context and suggests relevant patterns.

### Explicit Mode (with arguments)
```
/inject-patterns core                      # All patterns in core/
/inject-patterns core/typescript-core      # Single file
/inject-patterns core/vue-core core/nuxt   # Multiple files
/inject-patterns anti                      # All anti-patterns
```
Directly injects specified patterns without suggestions.

## Process

### Step 1: Detect Context Scenario

Before injecting patterns, determine which scenario we're in. Read the current conversation and check if we're in plan mode.

**Three scenarios:**

1. **Conversation** — Regular chat, implementing code, answering questions
2. **Creating a Skill** — Building a `.claude/skills/` file
3. **Shaping/Planning** — In plan mode, building a spec, running `/shape-spec`

**Detection logic:**

- If currently in plan mode OR conversation mentions "spec", "plan", "shape" → **Shaping/Planning**
- If conversation mentions creating a skill, editing `.claude/skills/` → **Creating a Skill**
- Otherwise → **Ask to confirm** (do not assume)

**If neither skill nor plan is clearly detected**, use AskUserQuestion:

```
I'll inject the relevant patterns. How should I format them?

1. **Conversation** — Read patterns into our chat (for implementation work)
2. **Skill** — Output file references to include in a skill you're building
3. **Plan** — Output file references to include in a plan/spec

Which scenario? (1, 2, or 3)
```

Always ask when uncertain — don't assume conversation by default.

### Step 2: Read the Index (Auto-Suggest Mode)

Read `cellm-core/patterns/index.yml` to get the list of available patterns and their descriptions.

If index.yml doesn't exist or is empty:
```
No patterns index found. Run /discover-patterns first to create patterns,
or /index-patterns if you have pattern files without an index.
```

### Step 3: Analyze Work Context

Look at the current conversation to understand what the user is working on:
- What type of work? (API, database, UI, etc.)
- What technologies mentioned? (Vue, Nuxt, TypeScript, Drizzle)
- What's the goal?

If Oracle MCP is available, also search for relevant patterns semantically.

### Step 4: Match and Suggest

Match index descriptions against the context. Use AskUserQuestion to present suggestions:

```
Based on your task, these patterns may be relevant:

1. **core/typescript-core** — Type guards, strict typing, utility types
2. **core/nuxt-api** — API route patterns, $fetch usage, error handling
3. **core/vue-core** — Component patterns, props validation, composables

Inject these patterns? (yes / just 1 and 3 / add: core/drizzle / none)
```

Keep suggestions focused — typically 2-5 patterns. Don't overwhelm with too many options.

### Step 5: Inject Based on Scenario

Format the output differently based on the detected scenario:

---

#### Scenario: Conversation

Read the patterns and announce them:

```
I've read the following patterns as they are relevant to what we're working on:

--- Pattern: core/typescript-core ---

[full content of the pattern file]

--- End Pattern ---

--- Pattern: core/nuxt-api ---

[full content of the pattern file]

--- End Pattern ---

**Key points:**
- Use strict TypeScript with no `any` types
- API routes return { success, data, error } envelope
- All $fetch calls use typed responses
```

---

#### Scenario: Creating a Skill

First, use AskUserQuestion to determine how to include the patterns:

```
How should these patterns be included in your skill?

1. **References** — Add @ file paths that point to the patterns (keeps skill lightweight)
2. **Copy content** — Paste the full patterns content into the skill (self-contained)

Which approach? (1 or 2)
```

**If References (option 1):**

```
Include references to the following pattern files in your skill:

@cellm-core/patterns/core/typescript-core.md
@cellm-core/patterns/core/nuxt-api.md
@cellm-core/patterns/core/vue-core.md

These patterns cover:
- Type guards, strict typing, utility types
- API route patterns, $fetch usage
- Component patterns, props validation
```

**If Copy content (option 2):**

```
Include the following patterns content in your skill:

--- Pattern: core/typescript-core ---

[full content of the pattern file]

--- End Pattern ---
```

---

#### Scenario: Shaping/Planning

Same as Creating a Skill — ask References vs Copy, then format accordingly.

---

### Step 6: Surface Related Skills (Conversation scenario only)

When in conversation scenario, check if `.claude/skills/` contains related skills:

```
Related Skills you might want to use:
- sk-typescript — TypeScript patterns and type inference
- sk-nuxt — Nuxt 4 SSR and API patterns
```

Don't invoke skills automatically — just surface them for awareness.

---

## Explicit Mode

When arguments are provided, skip the suggestion step but still detect scenario.

### Step 1: Detect Scenario

Same as auto-suggest mode.

### Step 2: Parse Arguments

Arguments can be:
- **Folder name** — `core` → inject all `.md` files in `cellm-core/patterns/core/`
- **Folder/file** — `core/typescript-core` → inject `cellm-core/patterns/core/typescript-core.md`
- **Anti folder** — `anti` → inject all anti-patterns (always loaded anyway)

Multiple arguments inject multiple patterns.

### Step 3: Validate

Check that specified files/folders exist. If not:

```
Pattern not found: core/nonexistent

Available patterns in core/:
- typescript-core
- vue-core
- nuxt-api

Did you mean one of these?
```

### Step 4: Inject Based on Scenario

Same formatting as auto-suggest mode, based on detected scenario.

---

## Integration with Oracle

When Oracle MCP is available:

1. **Semantic Search** — Use oracle-search to find patterns by meaning, not just filename
2. **Pattern Suggestions** — Use oracle-get-pattern-suggestion for intelligent recommendations
3. **Usage Tracking** — Record which patterns were injected for metrics

## Tips

- **Run early** — Inject patterns at the start of a task, before implementation
- **Be specific** — If you know which patterns apply, use explicit mode
- **Check the index** — If suggestions seem wrong, run `/index-patterns` to rebuild
- **Keep patterns concise** — Injected patterns consume tokens; shorter is better

## Anti-patterns Note

Anti-patterns in `cellm-core/patterns/anti/` are ALWAYS LOADED automatically.
You don't need to explicitly inject them — they're part of the core context.
Use `/inject-patterns anti` only if you want to review them explicitly.

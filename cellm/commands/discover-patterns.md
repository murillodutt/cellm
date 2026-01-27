---
id: CMD-DISCOVER-PATTERNS
version: v1.2.0
status: OK
command: discover-patterns
agent: architect
budget: ~300 tokens
---

# Discover Patterns

Extract tribal knowledge from your codebase into documented patterns.

## Important Guidelines

- **Always use AskUserQuestion tool** when asking the user anything
- **Write concise patterns** — Use minimal words. Patterns must be scannable by AI agents without bloating context windows.
- **Offer suggestions** — Present options the user can confirm, choose between, or correct.

## Process

### Step 1: Determine Focus Area

Check if the user specified an area when running this command. If they did, skip to Step 2.

If no area was specified:

1. Analyze the codebase structure (folders, file types, patterns)
2. Identify 3-5 major areas. Examples:
   - **Frontend areas:** Vue components, composables, Nuxt pages, layouts
   - **Backend areas:** API routes, server utils, database schema, middleware
   - **Cross-cutting:** Error handling, validation, TypeScript types, naming conventions
3. Use AskUserQuestion to present the areas:

```
I've identified these areas in your codebase:

1. **Vue Components** (components/) — UI patterns, props, slots
2. **API Routes** (server/api/) — Request handling, response formats
3. **Database** (server/db/) — Drizzle schema, queries
4. **Composables** (composables/) — Shared logic, state patterns

Which area should we focus on for discovering patterns? (Pick one, or suggest a different area)
```

Wait for user response before proceeding.

### Step 2: Analyze & Present Findings

Once an area is determined:

1. Read key files in that area (5-10 representative files)
2. Look for patterns that are:
   - **Unusual or unconventional** — Not standard framework/library patterns
   - **Opinionated** — Specific choices that could have gone differently
   - **Tribal** — Things a new developer wouldn't know without being told
   - **Consistent** — Patterns repeated across multiple files

3. Use AskUserQuestion to present findings and let user select:

```
I analyzed [area] and found these potential patterns worth documenting:

1. **Response Envelope** — All API responses use { success, data, error } structure
2. **Error Codes** — Custom error codes like AUTH_001, DB_002 with specific meanings
3. **Composable Naming** — All composables prefixed with "use" and return reactive refs

Which would you like to document?

Options:
- "Yes, all of them"
- "Just 1 and 3"
- "Add: [your suggestion]"
- "Skip this area"
```

Wait for user selection before proceeding.

### Step 3: Ask Why, Then Draft Each Pattern

**IMPORTANT:** For each selected pattern, complete this full loop before moving to the next:

1. **Ask 1-2 clarifying questions** about the "why" behind the pattern
2. **Wait for user response**
3. **Draft the pattern** incorporating their answer
4. **Confirm with user** before creating the file
5. **Create the file** if approved

Example questions to ask:

- "What problem does this pattern solve? Why not use the default approach?"
- "Are there exceptions where this pattern shouldn't be used?"
- "What's the most common mistake a developer or agent makes with this?"

**Do NOT batch all questions upfront.** Process one pattern at a time.

### Step 4: Create the Pattern File

For each pattern (after completing Step 3's Q&A):

1. Determine the appropriate category folder:
   - `core/` — TypeScript, Vue, Nuxt, Tailwind patterns
   - `anti/` — Anti-patterns (things to avoid)

2. Check if a related pattern file already exists — append to it if so

3. Draft the content and use AskUserQuestion to confirm:

```
Here's the draft for core/api-response.md:

---
# API Response Format

All API responses use this envelope:

\`\`\`json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
\`\`\`

- Never return raw data without the envelope
- Error responses must include both code and message
- Success responses omit the error field entirely
---

Create this file? (yes / edit: [your changes] / skip)
```

4. Create or update the file in `cellm-core/patterns/[category]/`
5. **Then repeat Steps 3-4 for the next selected pattern**

### Step 5: Update the Index

After all patterns are created:

1. Read existing `cellm-core/patterns/index.yml` (create if doesn't exist)
2. For each new file without an index entry, use AskUserQuestion:

```
New pattern needs an index entry:
  File: core/api-response.md

Suggested description: "API response envelope structure and error format"

Accept this description? (yes / or type a better one)
```

3. Update `cellm-core/patterns/index.yml`:

```yaml
core:
  api-response:
    description: API response envelope structure and error format
```

Alphabetize by folder, then by filename.

### Step 6: Record to Oracle (if available)

If Oracle MCP is available:

1. For each new pattern, create an observation:
   - Type: `pattern`
   - Content: Pattern summary
   - Tags: category, technology

2. This enables semantic search and pattern suggestions later

### Step 7: Offer to Continue

Use AskUserQuestion:

```
Patterns created for [area]:
- core/api-response.md
- core/error-codes.md

Would you like to discover patterns in another area, or are we done?
```

## Output Location

All patterns: `cellm-core/patterns/[category]/[pattern].md`
Index file: `cellm-core/patterns/index.yml`

## Writing Concise Patterns

Patterns will be injected into AI context windows. Every word costs tokens. Follow these rules:

- **Lead with the rule** — State what to do first, explain why second (if needed)
- **Use code examples** — Show, don't tell
- **Skip the obvious** — Don't document what the code already makes clear
- **One pattern per concept** — Don't combine unrelated patterns
- **Bullet points over paragraphs** — Scannable beats readable

**Good:**
```markdown
# Error Responses

Use error codes: `AUTH_001`, `DB_001`, `VAL_001`

\`\`\`json
{ "success": false, "error": { "code": "AUTH_001", "message": "..." } }
\`\`\`

- Always include both code and message
- Log full error server-side, return safe message to client
```

**Bad:**
```markdown
# Error Handling Guidelines

When an error occurs in our application, we have established a consistent pattern for how errors should be formatted and returned to the client. This helps maintain consistency across our API...
[continues for 3 more paragraphs]
```

## Integration with CELLM

This command integrates with:

- **cellm-core/patterns/** — Pattern storage location
- **Oracle** — Semantic memory for pattern suggestions
- **/inject-patterns** — Uses discovered patterns for context injection
- **/index-patterns** — Rebuilds index after discovery

## Tips

- Run this command when onboarding to a new codebase
- Focus on one area at a time for better quality
- Discovered patterns become available for /inject-patterns immediately
- Anti-patterns go in `anti/` folder and are always-loaded as warnings

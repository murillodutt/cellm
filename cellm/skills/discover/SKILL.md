---
name: discover
description: Extract tribal knowledge from your codebase into documented patterns. Analyzes code for unusual, opinionated, or tribal conventions and writes them as concise, scannable pattern files.
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

Scan the codebase for **tribal knowledge** — conventions that are unusual, opinionated, or invisible to newcomers — and write them as concise pattern files in `cellm-core/patterns/`.

## Step 1: Determine Focus Area

If the user specified an area, skip to Step 2. Otherwise:

1. Analyze codebase structure (folders, file types, conventions)
2. Identify 3-5 major areas (frontend, backend, cross-cutting)
3. Present areas via AskUserQuestion — wait for selection before proceeding

## Step 2: Analyze & Present Findings

1. Read 5-10 representative files in the area
2. Look for patterns that are **unusual**, **opinionated**, **tribal** (invisible to newcomers), or **consistently repeated**
3. Present findings via AskUserQuestion — let user select which to document

## Step 3: Ask Why, Then Draft (one pattern at a time)

For each selected pattern, complete this loop before moving to the next:

1. Ask 1-2 clarifying questions about the **"why"**
2. Wait for response
3. Draft the pattern incorporating their answer
4. Confirm via AskUserQuestion before creating the file

**Process one pattern at a time.** Do NOT batch all questions upfront.

## Step 4: Create Pattern File

1. Category: `core/` (TypeScript, Vue, Nuxt, Tailwind) or `anti/` (things to avoid)
2. Check if related pattern exists — **append** to it if so
3. Create or update in `cellm-core/patterns/[category]/`

## Step 5: Update Index

Update `cellm-core/patterns/index.yml` — alphabetize by folder, then filename. Propose descriptions via AskUserQuestion.

## Step 6: Record to Oracle

If Oracle MCP available, create observation (type: `pattern`) for each new pattern.

## Step 7: Offer to Continue

Ask if the user wants to discover patterns in another area.

## Writing Rules

- **Lead with the rule** — what to do first, why second
- **Code examples** — show, don't tell
- **Skip the obvious** — don't document what code makes clear
- **One concept per pattern** — don't combine unrelated patterns
- **Bullets over paragraphs** — scannable beats readable

## NEVER

- **Batch questions** — one pattern at a time, full loop before next
- **Create duplicate patterns** — always check existing files first
- **Write verbose patterns** — every word costs tokens in AI context windows
- **Skip the "why"** — tribal knowledge without rationale is just arbitrary rules

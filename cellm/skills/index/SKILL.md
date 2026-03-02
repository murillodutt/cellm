---
description: Rebuild and maintain the patterns index file (index.yml). Scans cellm-core/patterns/ for new, deleted, or changed files and updates the index with one-line descriptions.
user-invocable: true
argument-hint: "[search query]"
allowed-tools: Read, Grep, Glob, Write, Edit, AskUserQuestion
---

Rebuild `cellm-core/patterns/index.yml`. Enables `/cellm:inject` to suggest patterns without reading all files.

## Process

1. **Scan** — List all `.md` in `cellm-core/patterns/` and subfolders.
2. **Compare** — Load existing `index.yml`. Identify new files, deleted entries, unchanged.
3. **New files** — Read content, propose one-sentence description via AskUserQuestion.
4. **Stale entries** — List for user, remove automatically.
5. **Write** — Alphabetize by category, then filename. Names without `.md` extension.
6. **Report** — `[+] added, [-] removed, [=] unchanged, Total: N indexed`.

## NEVER

- **Multi-sentence descriptions** — one short sentence for matching, not documentation
- **Skip stale cleanup** — always remove entries for deleted files
- **Forget alphabetization** — categories and files both alphabetized

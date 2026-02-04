---
description: Garbage collection for resolved gaps, stale evidence, and redundant content
argument-hint: "[docRoot] [--dry-run]"
---

# DocOps GC (Garbage Collection)

## Goal
Clean up resolved gaps, consolidate redundant content, and maintain documentation hygiene.

## Rules
- **ALWAYS** run with `--dry-run` first to preview changes.
- **NEVER** remove unresolved gaps.
- Consolidate, don't delete information (merge duplicates).
- Preserve audit trail in `conveyor-gaps.md`.

## Steps

1) Resolve config
- Read `.claude/docops.json` or use defaults.

2) Clean resolved gaps
- Read `reference/conveyor-gaps.md`.
- Identify GAPS with `Action: done` or `Action: resolved`.
- Identify CONFLICTS with `Action: done` or `Action: resolved`.
- Move resolved items to `## Resolved (Archive)` section.
- Keep only last 20 resolved items for audit trail.

3) Validate evidence freshness
- Scan `reference/code-evidence/*.md`.
- Check `last_verified` or file modification date.
- Flag evidence older than 30 days as `stale`.
- Add stale evidence to gaps as `GAP-XXX: Stale evidence`.

4) Detect redundant content
- Compare section headings across SPEC files.
- Identify files with >70% similar content (by heading structure).
- Flag as candidates for consolidation.
- Do NOT auto-merge; report for manual review.

5) Fix reference integrity
- Scan all internal links in markdown files.
- Update links pointing to moved/archived files.
- Remove links to deleted files.
- Report broken external links (URLs returning 404).

6) Update indexes
- Regenerate `index.md` file list if files were removed.
- Update `glossary.md` if terms were deprecated.
- Update `project-conveyor.md` section 8 (Risks & Known Gaps).

7) Preview changes (dry-run)
- Resolved gaps to archive: N
- Stale evidence flagged: N
- Redundant content detected: N pairs
- Broken links fixed: N
- Index entries updated: N

8) Execute GC
- Archive resolved gaps.
- Add stale evidence warnings.
- Fix broken links.
- Update indexes.

9) Report summary
```
[+] GC completed
    Gaps archived: N
    Stale evidence flagged: N
    Links fixed: N
    Redundancies detected: N (manual review needed)
```

## Output
- Clean `conveyor-gaps.md` with only active gaps.
- Evidence files flagged with freshness status.
- All internal links validated and fixed.
- Report of redundancies for manual consolidation.

## Resolved Gaps Archive Format

```markdown
## Resolved (Archive)

| ID | Description | Resolved Date | Resolution |
|---|---|---|---|
| GAP-001 | Missing auth docs | 2026-02-01 | Added auth.spec.md |
```

## Stale Evidence Warning Format

```markdown
---
status: stale
last_verified: 2025-12-15
stale_since: 2026-02-03
---
```

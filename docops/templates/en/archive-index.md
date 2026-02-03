# Archive Index

This directory contains archived documentation that has been deprecated and removed from active use.

## Metadata
- Last updated: YYYY-MM-DD
- Total archived: N files
- Retention policy: 90 days minimum

## How to Restore

To restore an archived document:
```
/docops:restore <archive-path>
```

Example:
```
/docops:restore 2026-02/auth.spec.md
```

## Archive Contents

### YYYY-MM

| File | Original Location | Archived On | Reason | Replacement |
|------|-------------------|-------------|--------|-------------|
| example.spec.md | specs/example.spec.md | YYYY-MM-DD | Reason | [replacement](path) |

## Retention Policy

- **Minimum retention:** 90 days
- **Hard delete:** Only via explicit `/docops:prune --delete-archived`
- **ADRs:** Never archived (permanent record)

## Notes

- Archived files retain original frontmatter plus archive metadata
- References to archived files are marked with `[ARCHIVED]`
- Restoration is always possible while file exists in archive

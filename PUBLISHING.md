# Publishing Checklist (External Distribution)

This checklist prepares a clean external artifact. It does not publish to NPM.

## Preconditions

- Block A complete (foundation + decontamination).
- `cellm:oracle` rename completed and references updated.
- Version bumped consistently across manifests.

## Scope Filter Contract (fail-closed)

Every `SKILL.md` file inside `**/skills/*/SKILL.md` **MUST** declare a
`cellm_scope` frontmatter field with exactly one of these values:

| Value | Effect on external tarball |
|-------|---------------------------|
| `universal` | Shipped to external consumers. Default intent for generic skills. |
| `internal` | Stripped by `scripts/build-external-tarball.sh`. Reserved for cellm-private maintenance tools (`convergir`, `stack-update`). |
| `dev` | Stripped by `scripts/build-external-tarball.sh`. Reserved for author-only telemetry and dev-mode workflows. |

**Enforcement is fail-closed**: any SKILL.md missing `cellm_scope` or carrying
an unknown value causes `build-external-tarball.sh` to abort with a list of
offending files. There is no silent "default to universal" path.

Field format tolerance (normalized before comparison):
- Case-insensitive: `Cellm_Scope: UNIVERSAL` is valid.
- Whitespace: leading/trailing spaces around field name and value are allowed.
- Quotes: `cellm_scope: "universal"` and `cellm_scope: 'internal'` are valid.

Any new skill added to the plugin MUST declare its scope. Reviewers of
new-skill PRs are expected to confirm the scope decision is conscious,
not accidental.

## Automated checks

Run from `cellm-plugin/`:

```bash
bash scripts/build-external-tarball.sh --dry-run
```

Expected:
- Manifest generated at `dist/external-manifest-<version>.txt`
- No matches for internal/dev residue
- Staged size is reasonable

## Manual checks

1. Review manifest file for accidental internal content.
2. Confirm `convergir` and `stack-update` are excluded from external package.
3. Confirm new bootstrap skill is included in external manifest.
4. Confirm no references to `dev-cellm-feedback` or private partnership letter.
5. Validate plugin metadata versions (`plugin.json` files + `marketplace.json`).
6. Test install in a fresh external worktree.

## Build artifact

When ready to package:

```bash
bash scripts/build-external-tarball.sh
```

Output:
- `dist/cellm-plugin-external-<version>.tar.gz`

## Rollback

If any check fails:
1. Stop packaging.
2. Revert only offending changes in the current branch.
3. Re-run dry-run and re-check manifest.
4. Continue only when residue checks are clean.

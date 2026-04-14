# Publishing Checklist (External Distribution)

This checklist prepares a clean external artifact. It does not publish to NPM.

## Preconditions

- Block A complete (foundation + decontamination).
- `cellm:oracle` rename completed and references updated.
- Version bumped consistently across manifests.

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

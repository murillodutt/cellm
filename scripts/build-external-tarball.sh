#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/dist"
VERSION="$(python3 - "${ROOT_DIR}" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1]) / 'cellm/.claude-plugin/plugin.json'
print(json.loads(p.read_text())['version'])
PY
)"
PKG_NAME="cellm-plugin-external-${VERSION}"
TARBALL="${OUT_DIR}/${PKG_NAME}.tar.gz"
DRY_RUN=false

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

mkdir -p "${OUT_DIR}"
WORK_DIR="$(mktemp -d)"
STAGE_DIR="${WORK_DIR}/${PKG_NAME}"
cp -R "${ROOT_DIR}" "${STAGE_DIR}"

rm -rf "${STAGE_DIR}/.git" "${STAGE_DIR}/dist" "${STAGE_DIR}/node_modules" 2>/dev/null || true
find "${STAGE_DIR}" -name ".DS_Store" -delete

# Remove known internal sample artifacts
rm -rf "${STAGE_DIR}/cellm/skills/execute/execute-workspace" 2>/dev/null || true

python3 - "${STAGE_DIR}" <<'PY'
from pathlib import Path
import re, shutil, sys
stage = Path(sys.argv[1])

# Fail-closed scope filter: any SKILL.md missing cellm_scope is a hard error.
# Variants (case, whitespace, trailing spaces) are normalized before comparison.
errors = []
for skill in stage.glob('**/skills/*/SKILL.md'):
    text = skill.read_text(encoding='utf-8', errors='ignore')
    m = re.search(r'^---\n(.*?)\n---\n', text, flags=re.S)
    if not m:
        errors.append(f"{skill.relative_to(stage)}: missing frontmatter (cellm_scope required)")
        continue
    fm = m.group(1)
    # Tolerant regex: case-insensitive field name, normalized whitespace, optional quotes
    scope_match = re.search(r'^\s*cellm_scope\s*:\s*["\']?(\S+?)["\']?\s*$', fm, flags=re.M | re.I)
    if not scope_match:
        errors.append(f"{skill.relative_to(stage)}: cellm_scope field absent in frontmatter")
        continue
    scope = scope_match.group(1).strip().lower()
    if scope not in {'universal', 'internal', 'dev'}:
        errors.append(f"{skill.relative_to(stage)}: unknown cellm_scope value '{scope}' (expected universal|internal|dev)")
        continue
    if scope in {'internal', 'dev'}:
        shutil.rmtree(skill.parent)

if errors:
    print("[!] Scope filter refused to ship — fail-closed enforcement:", file=sys.stderr)
    for e in errors:
        print(f"    - {e}", file=sys.stderr)
    sys.exit(1)

# Remove private partnership letter from external bundle when present
for letter in stage.glob('**/CELLM-PARTNERSHIP-LETTER.md'):
    letter.unlink()
PY

# Guard 1: no internal/dev scoped skill should remain (tolerant regex)
if rg -in "^\s*cellm_scope\s*:\s*[\"']?(internal|dev)[\"']?\s*$" "${STAGE_DIR}" --glob '**/skills/*/SKILL.md' >/dev/null; then
  echo "[!] Internal/dev scoped skills still present in staged package"
  rg -in "^\s*cellm_scope\s*:\s*[\"']?(internal|dev)[\"']?\s*$" "${STAGE_DIR}" --glob '**/skills/*/SKILL.md' || true
  exit 1
fi

# Guard 2: no dev feedback residue in shipped skills
if rg -n "dev-cellm-feedback/entries/" "${STAGE_DIR}" --glob '**/skills/**' >/dev/null; then
  echo "[!] dev-cellm-feedback residue detected in staged skills"
  rg -n "dev-cellm-feedback/entries/" "${STAGE_DIR}" --glob '**/skills/**' || true
  exit 1
fi

# Guard 3: partnership letter file must be absent
if find "${STAGE_DIR}" -name "CELLM-PARTNERSHIP-LETTER.md" | grep -q .; then
  echo "[!] Partnership letter still present in staged package"
  find "${STAGE_DIR}" -name "CELLM-PARTNERSHIP-LETTER.md"
  exit 1
fi

MANIFEST="${OUT_DIR}/external-manifest-${VERSION}.txt"
( cd "${STAGE_DIR}" && find . -type f | sort ) > "${MANIFEST}"

SIZE_MB="$(du -sk "${STAGE_DIR}" | awk '{printf "%.2f", $1/1024}')"
echo "[+] Staged external package: ${STAGE_DIR}"
echo "[+] Manifest: ${MANIFEST}"
echo "[+] Staged size: ${SIZE_MB} MB"

if [[ "${DRY_RUN}" == "true" ]]; then
  echo "[+] Dry-run mode: tarball not created"
  rm -rf "${WORK_DIR}"
  exit 0
fi

( cd "${WORK_DIR}" && tar -czf "${TARBALL}" "${PKG_NAME}" )
echo "[+] Tarball created: ${TARBALL}"
echo "[+] Tarball size: $(du -h "${TARBALL}" | awk '{print $1}')"
rm -rf "${WORK_DIR}"

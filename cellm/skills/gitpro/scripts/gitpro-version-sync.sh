#!/usr/bin/env bash
set -euo pipefail

# gitpro-version-sync.sh
# Portable fallback for version sync when cellm:bump is unavailable.
# Scope: sync/check VERSION + package.json in current repository root.

usage() {
  cat <<'USAGE'
Usage:
  gitpro-version-sync.sh --check-only [--project-root PATH]
  gitpro-version-sync.sh [patch|minor|major|X.Y.Z] [--project-root PATH]

Behavior:
  --check-only     Validate if VERSION and package.json (when present) are in sync.
  patch|minor|major|X.Y.Z
                   Compute/set next version and update VERSION + package.json.

Exit codes:
  0 = success / in sync
  1 = validation failure / unsupported state
USAGE
}

PROJECT_ROOT=""
CHECK_ONLY=false
BUMP_ARG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-root)
      PROJECT_ROOT="${2:-}"
      shift 2
      ;;
    --check-only)
      CHECK_ONLY=true
      shift
      ;;
    patch|minor|major)
      BUMP_ARG="$1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        BUMP_ARG="$1"
        shift
      else
        echo "[-] Unknown argument: $1"
        usage
        exit 1
      fi
      ;;
  esac
done

if [[ -z "$PROJECT_ROOT" ]]; then
  PROJECT_ROOT="$(pwd)"
fi

if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[-] Not a git repository: $PROJECT_ROOT"
  exit 1
fi

VERSION_FILE="$PROJECT_ROOT/VERSION"
PACKAGE_JSON="$PROJECT_ROOT/package.json"

read_version_from_package() {
  local file="$1"
  node -e "const fs=require('fs');const p=process.argv[1];const j=JSON.parse(fs.readFileSync(p,'utf8'));if(!j.version){process.exit(2)};process.stdout.write(String(j.version));" "$file"
}

write_version_to_package() {
  local file="$1"
  local version="$2"
  node -e "const fs=require('fs');const p=process.argv[1];const v=process.argv[2];const j=JSON.parse(fs.readFileSync(p,'utf8'));j.version=v;fs.writeFileSync(p,JSON.stringify(j,null,2)+'\\n');" "$file" "$version"
}

read_current_version() {
  if [[ -f "$VERSION_FILE" ]]; then
    tr -d '[:space:]' < "$VERSION_FILE"
    return 0
  fi

  if [[ -f "$PACKAGE_JSON" ]]; then
    read_version_from_package "$PACKAGE_JSON"
    return 0
  fi

  return 1
}

validate_semver() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

bump_semver() {
  local current="$1"
  local kind="$2"
  IFS='.' read -r major minor patch <<< "$current"
  case "$kind" in
    patch) patch=$((patch + 1)) ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    major) major=$((major + 1)); minor=0; patch=0 ;;
    *) echo "$kind"; return 0 ;;
  esac
  echo "$major.$minor.$patch"
}

if ! CURRENT_VERSION="$(read_current_version)"; then
  echo "[-] No VERSION or package.json found in $PROJECT_ROOT"
  exit 1
fi

if ! validate_semver "$CURRENT_VERSION"; then
  echo "[-] Current version is not valid semver: $CURRENT_VERSION"
  exit 1
fi

if $CHECK_ONLY; then
  ERR=0

  if [[ -f "$VERSION_FILE" ]]; then
    VFILE="$(tr -d '[:space:]' < "$VERSION_FILE")"
    if [[ "$VFILE" != "$CURRENT_VERSION" ]]; then
      echo "[-] VERSION mismatch: $VFILE != $CURRENT_VERSION"
      ERR=1
    fi
  fi

  if [[ -f "$PACKAGE_JSON" ]]; then
    PVER="$(read_version_from_package "$PACKAGE_JSON")"
    if [[ "$PVER" != "$CURRENT_VERSION" ]]; then
      echo "[-] package.json mismatch: $PVER != $CURRENT_VERSION"
      ERR=1
    fi
  fi

  if [[ $ERR -eq 0 ]]; then
    echo "[+] Version sync OK ($CURRENT_VERSION)"
  fi
  exit $ERR
fi

if [[ -z "$BUMP_ARG" ]]; then
  echo "[-] Missing bump argument. Use patch|minor|major|X.Y.Z or --check-only"
  exit 1
fi

if [[ "$BUMP_ARG" =~ ^(patch|minor|major)$ ]]; then
  NEXT_VERSION="$(bump_semver "$CURRENT_VERSION" "$BUMP_ARG")"
else
  NEXT_VERSION="$BUMP_ARG"
fi

if ! validate_semver "$NEXT_VERSION"; then
  echo "[-] Target version is not valid semver: $NEXT_VERSION"
  exit 1
fi

if [[ -f "$VERSION_FILE" ]]; then
  printf '%s\n' "$NEXT_VERSION" > "$VERSION_FILE"
fi

if [[ -f "$PACKAGE_JSON" ]]; then
  write_version_to_package "$PACKAGE_JSON" "$NEXT_VERSION"
fi

echo "[+] Version updated: $CURRENT_VERSION -> $NEXT_VERSION"

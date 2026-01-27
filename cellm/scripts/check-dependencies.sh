#!/bin/bash
# CELLM Oracle - Check Dependencies (pre_install hook)
# Validates that all required dependencies are available

set -euo pipefail

# Error handling
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[!] Script failed with exit code $exit_code" >&2
  fi
}

trap cleanup EXIT

# Colors for output (if terminal supports)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if a command exists
check_command() {
  local cmd="$1"
  local name="$2"
  local min_version="${3:-}"

  if command -v "${cmd}" >/dev/null 2>&1; then
    local version
    version=$("${cmd}" --version 2>/dev/null | head -1 || echo "unknown")
    echo -e "${GREEN}[+]${NC} ${name}: ${version}"
    return 0
  else
    echo -e "${RED}[-]${NC} ${name}: NOT FOUND"
    return 1
  fi
}

# Check if a directory exists and is writable
check_directory() {
  local dir="$1"
  local name="$2"

  if [[ -d "${dir}" ]] && [[ -w "${dir}" ]]; then
    echo -e "${GREEN}[+]${NC} ${name}: OK (${dir})"
    return 0
  elif [[ ! -d "${dir}" ]]; then
    # Try to create
    if mkdir -p "${dir}" 2>/dev/null; then
      echo -e "${GREEN}[+]${NC} ${name}: Created (${dir})"
      return 0
    else
      echo -e "${RED}[-]${NC} ${name}: Cannot create (${dir})"
      return 1
    fi
  else
    echo -e "${RED}[-]${NC} ${name}: Not writable (${dir})"
    return 1
  fi
}

# Main checks
main() {
  echo "CELLM Oracle - Dependency Check"
  echo "================================"
  echo ""

  local errors=0

  # Required: Bun runtime
  if ! check_command "bun" "Bun Runtime"; then
    echo -e "${YELLOW}  Install with: curl -fsSL https://bun.sh/install | bash${NC}"
    errors=$((errors + 1))
  fi

  # Required: curl for health checks
  if ! check_command "curl" "curl"; then
    echo -e "${YELLOW}  Install via your package manager${NC}"
    errors=$((errors + 1))
  fi

  # Optional: SQLite CLI (helpful for debugging)
  check_command "sqlite3" "SQLite CLI" || true

  echo ""

  # Check directories
  check_directory "${HOME}/.cellm" "CELLM data directory" || errors=$((errors + 1))

  echo ""

  # Summary
  if [[ ${errors} -eq 0 ]]; then
    echo -e "${GREEN}[+] All dependencies satisfied${NC}"
    exit 0
  else
    echo -e "${RED}[-] ${errors} dependency issue(s) found${NC}"
    echo ""
    echo "Please resolve the issues above before installing."
    exit 1
  fi
}

main "$@"

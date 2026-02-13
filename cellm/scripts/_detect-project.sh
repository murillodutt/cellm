#!/bin/bash
# CELLM Oracle - Shared project detection logic
# Sourced by all hook scripts to ensure consistent project extraction.
#
# Usage:
#   source "$(dirname "${BASH_SOURCE[0]}")/_detect-project.sh"
#   project=$(detect_project "${cwd}")
#
# Priority order:
#   1. Git repository root (ensures sub-projects like oracle/ map to parent)
#   2. CLAUDE_PROJECT_DIR env var
#   3. Project marker files (package.json, Cargo.toml, etc.)
#   4. Basename of cwd (with version-like name filtering)
#   5. "unknown" fallback

detect_project() {
  local search_dir="${1:-${PWD}}"
  local result=""

  # Priority 1: Git root (ALWAYS preferred for consistent metrics)
  if [[ -n "${search_dir}" ]] && command -v git &> /dev/null; then
    local git_root
    git_root=$(cd "${search_dir}" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null || echo "")
    if [[ -n "${git_root}" ]]; then
      echo "$(basename "${git_root}")"
      return
    fi
  fi

  # Priority 2: CLAUDE_PROJECT_DIR env var
  if [[ -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    echo "$(basename "${CLAUDE_PROJECT_DIR}")"
    return
  fi

  # Priority 3: Walk up looking for project marker files
  if [[ -n "${search_dir}" ]]; then
    local check_dir="${search_dir}"
    while [[ "${check_dir}" != "/" && "${check_dir}" != "." ]]; do
      if [[ -f "${check_dir}/package.json" ]] || \
         [[ -f "${check_dir}/Cargo.toml" ]] || \
         [[ -f "${check_dir}/go.mod" ]] || \
         [[ -f "${check_dir}/pyproject.toml" ]] || \
         [[ -d "${check_dir}/.git" ]]; then
        echo "$(basename "${check_dir}")"
        return
      fi
      check_dir=$(dirname "${check_dir}")
    done
  fi

  # Priority 4: Basename of cwd (filter version-like names)
  local base_name
  base_name=$(basename "${search_dir}")
  if [[ ! "${base_name}" =~ ^v?[0-9]+\.[0-9]+ ]]; then
    result="${base_name}"
  else
    result=$(basename "$(dirname "${search_dir}")")
  fi

  # Priority 5: Ultimate fallback
  if [[ -z "${result}" || "${result}" == "/" ]]; then
    result="unknown"
  fi

  echo "${result}"
}

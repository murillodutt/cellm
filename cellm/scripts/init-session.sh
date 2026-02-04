#!/bin/bash
# CELLM Oracle - Init Session (SessionStart hook)
# Initializes a new session in the Oracle for AI analysis
# Phase 7: Independent AI Analysis System
#
# Claude Code hooks receive data via stdin as JSON, not environment variables.
# See: https://docs.anthropic.com/en/docs/claude-code/hooks

set -euo pipefail

# Error handling
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[!] Script failed with exit code $exit_code" >&2
  fi
}

trap cleanup EXIT

# Configuration
CELLM_DIR="${HOME}/.cellm"
WORKER_JSON="${CELLM_DIR}/worker.json"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
DEFAULT_PORT=31415

# Logging
log() {
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [SessionInit] $1" >> "${LOG_FILE}" 2>/dev/null || true
}

# Get port from worker.json
get_port() {
  if [[ -f "${WORKER_JSON}" ]]; then
    local port
    port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "${WORKER_JSON}" 2>/dev/null | grep -o '[0-9]*' || echo "")
    if [[ -n "${port}" ]]; then
      echo "${port}"
      return
    fi
  fi
  echo "${DEFAULT_PORT}"
}

# Main
main() {
  local port
  port=$(get_port)
  local url="http://127.0.0.1:${port}/api/session/init"

  # Check if worker is online
  if ! curl -sf --max-time 0.3 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    log "Worker offline, skipping session init"
    exit 0
  fi

  # Read JSON from stdin (Claude Code hook format)
  local input=""
  if [[ ! -t 0 ]]; then
    input=$(cat)
  fi

  if [[ -z "${input}" ]]; then
    log "No input received"
    exit 0
  fi

  # Check if jq is available
  if ! command -v jq &> /dev/null; then
    log "jq not found, skipping"
    exit 0
  fi

  # Parse JSON input from Claude Code hook
  local session_id cwd project
  session_id=$(echo "${input}" | jq -r '.session_id // "unknown"')
  cwd=$(echo "${input}" | jq -r '.cwd // ""')

  # Extract project name using priority order:
  # 1. Git repository root (ALWAYS preferred - ensures consistent metrics)
  # 2. CLAUDE_PROJECT_DIR env var (fallback if not in a git repo)
  # 3. Project marker files (package.json, etc.)
  # 4. Basename of cwd (with version-like name filtering)
  #
  # IMPORTANT: Always use git root to ensure sub-projects (oracle/, cli/, etc.)
  # are correctly attributed to the parent project (cellm-private).
  project=""
  local search_dir="${cwd:-${PWD}}"

  # Priority 1: Find git root directory (ALWAYS preferred for consistent metrics)
  if [[ -n "${search_dir}" ]] && command -v git &> /dev/null; then
    local git_root
    git_root=$(cd "${search_dir}" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null || echo "")
    if [[ -n "${git_root}" ]]; then
      project=$(basename "${git_root}")
      log "Project from git root: ${project}"
    fi
  fi

  # Priority 2: Use CLAUDE_PROJECT_DIR if not in a git repo
  if [[ -z "${project}" && -n "${CLAUDE_PROJECT_DIR:-}" ]]; then
    project=$(basename "${CLAUDE_PROJECT_DIR}")
    log "Project from CLAUDE_PROJECT_DIR: ${project}"
  fi

  # Priority 3: Look for project marker files walking up the tree
  if [[ -z "${project}" && -n "${search_dir}" ]]; then
    local check_dir="${search_dir}"
    while [[ "${check_dir}" != "/" && "${check_dir}" != "." ]]; do
      if [[ -f "${check_dir}/package.json" ]] || \
         [[ -f "${check_dir}/Cargo.toml" ]] || \
         [[ -f "${check_dir}/go.mod" ]] || \
         [[ -f "${check_dir}/pyproject.toml" ]] || \
         [[ -d "${check_dir}/.git" ]]; then
        project=$(basename "${check_dir}")
        break
      fi
      check_dir=$(dirname "${check_dir}")
    done
  fi

  # Priority 4: Basename of cwd (filter version-like names)
  if [[ -z "${project}" ]]; then
    local base_name
    base_name=$(basename "${search_dir}")
    # Skip if it looks like a version number (e.g., 2.0.6, v1.2.3)
    if [[ ! "${base_name}" =~ ^v?[0-9]+\.[0-9]+ ]]; then
      project="${base_name}"
    else
      # Use parent directory instead
      project=$(basename "$(dirname "${search_dir}")")
    fi
  fi

  # Ultimate fallback
  if [[ -z "${project}" || "${project}" == "/" ]]; then
    project="unknown"
  fi

  # Skip if no valid session
  if [[ "${session_id}" == "unknown" || "${session_id}" == "null" || -z "${session_id}" ]]; then
    log "No valid session_id, skipping"
    exit 0
  fi

  # Build JSON payload for Oracle API
  local payload
  payload=$(jq -n \
    --arg sid "${session_id}" \
    --arg proj "${project}" \
    '{
      sessionId: $sid,
      project: $proj
    }')

  # Send session init request
  if curl -sf --max-time 2 --connect-timeout 0.5 \
    -X POST \
    -H "Content-Type: application/json" \
    -d "${payload}" \
    "${url}" >/dev/null 2>&1; then
    log "Session initialized: ${session_id} (project: ${project})"
  else
    log "Failed to initialize session"
  fi

  exit 0
}

main "$@"

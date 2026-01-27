#!/bin/bash
# CELLM Oracle - Inject Context (SessionStart helper)
# Fetches recent context from Worker and outputs for injection
# Phase 3: Timeline Avançado

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
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [Inject] $1" >> "${LOG_FILE}" 2>/dev/null || true
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

# Get project name
get_project() {
  basename "${PWD}"
}

# Fetch and output context
fetch_context() {
  local port="${1}"
  local project="${2}"
  local url="http://127.0.0.1:${port}/api/context/generate?project=${project}"

  # Fetch context with timeout
  local response
  response=$(curl -sf --max-time 3 "${url}" 2>/dev/null)

  if [[ $? -eq 0 && -n "${response}" ]]; then
    # Extract markdown from JSON response
    local markdown
    markdown=$(echo "${response}" | grep -o '"markdown":"[^"]*"' | sed 's/"markdown":"//;s/"$//' | sed 's/\\n/\n/g')

    if [[ -n "${markdown}" ]]; then
      echo "${markdown}"
      return 0
    fi
  fi

  return 1
}

# Main
main() {
  local port
  port=$(get_port)

  local project
  project=$(get_project)

  log "Injecting context for project: ${project}"

  # Check if worker is online
  if curl -sf --max-time 0.2 "http://127.0.0.1:${port}/health" >/dev/null 2>&1; then
    if fetch_context "${port}" "${project}"; then
      log "Context injected successfully"
    else
      log "No context available"
      echo "*No recent context available*"
    fi
  else
    log "Worker offline, no context injection"
    echo "*Worker offline - context unavailable*"
  fi

  exit 0
}

main "$@"

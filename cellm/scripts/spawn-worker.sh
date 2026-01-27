#!/bin/bash
# CELLM Oracle - Spawn Worker (SessionStart hook)
# Target: < 2000ms execution, fire-and-forget
#
# Enhanced with:
# - Lock file to prevent race conditions
# - Retry logic before spawning
# - Structured JSON logging
# - Dynamic paths via CLAUDE_PLUGIN_ROOT

set -euo pipefail

# Error handling and cleanup
cleanup() {
  local exit_code=$?
  release_lock
  if [[ $exit_code -ne 0 ]]; then
    log_json "error" "Script failed with exit code $exit_code"
  fi
}

# Configuration
CELLM_DIR="${HOME}/.cellm"
WORKER_JSON="${CELLM_DIR}/worker.json"
BUFFER_FILE="${CELLM_DIR}/buffer.jsonl"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
LOCK_FILE="${CELLM_DIR}/spawn.lock"
PID_FILE="${CELLM_DIR}/worker.pid"
DEFAULT_PORT=31415
HEALTH_TIMEOUT=500  # ms - increased from 200ms
MAX_HEALTH_RETRIES=3
LOCK_TIMEOUT=5  # seconds

# Ensure directory exists
mkdir -p "${CELLM_DIR}"

# Structured JSON logging
log_json() {
  local level="$1"
  local message="$2"
  local ts
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  echo "{\"ts\":\"${ts}\",\"level\":\"${level}\",\"msg\":\"${message}\",\"session\":\"${CLAUDE_SESSION_ID:-unknown}\",\"hook\":\"spawn-worker\"}" >> "${LOG_FILE}" 2>/dev/null || true
}

# Legacy log function (for backwards compatibility)
log() {
  log_json "info" "$1"
}

# Acquire lock with timeout
acquire_lock() {
  local lock_fd=200

  # Open lock file descriptor
  exec 200>"${LOCK_FILE}"

  # Try non-blocking first
  if flock -n ${lock_fd} 2>/dev/null; then
    return 0
  fi

  log_json "debug" "Another spawn in progress, waiting for lock..."

  # Wait with timeout
  if flock -w ${LOCK_TIMEOUT} ${lock_fd} 2>/dev/null; then
    return 0
  fi

  log_json "warn" "Failed to acquire lock after ${LOCK_TIMEOUT}s"
  return 1
}

# Release lock (called on exit)
release_lock() {
  exec 200>&- 2>/dev/null || true
}

trap cleanup EXIT

# Quick health check (single attempt)
check_health_once() {
  local port="${1:-$DEFAULT_PORT}"
  local url="http://127.0.0.1:${port}/health"
  local timeout_sec="0.5"

  if curl -sf --max-time "${timeout_sec}" --connect-timeout 0.2 "${url}" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

# Health check with retry logic
check_health_with_retry() {
  local port="${1:-$DEFAULT_PORT}"
  local max_retries="${2:-$MAX_HEALTH_RETRIES}"
  local i

  for i in $(seq 1 "${max_retries}"); do
    if check_health_once "${port}"; then
      return 0
    fi
    # Brief pause between retries (100ms)
    sleep 0.1
  done

  return 1
}

# Get port from worker.json or default
get_port() {
  if [[ -f "${WORKER_JSON}" ]]; then
    local port

    # Use jq for reliable JSON parsing, fallback to DEFAULT_PORT
    if command -v jq >/dev/null 2>&1; then
      port=$(jq -r '.port // empty' "${WORKER_JSON}" 2>/dev/null || echo "")
    else
      # Fallback to grep if jq not available (not recommended)
      port=$(grep -o '"port"[[:space:]]*:[[:space:]]*[0-9]*' "${WORKER_JSON}" 2>/dev/null | grep -o '[0-9]*' || echo "")
    fi

    # Validate port range (1-65535)
    if [[ -n "${port}" ]] && [[ "${port}" =~ ^[0-9]+$ ]] && [[ "${port}" -ge 1 ]] && [[ "${port}" -le 65535 ]]; then
      echo "${port}"
      return
    fi
  fi
  echo "${DEFAULT_PORT}"
}

# Get oracle root path (dynamic, supports CLAUDE_PLUGIN_ROOT)
get_oracle_root() {
  local script_dir
  script_dir="$(cd "$(dirname "$0")" && pwd)"

  # Try CLAUDE_PLUGIN_ROOT first
  if [[ -n "${CLAUDE_PLUGIN_ROOT}" ]]; then
    local oracle_path="${CLAUDE_PLUGIN_ROOT}/../../../oracle"
    if [[ -d "${oracle_path}" ]]; then
      cd "${oracle_path}" && pwd
      return
    fi
  fi

  # Fallback: relative to script location
  local plugin_root
  plugin_root="$(cd "${script_dir}/.." && pwd)"
  local oracle_path="${plugin_root}/../../../oracle"

  if [[ -d "${oracle_path}" ]]; then
    cd "${oracle_path}" && pwd
    return
  fi

  log_json "error" "Cannot find oracle directory"
  return 1
}

# Kill stale worker process if PID file exists
cleanup_stale_process() {
  if [[ -f "${PID_FILE}" ]]; then
    local old_pid
    old_pid=$(cat "${PID_FILE}" 2>/dev/null || echo "")

    if [[ -n "${old_pid}" ]] && kill -0 "${old_pid}" 2>/dev/null; then
      log_json "debug" "Killing stale worker process ${old_pid}"
      kill -TERM "${old_pid}" 2>/dev/null || true
      sleep 0.5
      kill -KILL "${old_pid}" 2>/dev/null || true
    fi

    rm -f "${PID_FILE}" 2>/dev/null || true
  fi
}

# Spawn worker detached (fire-and-forget)
spawn_worker() {
  # Primary method: npx @cellm-ai/oracle (works anywhere)
  if command -v npx >/dev/null 2>&1; then
    log_json "info" "Spawning worker via npx @cellm-ai/oracle"

    # Spawn detached with npx
    nohup npx @cellm-ai/oracle start --daemon >> "${LOG_FILE}" 2>&1 &
    local pid=$!

    # Detach completely
    disown "${pid}" 2>/dev/null || true

    log_json "info" "Worker spawn initiated via npx (PID ${pid})"
    return 0
  fi

  # Fallback: try local oracle directory (dev mode)
  local oracle_root
  oracle_root=$(get_oracle_root 2>/dev/null) || true

  if [[ -n "${oracle_root}" ]]; then
    local worker_entry="${oracle_root}/worker/index.ts"
    if [[ -f "${worker_entry}" ]]; then
      log_json "info" "Spawning worker via local bun (dev mode)"

      cd "${oracle_root}"
      nohup bun --bun "${worker_entry}" >> "${LOG_FILE}" 2>&1 &
      local pid=$!
      echo "${pid}" > "${PID_FILE}"

      disown "${pid}" 2>/dev/null || true

      log_json "info" "Worker spawned with PID ${pid}"
      return 0
    fi
  fi

  log_json "error" "Cannot spawn worker: npx not found and no local oracle"
  return 1
}

# Verify spawn was successful
verify_spawn() {
  local port="${1:-$DEFAULT_PORT}"
  local max_attempts=10
  local attempt

  for attempt in $(seq 1 "${max_attempts}"); do
    sleep 0.2
    if check_health_once "${port}"; then
      log_json "info" "Worker verified healthy after spawn (attempt ${attempt})"
      return 0
    fi
  done

  log_json "warn" "Worker not responding after spawn (${max_attempts} attempts)"
  return 1
}

# Buffer event for later processing
buffer_event() {
  local event_type="${1:-SessionStart}"
  local timestamp
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  # Create minimal event JSON
  local event="{\"event\":\"${event_type}\",\"timestamp\":\"${timestamp}\",\"session_id\":\"${CLAUDE_SESSION_ID:-unknown}\"}"

  echo "${event}" >> "${BUFFER_FILE}" 2>/dev/null || true
  log_json "debug" "Event buffered: ${event_type}"
}

# Main execution
main() {
  local start_time
  start_time=$(date +%s%3N 2>/dev/null || date +%s)

  log_json "info" "SessionStart hook triggered"

  # Acquire lock to prevent race conditions
  if ! acquire_lock; then
    log_json "info" "Lock acquisition failed, another instance handling spawn"
    exit 0
  fi

  local port
  port=$(get_port)

  # Check health with retry before deciding to spawn
  if check_health_with_retry "${port}" "${MAX_HEALTH_RETRIES}"; then
    log_json "info" "Worker online at port ${port}"
  else
    log_json "info" "Worker offline after ${MAX_HEALTH_RETRIES} retries, spawning..."

    # Clean up any stale process
    cleanup_stale_process

    # Buffer the event
    buffer_event "SessionStart"

    # Spawn new worker
    if spawn_worker; then
      # Verify it came up
      verify_spawn "${port}"
    fi
  fi

  local end_time
  end_time=$(date +%s%3N 2>/dev/null || date +%s)
  local duration=$((end_time - start_time))
  log_json "info" "Hook completed in ${duration}ms"

  # Always exit 0 - never break CLI
  exit 0
}

main "$@"

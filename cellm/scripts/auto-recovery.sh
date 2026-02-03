#!/bin/bash
# CELLM Oracle - Auto Recovery Watchdog
# Called on UserPromptSubmit if health fails
#
# This script attempts to recover a crashed worker:
# 1. Check if worker is responding
# 2. If not, kill stale process if any
# 3. Spawn fresh worker
# 4. Verify recovery

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
PID_FILE="${CELLM_DIR}/worker.pid"
DEFAULT_PORT=31415
MAX_RECOVERY_ATTEMPTS=2

# Structured JSON logging
log_json() {
  local level="$1"
  local message="$2"
  local ts
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  echo "{\"ts\":\"${ts}\",\"level\":\"${level}\",\"msg\":\"${message}\",\"session\":\"${CLAUDE_SESSION_ID:-unknown}\",\"hook\":\"auto-recovery\"}" >> "${LOG_FILE}" 2>/dev/null || true
}

# Quick health check
check_health() {
  local port="${1:-$DEFAULT_PORT}"
  local url="http://127.0.0.1:${port}/health"

  if curl -sf --max-time 0.5 --connect-timeout 0.2 "${url}" >/dev/null 2>&1; then
    return 0
  fi
  return 1
}

# Get port from worker.json or default
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

# Kill stale worker process
kill_stale_process() {
  if [[ -f "${PID_FILE}" ]]; then
    local old_pid
    old_pid=$(cat "${PID_FILE}" 2>/dev/null || echo "")

    if [[ -n "${old_pid}" ]]; then
      log_json "info" "[RECOVERY] Killing stale process ${old_pid}"

      # Graceful shutdown first
      kill -TERM "${old_pid}" 2>/dev/null || true
      sleep 0.5

      # Force kill if still alive
      if kill -0 "${old_pid}" 2>/dev/null; then
        kill -KILL "${old_pid}" 2>/dev/null || true
      fi
    fi

    rm -f "${PID_FILE}" 2>/dev/null || true
  fi

  # Also try to find by process name
  pkill -f "oracle/worker/index.ts" 2>/dev/null || true
  pkill -f "oracle/scripts/start-worker.sh" 2>/dev/null || true
}

# Spawn fresh worker
spawn_worker() {
  local script_dir
  script_dir="$(cd "$(dirname "$0")" && pwd)"

  # Use spawn-worker.sh which has all the logic
  local spawn_script="${script_dir}/spawn-worker.sh"

  if [[ -x "${spawn_script}" ]]; then
    # Force spawn by not checking health
    log_json "info" "[RECOVERY] Triggering spawn via spawn-worker.sh"
    "${spawn_script}"
    return $?
  fi

  log_json "error" "[RECOVERY] spawn-worker.sh not found"
  return 1
}

# Main recovery logic
check_and_recover() {
  local port
  port=$(get_port)

  # First check if worker is healthy
  if check_health "${port}"; then
    log_json "debug" "[RECOVERY] Worker is healthy, no action needed"
    return 0
  fi

  log_json "warn" "[RECOVERY] Worker down, attempting restart"

  # Kill stale process
  kill_stale_process

  # Brief pause to ensure cleanup
  sleep 0.5

  # Spawn fresh worker
  spawn_worker

  # Wait for startup
  sleep 1

  # Verify recovery
  if check_health "${port}"; then
    log_json "info" "[RECOVERY] Worker recovered successfully"
    return 0
  fi

  log_json "error" "[RECOVERY] Failed to recover worker - manual intervention may be needed"
  return 1
}

# Main execution
main() {
  local start_time
  start_time=$(date +%s%3N 2>/dev/null || date +%s)

  log_json "info" "[RECOVERY] Auto-recovery check initiated"

  local attempt
  for attempt in $(seq 1 "${MAX_RECOVERY_ATTEMPTS}"); do
    if check_and_recover; then
      break
    fi

    if [[ ${attempt} -lt ${MAX_RECOVERY_ATTEMPTS} ]]; then
      log_json "warn" "[RECOVERY] Attempt ${attempt} failed, retrying..."
      sleep 1
    fi
  done

  local end_time
  end_time=$(date +%s%3N 2>/dev/null || date +%s)
  local duration
  duration=$((end_time - start_time))
  log_json "info" "[RECOVERY] Check completed in ${duration}ms"

  # Always exit 0 - never break CLI
  exit 0
}

main "$@"

#!/usr/bin/env bash
# CELLM Oracle - Health Check Script
# Standalone script to check worker health status
#
# Usage: ./health-check.sh [--json] [--readiness] [--verbose]
#
# Options:
#   --json       Output in JSON format
#   --readiness  Wait for readiness (up to 5s)
#   --verbose    Show detailed status

set -euo pipefail

# Error handling: log to file, never write stderr (causes "hook error" in Claude Code)
cleanup() {
  local exit_code=$?
  if [[ $exit_code -ne 0 ]]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] [HealthCheck] Script failed with exit code $exit_code" >> "${HOME}/.cellm/oracle-hook.log" 2>/dev/null || true
  fi
}

trap cleanup EXIT

# Configuration
DEFAULT_PORT=31415
READINESS_TIMEOUT=5

# Parse arguments
JSON_OUTPUT=false
READINESS_CHECK=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --readiness)
      READINESS_CHECK=true
      shift
      ;;
    --verbose|-v)
      VERBOSE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Port extraction (shared utility)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/_get-port.sh"

# Quick health check
check_health() {
  local port="${1:-$DEFAULT_PORT}"
  local url="http://127.0.0.1:${port}/health"

  local response
  response=$(curl -sf --max-time 1 --connect-timeout 0.5 "${url}" 2>/dev/null || echo "")

  if [[ -n "${response}" ]]; then
    echo "${response}"
    return 0
  fi
  return 1
}

# Get detailed status
get_status() {
  local port="${1:-$DEFAULT_PORT}"
  local base_url="http://127.0.0.1:${port}"

  # Basic health
  local health_response
  health_response=$(curl -sf --max-time 1 "${base_url}/health" 2>/dev/null || echo '{"status":"down"}')

  # Memory stats if available
  local memory_response
  memory_response=$(curl -sf --max-time 1 "${base_url}/api/stats" 2>/dev/null || echo '{}')

  echo "{\"health\":${health_response},\"stats\":${memory_response}}"
}

# Wait for readiness
wait_for_ready() {
  local port="${1:-$DEFAULT_PORT}"
  local timeout="${2:-$READINESS_TIMEOUT}"

  # Validate timeout is a positive number
  if ! [[ "${timeout}" =~ ^[0-9]+$ ]] || [[ "${timeout}" -le 0 ]]; then
    timeout="${READINESS_TIMEOUT}"
  fi

  # Calculate max_iterations from timeout (timeout in seconds / 0.2s interval)
  local sleep_interval=0.2
  local max_iterations
  max_iterations=$((timeout * 5))  # timeout / 0.2 = timeout * 5

  for _i in $(seq 1 "${max_iterations}"); do
    if check_health "${port}" >/dev/null 2>&1; then
      return 0
    fi
    sleep "${sleep_interval}"
  done

  return 1
}

# Output result
output_result() {
  local status="$1"
  local port="$2"
  local details="$3"

  if ${JSON_OUTPUT}; then
    local ts
    ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    echo "{\"timestamp\":\"${ts}\",\"status\":\"${status}\",\"port\":${port},\"details\":${details:-null}}"
  else
    if [[ "${status}" == "healthy" ]]; then
      echo "[+] Worker healthy at port ${port}"
    else
      echo "[-] Worker not responding at port ${port}"
      echo "    Start with: cd oracle && bun --bun worker/index.ts"
    fi

    if ${VERBOSE} && [[ -n "${details}" ]]; then
      echo "Details: ${details}"
    fi
  fi
}

# Main execution
main() {
  local port
  port=$(get_port)

  # Readiness check (wait for worker to come up)
  if ${READINESS_CHECK}; then
    if wait_for_ready "${port}"; then
      output_result "healthy" "${port}"
      exit 0
    else
      output_result "timeout" "${port}"
      exit 1
    fi
  fi

  # Standard health check
  local health_response
  if health_response=$(check_health "${port}"); then
    local details=""
    if ${VERBOSE}; then
      details=$(get_status "${port}")
    fi
    output_result "healthy" "${port}" "${details:-${health_response}}"
    exit 0
  else
    output_result "down" "${port}"
    exit 1
  fi
}

main "$@"

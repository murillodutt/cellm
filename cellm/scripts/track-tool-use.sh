#!/bin/bash
# CELLM Oracle - Track Tool Use (PostToolUse hook)
# Captures tool usage for analytics
#
# This is a lightweight hook that buffers tool usage events
# for later processing by the worker daemon.

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
BUFFER_FILE="${CELLM_DIR}/tool-buffer.jsonl"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"

# Ensure directory exists
mkdir -p "${CELLM_DIR}"

# Structured JSON logging
log_json() {
  local level="$1"
  local message="$2"
  local ts
  ts=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  echo "{\"ts\":\"${ts}\",\"level\":\"${level}\",\"msg\":\"${message}\",\"session\":\"${CLAUDE_SESSION_ID:-unknown}\",\"hook\":\"track-tool-use\"}" >> "${LOG_FILE}" 2>/dev/null || true
}

# Buffer tool event
buffer_tool_event() {
  local timestamp
  timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)

  # Read tool info from environment (set by Claude Code)
  local tool_name="${CLAUDE_TOOL_NAME:-unknown}"
  local tool_input="${CLAUDE_TOOL_INPUT:-}"
  local tool_output_size="${CLAUDE_TOOL_OUTPUT_SIZE:-0}"

  # Create event JSON (minimal, no sensitive data)
  local event="{\"event\":\"ToolUse\",\"timestamp\":\"${timestamp}\",\"session_id\":\"${CLAUDE_SESSION_ID:-unknown}\",\"tool\":\"${tool_name}\",\"output_size\":${tool_output_size}}"

  echo "${event}" >> "${BUFFER_FILE}" 2>/dev/null || true
  log_json "debug" "Tool use tracked: ${tool_name}"
}

# Main execution
main() {
  buffer_tool_event

  # Always exit 0 - never break CLI
  exit 0
}

main "$@"

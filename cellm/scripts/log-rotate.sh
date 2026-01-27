#!/bin/bash
# CELLM Oracle - Log Rotation Script
# Rotates log files to prevent unbounded growth
#
# Usage: ./log-rotate.sh [--max-size MB] [--keep N]
#
# Options:
#   --max-size  Maximum log size in MB before rotation (default: 10)
#   --keep      Number of rotated logs to keep (default: 3)

set -e

# Configuration
CELLM_DIR="${HOME}/.cellm"
LOG_FILE="${CELLM_DIR}/oracle-hook.log"
MAX_SIZE_MB=10
KEEP_LOGS=3

# Parse arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
    --max-size)
      MAX_SIZE_MB="$2"
      shift 2
      ;;
    --keep)
      KEEP_LOGS="$2"
      shift 2
      ;;
    *)
      shift
      ;;
  esac
done

# Get file size in MB
get_file_size_mb() {
  local file="$1"
  if [[ -f "${file}" ]]; then
    # macOS compatible
    local size_bytes
    size_bytes=$(stat -f%z "${file}" 2>/dev/null || stat -c%s "${file}" 2>/dev/null || echo "0")
    echo $((size_bytes / 1024 / 1024))
  else
    echo "0"
  fi
}

# Rotate log files
rotate_logs() {
  local base_file="$1"
  local keep="$2"

  # Remove oldest if exists
  local oldest="${base_file}.${keep}"
  if [[ -f "${oldest}" ]]; then
    rm -f "${oldest}"
  fi

  # Shift existing rotated logs
  for i in $(seq $((keep - 1)) -1 1); do
    local current="${base_file}.${i}"
    local next="${base_file}.$((i + 1))"
    if [[ -f "${current}" ]]; then
      mv "${current}" "${next}"
    fi
  done

  # Rotate current log
  if [[ -f "${base_file}" ]]; then
    mv "${base_file}" "${base_file}.1"
    touch "${base_file}"
    chmod 644 "${base_file}"
  fi
}

# Compress old logs
compress_old_logs() {
  local base_file="$1"
  local keep="$2"

  for i in $(seq 2 "${keep}"); do
    local log="${base_file}.${i}"
    if [[ -f "${log}" ]] && [[ ! -f "${log}.gz" ]]; then
      gzip -f "${log}" 2>/dev/null || true
    fi
  done
}

# Main execution
main() {
  # Ensure directory exists
  mkdir -p "${CELLM_DIR}"

  # Check if rotation needed
  local current_size
  current_size=$(get_file_size_mb "${LOG_FILE}")

  if [[ ${current_size} -ge ${MAX_SIZE_MB} ]]; then
    echo "[+] Log file is ${current_size}MB (>= ${MAX_SIZE_MB}MB), rotating..."

    rotate_logs "${LOG_FILE}" "${KEEP_LOGS}"
    compress_old_logs "${LOG_FILE}" "${KEEP_LOGS}"

    echo "[+] Log rotation complete"
  else
    echo "[i] Log file is ${current_size}MB (< ${MAX_SIZE_MB}MB), no rotation needed"
  fi

  # Show current state
  echo ""
  echo "Current log files:"
  ls -lh "${LOG_FILE}"* 2>/dev/null || echo "  No log files found"
}

main "$@"

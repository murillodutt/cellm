#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "${script_dir}/_prose-override.sh"

cmd="${1:-status}"
arg1="${2:-}"

usage() {
  cat <<'EOF'
Usage:
  prose.sh on [turn|block|session|explicit] [value]
  prose.sh off
  prose.sh level <off|minimal|full>
  prose.sh status
EOF
}

status_json() {
  local level
  level="$(prose_read_level)"
  printf '{"level":"%s"}\n' "${level}"
}

case "${cmd}" in
  on)
    ttl_unit="${arg1:-block}"
    ttl_value="${3:-1}"
    prose_write_flag "full" "${ttl_unit}" "${ttl_value}" "manual" >/dev/null
    status_json
    ;;
  off)
    prose_clear_flag >/dev/null
    status_json
    ;;
  level)
    if [[ -z "${arg1}" ]]; then
      usage
      exit 1
    fi
    case "${arg1}" in
      off)
        prose_clear_flag >/dev/null
        ;;
      minimal|full)
        prose_write_flag "${arg1}" "block" "1" "manual" >/dev/null
        ;;
      *)
        usage
        exit 1
        ;;
    esac
    status_json
    ;;
  status)
    status_json
    ;;
  *)
    usage
    exit 1
    ;;
esac

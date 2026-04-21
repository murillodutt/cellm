#!/usr/bin/env bash
# CELLM - Prose override contract helper (ADR-004).
#
# Flag path: ~/.cellm/prose/.active
# Config path: ~/.cellm/prose/config.json
#
# Security:
# - Refuse symlink targets
# - Atomic temp + rename writes
# - 0700 dir / 0600 files where applicable

CELLM_PROSE_DIR="${HOME}/.cellm/prose"
CELLM_PROSE_FLAG="${CELLM_PROSE_DIR}/.active"
CELLM_PROSE_CONFIG="${CELLM_PROSE_DIR}/config.json"
CELLM_PROSE_MAX_READ_BYTES=4096

prose__is_symlink() {
  local path="$1"
  [[ -L "${path}" ]]
}

prose__ensure_dir() {
  if prose__is_symlink "${CELLM_PROSE_DIR}"; then
    return 1
  fi
  mkdir -p "${CELLM_PROSE_DIR}" 2>/dev/null || return 1
  chmod 700 "${CELLM_PROSE_DIR}" 2>/dev/null || true
  return 0
}

prose__safe_write_json() {
  local target="$1"
  local payload="$2"
  local parent tmp
  parent="$(dirname "${target}")"

  prose__ensure_dir || return 1

  if prose__is_symlink "${target}" || prose__is_symlink "${parent}"; then
    return 1
  fi

  umask 077
  tmp="$(mktemp "${parent}/.tmp.prose.XXXXXX")" || return 1
  printf '%s' "${payload}" > "${tmp}" || { rm -f "${tmp}" 2>/dev/null || true; return 1; }
  chmod 600 "${tmp}" 2>/dev/null || true
  mv -f "${tmp}" "${target}" || { rm -f "${tmp}" 2>/dev/null || true; return 1; }
  chmod 600 "${target}" 2>/dev/null || true
  return 0
}

prose_ensure_default_config() {
  prose__ensure_dir || return 1
  if [[ -f "${CELLM_PROSE_CONFIG}" ]]; then
    return 0
  fi
  prose__safe_write_json "${CELLM_PROSE_CONFIG}" \
    '{"defaultLevel":"full","defaultTTL":{"unit":"block","value":1},"defaultQuantizationOnReturn":"full","autoClarityTriggersProse":true,"multilingualRegex":["prose","prosa","plain","normal mode","modo normal","普通","普通模式"]}'
}

prose_write_flag() {
  local level="${1:-full}"
  local ttl_unit="${2:-block}"
  local ttl_value="${3:-1}"
  local source="${4:-manual}"
  local now expires_at

  prose_ensure_default_config || return 1
  now=$(date +%s)

  case "${ttl_unit}" in
    turn|block|session|explicit) ;;
    *) ttl_unit="block" ;;
  esac
  [[ "${ttl_value}" =~ ^[0-9]+$ ]] || ttl_value=1
  case "${level}" in
    off|minimal|full) ;;
    *) level="full" ;;
  esac
  case "${source}" in
    manual|auto-clarity|config) ;;
    *) source="manual" ;;
  esac

  if [[ "${ttl_unit}" == "explicit" ]]; then
    expires_at="null"
  else
    expires_at="$(( now + (ttl_value * 3600) ))"
  fi

  prose__safe_write_json "${CELLM_PROSE_FLAG}" \
    "{\"level\":\"${level}\",\"ttl\":{\"unit\":\"${ttl_unit}\",\"value\":${ttl_value}},\"expiresAt\":${expires_at},\"activatedAt\":${now},\"source\":\"${source}\"}"
}

prose_clear_flag() {
  if prose__is_symlink "${CELLM_PROSE_FLAG}"; then
    return 1
  fi
  rm -f "${CELLM_PROSE_FLAG}" 2>/dev/null || true
}

prose_read_level() {
  local raw level expires now

  if [[ ! -f "${CELLM_PROSE_FLAG}" ]]; then
    printf 'off'
    return 0
  fi
  if prose__is_symlink "${CELLM_PROSE_FLAG}"; then
    printf 'off'
    return 0
  fi

  raw="$(head -c "${CELLM_PROSE_MAX_READ_BYTES}" "${CELLM_PROSE_FLAG}" 2>/dev/null || true)"
  if [[ -z "${raw}" ]]; then
    printf 'off'
    return 0
  fi

  if command -v jq >/dev/null 2>&1; then
    level="$(printf '%s' "${raw}" | jq -r '.level // "off"' 2>/dev/null || true)"
    expires="$(printf '%s' "${raw}" | jq -r '.expiresAt // "null"' 2>/dev/null || true)"
  else
    level="$(printf '%s' "${raw}" | sed -n 's/.*"level"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n1)"
    expires="$(printf '%s' "${raw}" | sed -n 's/.*"expiresAt"[[:space:]]*:[[:space:]]*\([0-9]\+\|null\).*/\1/p' | head -n1)"
  fi

  case "${level}" in
    off|minimal|full) ;;
    *) level="off" ;;
  esac

  if [[ -n "${expires}" && "${expires}" != "null" && "${expires}" =~ ^[0-9]+$ ]]; then
    now=$(date +%s)
    if (( now >= expires )); then
      prose_clear_flag >/dev/null 2>&1 || true
      printf 'off'
      return 0
    fi
  fi

  printf '%s' "${level}"
}

# Returns one of: off | safe | balanced (override policy)
prose_effective_quantization_band() {
  local level
  level="$(prose_read_level)"
  case "${level}" in
    full) printf 'off' ;;
    minimal) printf 'safe' ;;
    *) printf 'balanced' ;;
  esac
}

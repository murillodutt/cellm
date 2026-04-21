#!/usr/bin/env bash
# CELLM - Shared quantization policy resolver for CLI hook context.
#
# Source this file after _get-base-url.sh and _get-port.sh.
# Exposes:
#   - get_ui_quantization_mode <base_url>
#   - get_ui_quantization_enabled <base_url>
#   - get_ui_quantization_cap <base_url>
#   - get_cli_context_cap_for_mode <mode>
#   - get_cli_sessionstart_cap_for_mode <mode>
#   - quantize_hook_context <text> <mode> <max_chars>
#
# This script is intentionally dependency-light. jq is optional.

CELLM_DIR="${HOME}/.cellm"
QZ_CACHE_FILE="${CELLM_DIR}/cache/ui-settings-qz.json"
QZ_CACHE_TTL_SEC=10

ensure_qz_cache_dir() {
  mkdir -p "${CELLM_DIR}/cache" >/dev/null 2>&1 || true
}

file_mtime_epoch() {
  local file="$1"
  # macOS (BSD stat)
  stat -f %m "${file}" 2>/dev/null && return 0
  # Linux (GNU stat)
  stat -c %Y "${file}" 2>/dev/null && return 0
  echo "0"
}

fetch_ui_settings_json() {
  local base_url="$1"
  local now mtime age payload cached
  now=$(date +%s)
  ensure_qz_cache_dir

  if [[ -f "${QZ_CACHE_FILE}" ]]; then
    mtime=$(file_mtime_epoch "${QZ_CACHE_FILE}")
    age=$(( now - mtime ))
    if (( age >= 0 && age < QZ_CACHE_TTL_SEC )); then
      cat "${QZ_CACHE_FILE}"
      return 0
    fi
  fi

  payload=$(curl -sf --max-time 1 --connect-timeout 1 "${base_url}/api/ui-settings" 2>/dev/null || true)
  if [[ -n "${payload}" ]]; then
    printf '%s' "${payload}" > "${QZ_CACHE_FILE}" 2>/dev/null || true
    printf '%s' "${payload}"
    return 0
  fi

  if [[ -f "${QZ_CACHE_FILE}" ]]; then
    cached=$(cat "${QZ_CACHE_FILE}" 2>/dev/null || true)
    if [[ -n "${cached}" ]]; then
      printf '%s' "${cached}"
      return 0
    fi
  fi

  printf '{}'
}

extract_json_value() {
  local json="$1" jq_expr="$2" fallback="$3"
  local out=""

  if command -v jq >/dev/null 2>&1; then
    out=$(printf '%s' "${json}" | jq -r "${jq_expr}" 2>/dev/null || true)
  fi

  if [[ -z "${out}" || "${out}" == "null" ]]; then
    out="${fallback}"
  fi
  printf '%s' "${out}"
}

normalize_qz_mode() {
  local raw
  raw="$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
  case "${raw}" in
    compact|feedback_first) printf 'compact' ;;
    comprehensive|balanced) printf 'comprehensive' ;;
    standard) printf 'standard' ;;
    *) printf 'standard' ;;
  esac
}

normalize_qz_enabled() {
  local raw
  raw="$(printf '%s' "${1:-}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
  case "${raw}" in
    false|0|no|off) printf 'false' ;;
    *) printf 'true' ;;
  esac
}

normalize_qz_cap() {
  local raw cap
  raw="${1:-1200}"
  if [[ ! "${raw}" =~ ^[0-9]+$ ]]; then
    printf '1200'
    return 0
  fi
  cap="${raw}"
  (( cap < 300 )) && cap=300
  (( cap > 10000 )) && cap=10000
  printf '%s' "${cap}"
}

get_ui_quantization_mode() {
  local base_url="$1"
  local json raw
  json=$(fetch_ui_settings_json "${base_url}")
  raw=$(extract_json_value "${json}" '.quantization.mode // empty' 'standard')
  normalize_qz_mode "${raw}"
}

get_ui_quantization_enabled() {
  local base_url="$1"
  local json raw
  json=$(fetch_ui_settings_json "${base_url}")
  raw=$(extract_json_value "${json}" '.quantization.enabled // false' 'false')
  normalize_qz_enabled "${raw}"
}

get_ui_quantization_cap() {
  local base_url="$1"
  local json raw
  json=$(fetch_ui_settings_json "${base_url}")
  raw=$(extract_json_value "${json}" '.quantization.maxNonFeedbackChars // 1200' '1200')
  normalize_qz_cap "${raw}"
}

get_cli_context_cap_for_mode() {
  local mode="$1"
  case "${mode}" in
    compact) printf '1200' ;;
    comprehensive) printf '1800' ;;
    *) printf '1500' ;; # standard
  esac
}

get_cli_sessionstart_cap_for_mode() {
  local mode="$1"
  case "${mode}" in
    compact) printf '7200' ;;
    comprehensive) printf '10800' ;;
    *) printf '9000' ;; # standard
  esac
}

min_int() {
  local a="${1:-0}" b="${2:-0}"
  if (( a < b )); then printf '%s' "${a}"; else printf '%s' "${b}"; fi
}

maybe_strip_filler() {
  local text="$1"
  # Safety-first for hook payloads:
  # avoid lexical rewrites in shell to prevent accidental drift/corruption.
  printf '%s' "${text}"
}

collapse_blank_lines() {
  awk '
    BEGIN { blank = 0 }
    {
      if ($0 ~ /^[[:space:]]*$/) {
        blank++
        if (blank <= 2) print ""
        next
      }
      blank = 0
      print
    }
  '
}

quantize_hook_context() {
  local text="$1"
  local mode="$2"
  local max_chars="$3"
  local must_keep="${4:-}"
  local processed cap cut
  local script_dir py_tool

  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  py_tool="${script_dir}/cli-quantize.py"

  # Preferred path: Compress-LLM-style detect/compress/validate/fallback in Python helper.
  if command -v python3 >/dev/null 2>&1 && [[ -f "${py_tool}" ]]; then
    local py_out
    local -a py_args
    py_args=(--mode "${mode}" --max-chars "${max_chars}")
    if [[ -n "${must_keep}" ]]; then
      local -a keep_arr
      local item
      IFS='|' read -r -a keep_arr <<< "${must_keep}"
      for item in "${keep_arr[@]}"; do
        [[ -n "${item}" ]] && py_args+=(--must-keep "${item}")
      done
    fi

    py_out="$(printf '%s' "${text}" | python3 "${py_tool}" "${py_args[@]}" 2>/dev/null || true)"
    if [[ -n "${py_out}" ]]; then
      printf '%s' "${py_out}"
      return 0
    fi
  fi

  processed=$(printf '%s\n' "${text}" | sed -E -e 's/\r$//' -e 's/[[:blank:]]+$//')
  processed=$(printf '%s\n' "${processed}" | collapse_blank_lines)
  processed=$(maybe_strip_filler "${processed}")
  processed=$(printf '%s' "${processed}" | sed -E -e 's/[[:blank:]]{2,}/ /g' -e 's/[ ]+([,.;:!?])/\1/g')
  # Deduplicate exact repeated lines while preserving order.
  processed=$(printf '%s\n' "${processed}" | awk '
    BEGIN { RS="\n"; ORS="\n" }
    /^[[:space:]]*$/ { print ""; next }
    { if (!seen[$0]++) print $0 }
  ')
  processed=$(printf '%s\n' "${processed}" | collapse_blank_lines)

  if [[ ! "${max_chars}" =~ ^[0-9]+$ ]]; then
    max_chars=$(get_cli_context_cap_for_mode "${mode}")
  fi

  cap="${max_chars}"
  if (( ${#processed} <= cap )); then
    printf '%s' "${processed}"
    return 0
  fi

  cut="${processed:0:$((cap - 3))}"
  # Prefer paragraph boundary when the tail fragment is short.
  if [[ "${cut}" == *$'\n'* ]]; then
    local tail="${cut##*$'\n'}"
    if (( ${#tail} <= 120 )); then
      cut="${cut%$'\n'*}"
    fi
  fi
  # Prefer word boundary near the end.
  if [[ "${cut}" == *" "* ]]; then
    local last_word="${cut##* }"
    if (( ${#last_word} <= 30 )); then
      cut="${cut% *}"
    fi
  fi
  printf '%s...' "${cut}"
}

build_cli_output_quantization_directive() {
  local mode="$1"
  case "${mode}" in
    compact)
      cat <<'EOF'
[CELLM_QUANTIZATION_POLICY]
Mode: compact
Style: compress-llm-full technical brevity.
Remove pleasantries, hedging, repetition, and long transitions.
Prefer fragments and direct action/result phrasing.
Keep technical nouns, code tokens, error strings, and safety constraints intact.
Target response size: <= 450 chars (or <= 120 tokens), unless safety/ambiguity requires more.
EOF
      ;;
    comprehensive)
      cat <<'EOF'
[CELLM_QUANTIZATION_POLICY]
Mode: comprehensive
Style: low-compression technical prose.
Be concise but fully explicit on risks, decisions, and acceptance criteria.
Avoid conversational filler and duplication.
Target response size: <= 1400 chars (or <= 360 tokens), unless safety/ambiguity requires more.
EOF
      ;;
    *)
      cat <<'EOF'
[CELLM_QUANTIZATION_POLICY]
Mode: standard
Style: balanced compression (lite).
Use short sentences and direct technical wording; avoid filler and hedging.
Keep key rationale and next-step clarity.
Target response size: <= 900 chars (or <= 240 tokens), unless safety/ambiguity requires more.
EOF
      ;;
  esac
}

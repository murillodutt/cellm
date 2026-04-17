#!/bin/bash
# DocOps Hook - Optional drift reminder (non-blocking, silent by default)
# Runs on SessionEnd. Uses cooldown + fingerprint dedupe to avoid spam.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
CONFIG_PATH="${PROJECT_DIR}/.claude/docops.json"
LOG_PATH="${PROJECT_DIR}/.claude/docops-hook.log"
STATE_PATH="${PROJECT_DIR}/.claude/docops-hook.state.json"
STDOUT_NOTICES="${DOCOPS_HOOK_STDOUT:-0}"
COOLDOWN_SECONDS="${DOCOPS_HOOK_COOLDOWN_SECONDS:-1800}"

log() {
  local msg="$1"
  mkdir -p "$(dirname "${LOG_PATH}")" 2>/dev/null || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] ${msg}" >> "${LOG_PATH}" 2>/dev/null || true
}

if [[ ! -f "${CONFIG_PATH}" ]]; then
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  exit 0
fi

if ! [[ "${COOLDOWN_SECONDS}" =~ ^[0-9]+$ ]]; then
  COOLDOWN_SECONDS=1800
fi

hooks_enabled="$(jq -r '.hooksEnabled // false' "${CONFIG_PATH}" 2>/dev/null || echo "false")"
if [[ "${hooks_enabled}" != "true" ]]; then
  exit 0
fi

doc_root="$(jq -r '.docRoot // "docs/technical"' "${CONFIG_PATH}" 2>/dev/null || echo "docs/technical")"

if [[ ! -d "${PROJECT_DIR}/${doc_root}" ]]; then
  exit 0
fi

changed="$(git -C "${PROJECT_DIR}" status --porcelain -- "${doc_root}" 2>/dev/null || true)"
if [[ -z "${changed}" ]]; then
  exit 0
fi

fingerprint="$(printf '%s' "${changed}" | shasum -a 256 | awk '{print $1}')"
now_epoch="$(date +%s)"
last_fingerprint=""
last_notified_at="0"

if [[ -f "${STATE_PATH}" ]]; then
  last_fingerprint="$(jq -r '.lastFingerprint // ""' "${STATE_PATH}" 2>/dev/null || echo "")"
  last_notified_at="$(jq -r '.lastNotifiedAt // 0' "${STATE_PATH}" 2>/dev/null || echo 0)"
fi

if ! [[ "${last_notified_at}" =~ ^[0-9]+$ ]]; then
  last_notified_at=0
fi

if [[ "${fingerprint}" == "${last_fingerprint}" ]] && (( now_epoch - last_notified_at < COOLDOWN_SECONDS )); then
  log "[DOCOPS] Drift unchanged; skipped reminder (cooldown active)."
  exit 0
fi

notice="[DOCOPS] Documentation changed under ${doc_root}. Consider running /docops:sync to update derived docs."
log "${notice}"

mkdir -p "$(dirname "${STATE_PATH}")" 2>/dev/null || true
jq -n \
  --arg fp "${fingerprint}" \
  --argjson ts "${now_epoch}" \
  --arg dr "${doc_root}" \
  '{lastFingerprint: $fp, lastNotifiedAt: $ts, docRoot: $dr}' > "${STATE_PATH}" 2>/dev/null || true

if [[ "${STDOUT_NOTICES}" == "1" ]]; then
  echo "${notice}"
fi

exit 0

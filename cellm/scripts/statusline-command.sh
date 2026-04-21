#!/usr/bin/env bash
# CELLM Oracle - Status Line for Claude Code
# Deployed to ~/.claude/statusline-command.sh by cellm-init
# Shows: model, context bar, cost, project, branch, duration
# Stack alerts shown whenever pending updates > 0

set -euo pipefail

cleanup() {
  exit 0
}
trap cleanup EXIT

input=""
if [[ ! -t 0 ]]; then
  input=$(head -c 65536)
fi

if [[ -z "$input" ]]; then
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq required"
  exit 0
fi

MODEL=$(echo "$input" | jq -r '.model.display_name // "unknown"')
DIR=$(echo "$input" | jq -r '.workspace.current_dir')
COST=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
PCT=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)
DURATION_MS=$(echo "$input" | jq -r '.cost.total_duration_ms // 0')

CYAN='\033[36m'; GREEN='\033[32m'; YELLOW='\033[33m'; RED='\033[31m'; RESET='\033[0m'

# Pick bar color based on context usage
if [ "$PCT" -ge 90 ]; then BAR_COLOR="$RED"
elif [ "$PCT" -ge 70 ]; then BAR_COLOR="$YELLOW"
else BAR_COLOR="$GREEN"; fi

FILLED=$((PCT / 10)); EMPTY=$((10 - FILLED))
BAR=$(printf "%${FILLED}s" | tr ' ' '█')$(printf "%${EMPTY}s" | tr ' ' '░')

MINS=$((DURATION_MS / 60000)); SECS=$(((DURATION_MS % 60000) / 1000))

BRANCH=""
git rev-parse --git-dir > /dev/null 2>&1 && BRANCH="${RED}[${CYAN}$(git branch --show-current 2>/dev/null)${RED}]"

COST_FMT=$(printf '$%.2f' "$COST")
echo -e "${CYAN}[$MODEL]${RESET} ${BAR_COLOR}${BAR}${RESET} ${PCT}% [${YELLOW}${COST_FMT}${RESET}] [${DIR##*/}] $BRANCH ${RESET}[${MINS}m ${SECS}s]"

# Stack updates alert — read from file written by SessionStart hook
STATE_FILE="$HOME/.cellm/statusline-state"
if [ -f "$STATE_FILE" ]; then
  PENDING=$(cat "$STATE_FILE" 2>/dev/null)
  if [ -n "$PENDING" ] && [ "$PENDING" -gt 0 ] 2>/dev/null; then
    echo -e "${YELLOW}[!]${RESET} ${PENDING} pending updates — Settings > Stack Updates"
  fi
fi

# Quantization runtime state (policy source-of-truth from UI settings)
QZ_CACHE_FILE="$HOME/.cellm/cache/ui-settings-qz.json"
QZ_JSON=""
QZ_BASE_URL="${CELLM_WORKER_URL:-http://127.0.0.1:31415}"

# If local worker.json exists, prefer its port unless CELLM_WORKER_URL was explicitly set.
if [[ -z "${CELLM_WORKER_URL:-}" && -f "$HOME/.cellm/worker.json" ]]; then
  PORT_OVERRIDE=$(jq -r '.port // empty' "$HOME/.cellm/worker.json" 2>/dev/null || true)
  if [[ "$PORT_OVERRIDE" =~ ^[0-9]+$ ]]; then
    QZ_BASE_URL="http://127.0.0.1:${PORT_OVERRIDE}"
  fi
fi

if command -v curl >/dev/null 2>&1; then
  QZ_JSON=$(curl -sf --max-time 1 --connect-timeout 1 "${QZ_BASE_URL}/api/ui-settings" 2>/dev/null || true)
fi

if [[ -n "$QZ_JSON" && "$QZ_JSON" != "null" ]]; then
  mkdir -p "$HOME/.cellm/cache" >/dev/null 2>&1 || true
  printf '%s' "$QZ_JSON" > "$QZ_CACHE_FILE" 2>/dev/null || true
elif [[ -f "$QZ_CACHE_FILE" ]]; then
  QZ_JSON=$(cat "$QZ_CACHE_FILE" 2>/dev/null || true)
fi

if [[ -n "$QZ_JSON" ]]; then
  QZ_BAND=$(echo "$QZ_JSON" | jq -r '.quantization.band // "balanced"' 2>/dev/null || echo "balanced")
  QZ_INTENSITY=$(echo "$QZ_JSON" | jq -r '.quantization.intensity // 55' 2>/dev/null || echo "55")
  QZ_TRIPPED=$(echo "$QZ_JSON" | jq -r '.quantization.failSafeState.tripped // false' 2>/dev/null || echo "false")
  QZ_REASON=$(echo "$QZ_JSON" | jq -r '.quantization.failSafeState.reason // "NONE"' 2>/dev/null || echo "NONE")

  if [[ "$QZ_TRIPPED" == "true" ]]; then
    echo -e "${YELLOW}[QZ:${RESET}${QZ_BAND}/${QZ_INTENSITY}${YELLOW}]${RESET} fail-safe=${RED}TRIPPED${RESET}(${QZ_REASON})"
  else
    echo -e "${CYAN}[QZ:${RESET}${QZ_BAND}/${QZ_INTENSITY}${CYAN}]${RESET} fail-safe=${GREEN}READY${RESET}"
  fi
fi

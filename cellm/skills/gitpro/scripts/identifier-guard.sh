#!/usr/bin/env bash
set -euo pipefail

# identifier-guard.sh
# Fail-closed guard for staged JS/TS additions that likely introduce invalid
# identifier rename fallout (hyphen in identifier or dot-notation token).
#
# Scope:
# - staged ADDED lines only (--cached, unified=0)
# - files: *.ts, *.tsx, *.js, *.jsx
#
# Exit codes:
# 0 = pass (or assisted explicit override accepted)
# 1 = script/runtime/usage error
# 2 = guard violation (caller must abort in delegated/silent-safe)

usage() {
  cat <<'USAGE'
Usage:
  identifier-guard.sh [--project-root PATH] [--mode delegated|silent-safe|assisted] [--allow-risk-override]

Modes:
  delegated     hard-fail on findings (non-interactive contract)
  silent-safe   hard-fail on findings (non-interactive contract)
  assisted      fail unless explicit risk override is provided

Flags:
  --allow-risk-override   explicit interactive override for assisted mode only
USAGE
}

PROJECT_ROOT=""
MODE="assisted"
ALLOW_RISK_OVERRIDE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-root)
      PROJECT_ROOT="${2:-}"
      shift 2
      ;;
    --mode)
      MODE="${2:-}"
      shift 2
      ;;
    --allow-risk-override)
      ALLOW_RISK_OVERRIDE=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[-] Unknown argument: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$PROJECT_ROOT" ]]; then
  PROJECT_ROOT="$(pwd)"
fi

if [[ "$MODE" != "delegated" && "$MODE" != "silent-safe" && "$MODE" != "assisted" ]]; then
  echo "[-] Invalid --mode: $MODE"
  usage
  exit 1
fi

if ! git -C "$PROJECT_ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[-] Not a git repository: $PROJECT_ROOT"
  exit 1
fi

set +e
FINDINGS="$(
  git -C "$PROJECT_ROOT" diff --cached --unified=0 --diff-filter=AM -- '*.ts' '*.tsx' '*.js' '*.jsx' |
    awk '
      BEGIN {
        file = ""
        line = 0
        found = 0
      }
      /^\+\+\+ b\// {
        file = substr($0, 7)
        next
      }
      /^@@ / {
        if (match($0, /\+[0-9]+/)) {
          line = substr($0, RSTART + 1, RLENGTH - 1) + 0
        }
        next
      }
      /^\+/ && !/^\+\+\+/ {
        raw = substr($0, 2)
        trimmed = raw
        sub(/^[[:space:]]+/, "", trimmed)

        # Skip comment-only additions to reduce false positives.
        if (trimmed ~ /^(\/\/|\/\*|\*|#)/) {
          line++
          next
        }

        decl = (raw ~ /(^|[^[:alnum:]_$])(const|let|var|function|class)[[:space:]]+[[:alpha:]_$][[:alnum:]_$]*-[[:alnum:]_$-]*/)
        dot = (raw ~ /\.[[:alpha:]_$][[:alnum:]_$]*-[[:alnum:]_$-]*/)

        if (decl || dot) {
          kind = decl ? "declaration" : "dot-notation"
          printf("%s:%d:%s:%s\n", file, line, kind, raw)
          found = 1
        }
        line++
        next
      }
      /^-/ && !/^---/ {
        next
      }
      {
        next
      }
      END {
        if (found) {
          exit 42
        }
      }
    '
)"
STATUS=$?
set -e

if [[ $STATUS -eq 0 ]]; then
  echo "[+] identifier_guard: pass"
  echo "identifier_guard=pass"
  exit 0
fi

if [[ $STATUS -ne 42 ]]; then
  echo "[-] identifier_guard: analysis error"
  echo "identifier_guard=error"
  exit 1
fi

echo "[!] identifier_guard: suspicious identifier patterns found in staged additions"
while IFS=: read -r path line kind code; do
  [[ -z "$path" ]] && continue
  echo "  - ${path}:${line} [${kind}] ${code}"
done <<< "$FINDINGS"

case "$MODE" in
  delegated|silent-safe)
    echo "[-] identifier_guard: fail-closed for mode=${MODE}"
    echo "identifier_guard=fail"
    exit 2
    ;;
  assisted)
    if [[ "$ALLOW_RISK_OVERRIDE" == true ]]; then
      echo "[!] identifier_guard: explicit assisted override accepted"
      echo "identifier_guard=warn"
      exit 0
    fi
    echo "[-] identifier_guard: explicit interactive confirmation required"
    echo "identifier_guard=fail"
    echo "hint=rerun with --allow-risk-override only after explicit user confirmation"
    exit 2
    ;;
esac

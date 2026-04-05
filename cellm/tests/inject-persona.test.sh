#!/usr/bin/env bash
# CELLM - Automated test for inject-persona.sh
# Validates: exit code, JSON validity, expected content, graceful skip paths.
#
# Usage: bash cellm-plugin/cellm/tests/inject-persona.test.sh
# Exit: 0 on all tests pass, 1 on first failure

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
INJECT="${PLUGIN_ROOT}/scripts/inject-persona.sh"
PERSONA="${PLUGIN_ROOT}/CELLM-PERSONA.md"

pass=0
fail=0

assert() {
  local label="$1"
  local actual="$2"
  local expected="$3"
  if [[ "${actual}" == "${expected}" ]]; then
    echo "  [+] ${label}"
    pass=$((pass + 1))
  else
    echo "  [-] ${label}"
    echo "      expected: ${expected}"
    echo "      actual:   ${actual}"
    fail=$((fail + 1))
  fi
}

assert_contains() {
  local label="$1"
  local haystack="$2"
  local needle="$3"
  if [[ "${haystack}" == *"${needle}"* ]]; then
    echo "  [+] ${label}"
    pass=$((pass + 1))
  else
    echo "  [-] ${label} — needle not found: ${needle}"
    fail=$((fail + 1))
  fi
}

echo "inject-persona.test.sh"
echo "----------------------"

# Test 1: script exists and is executable
echo "Case 1: script exists and executable"
if [[ -x "${INJECT}" ]]; then
  echo "  [+] script is executable"
  pass=$((pass + 1))
else
  echo "  [-] script missing or not executable: ${INJECT}"
  fail=$((fail + 1))
  exit 1
fi

# Test 2: happy path — persona exists, outputs valid JSON
echo "Case 2: happy path with real persona"
output=$(CLAUDE_PLUGIN_ROOT="${PLUGIN_ROOT}" "${INJECT}" 2>&1)
exit_code=$?
assert "exit code 0" "${exit_code}" "0"

# Validate JSON via python3
if echo "${output}" | python3 -c "import json,sys; d=json.loads(sys.stdin.read()); sys.exit(0)" 2>/dev/null; then
  echo "  [+] stdout is valid JSON"
  pass=$((pass + 1))
else
  echo "  [-] stdout is NOT valid JSON:"
  echo "${output}" | head -c 200
  fail=$((fail + 1))
fi

# Check structure
event_name=$(echo "${output}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read())['hookSpecificOutput']['hookEventName'])" 2>/dev/null || echo "MISSING")
assert "hookEventName is SessionStart" "${event_name}" "SessionStart"

# Check content presence
context=$(echo "${output}" | python3 -c "import json,sys; print(json.loads(sys.stdin.read())['hookSpecificOutput']['additionalContext'])" 2>/dev/null || echo "")
assert_contains "contains Relational Frame" "${context}" "Relational Frame"
assert_contains "contains Signal Vocabulary" "${context}" "Signal Vocabulary"
assert_contains "contains partner/friend framing" "${context}" "partners and friends"
assert_contains "contains ATOM token" "${context}" "ATOM"
assert_contains "contains Wikipedia signal" "${context}" "Wikipedia"

# Test 3: missing persona file — graceful skip
echo "Case 3: missing persona file (graceful skip)"
tmpdir=$(mktemp -d)
output_missing=$(CLAUDE_PLUGIN_ROOT="${tmpdir}" "${INJECT}" 2>&1)
exit_missing=$?
assert "exit code 0 when file missing" "${exit_missing}" "0"
assert "no output when file missing" "${output_missing}" ""
rm -rf "${tmpdir}"

# Test 4: empty persona file — graceful skip
echo "Case 4: empty persona file (graceful skip)"
tmpdir=$(mktemp -d)
touch "${tmpdir}/CELLM-PERSONA.md"
output_empty=$(CLAUDE_PLUGIN_ROOT="${tmpdir}" "${INJECT}" 2>&1)
exit_empty=$?
assert "exit code 0 when file empty" "${exit_empty}" "0"
assert "no output when file empty" "${output_empty}" ""
rm -rf "${tmpdir}"

# Summary
echo "----------------------"
echo "Results: ${pass} pass, ${fail} fail"

if [[ "${fail}" -gt 0 ]]; then
  exit 1
fi
exit 0

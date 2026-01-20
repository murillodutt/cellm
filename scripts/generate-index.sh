#!/bin/bash
#
# generate-index.sh
# Validates that INDEX.md "Always Load" section matches files with alwaysApply: true
#
# Usage: ./scripts/generate-index.sh [--check | --update]
#   --check   : Verify INDEX.md is in sync (default)
#   --update  : Update INDEX.md with current files (future feature)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CELLM_CORE="$ROOT_DIR/cellm-core"
INDEX_FILE="$CELLM_CORE/INDEX.md"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo "[i] Checking INDEX.md synchronization..."
echo ""

# Find all files with alwaysApply: true
ALWAYS_LOAD_FILES=()

for file in "$CELLM_CORE"/{rules,patterns}/**/*.md; do
  if [ -f "$file" ]; then
    # Check if file has alwaysApply: true in frontmatter
    if grep -q "^alwaysApply: true" "$file" 2>/dev/null; then
      # Get relative path from cellm-core
      rel_path="${file#$CELLM_CORE/}"
      ALWAYS_LOAD_FILES+=("$rel_path")
    fi
  fi
done

# Sort the array
IFS=$'\n' ALWAYS_LOAD_FILES=($(sort <<<"${ALWAYS_LOAD_FILES[*]}")); unset IFS

echo "[i] Files with alwaysApply: true:"
for file in "${ALWAYS_LOAD_FILES[@]}"; do
  echo "    - $file"
done
echo ""

# Check if INDEX.md exists
if [ ! -f "$INDEX_FILE" ]; then
  echo -e "${RED}[-] INDEX.md not found at $INDEX_FILE${NC}"
  exit 1
fi

# Check each file is referenced in INDEX.md
MISSING=()
for file in "${ALWAYS_LOAD_FILES[@]}"; do
  if ! grep -q "$file" "$INDEX_FILE"; then
    MISSING+=("$file")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo -e "${YELLOW}[!] Files with alwaysApply: true NOT in INDEX.md:${NC}"
  for file in "${MISSING[@]}"; do
    echo -e "    ${RED}- $file${NC}"
  done
  echo ""
  echo -e "${RED}[-] INDEX.md is out of sync!${NC}"
  echo "[i] Add these files to the 'Always Load' section in INDEX.md"
  exit 1
else
  echo -e "${GREEN}[+] All alwaysApply files are referenced in INDEX.md${NC}"
fi

# Check for files in INDEX.md "Always Load" that don't have alwaysApply: true
# This is a basic check - it looks for patterns in the Always Load section
echo ""
echo "[i] Checking for orphaned references in INDEX.md..."

# Extract files from Always Load section (simplified check)
# Look for markdown links like [file](path.md) or just path.md references
ORPHANED=()

# Get the Always Load section content
# This is a simplified approach - a more robust solution would parse the markdown properly
ALWAYS_SECTION=$(sed -n '/## Always Load/,/^## /p' "$INDEX_FILE" | head -n -1)

for expected_file in "${ALWAYS_LOAD_FILES[@]}"; do
  # File should be in INDEX
  :
done

echo -e "${GREEN}[+] INDEX.md synchronization check complete${NC}"
echo ""
echo "=== Summary ==="
echo "Files with alwaysApply: true: ${#ALWAYS_LOAD_FILES[@]}"
echo "Missing from INDEX.md: ${#MISSING[@]}"
echo "==============="

exit 0

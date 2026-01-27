#!/usr/bin/env bash
# sync-docs.sh - Synchronize documentation from cellm-plugin to public repository
#
# Usage: ./scripts/sync-docs.sh /path/to/cellm-public
#
# This script copies documentation from the plugin (source of truth) to the
# public repository for distribution.
#
# Mapping:
#   cellm-plugin/docs/           -> .github/docs/
#   cellm-plugin/README.md       -> cellm/README.md
#   cellm-plugin/CHANGELOG.md    -> cellm/CHANGELOG.md
#   cellm-plugin/docs/contributing.md -> .github/CONTRIBUTING.md

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${GREEN}[+]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error() { echo -e "${RED}[-]${NC} $1"; }

# Validate arguments
if [[ $# -lt 1 ]]; then
    log_error "Usage: $0 /path/to/cellm-public"
    exit 1
fi

PUBLIC_REPO="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(dirname "$SCRIPT_DIR")"

# Validate paths
if [[ ! -d "$PUBLIC_REPO" ]]; then
    log_error "Public repository not found: $PUBLIC_REPO"
    exit 1
fi

if [[ ! -d "$PUBLIC_REPO/.github" ]]; then
    log_error "Not a valid public repository (missing .github/): $PUBLIC_REPO"
    exit 1
fi

if [[ ! -d "$PLUGIN_DIR/docs" ]]; then
    log_error "Plugin docs directory not found: $PLUGIN_DIR/docs"
    exit 1
fi

log_info "Syncing documentation from cellm-plugin to public repository"
log_info "Source: $PLUGIN_DIR"
log_info "Target: $PUBLIC_REPO"
echo ""

# Create target directories if needed
mkdir -p "$PUBLIC_REPO/.github/docs"
mkdir -p "$PUBLIC_REPO/cellm"

# Sync docs/ -> .github/docs/
log_info "Syncing docs/ -> .github/docs/"
if [[ -d "$PLUGIN_DIR/docs" ]]; then
    # Copy all markdown files, converting to uppercase for public repo convention
    for file in "$PLUGIN_DIR/docs"/*.md; do
        if [[ -f "$file" ]]; then
            filename=$(basename "$file")
            # Convert filename to UPPERCASE.md for public repo (except README which becomes INDEX)
            if [[ "$filename" == "README.md" ]]; then
                target_name="INDEX.md"
            else
                # Get name without extension, uppercase it, add .md extension
                base_name="${filename%.md}"
                upper_name=$(echo "$base_name" | tr '[:lower:]' '[:upper:]')
                target_name="${upper_name}.md"
            fi
            cp "$file" "$PUBLIC_REPO/.github/docs/$target_name"
            log_info "  $filename -> .github/docs/$target_name"
        fi
    done
fi

# Sync README.md -> cellm/README.md
log_info "Syncing README.md -> cellm/README.md"
if [[ -f "$PLUGIN_DIR/README.md" ]]; then
    cp "$PLUGIN_DIR/README.md" "$PUBLIC_REPO/cellm/README.md"
    log_info "  README.md -> cellm/README.md"
fi

# Sync CHANGELOG.md -> cellm/CHANGELOG.md
log_info "Syncing CHANGELOG.md -> cellm/CHANGELOG.md"
if [[ -f "$PLUGIN_DIR/CHANGELOG.md" ]]; then
    cp "$PLUGIN_DIR/CHANGELOG.md" "$PUBLIC_REPO/cellm/CHANGELOG.md"
    log_info "  CHANGELOG.md -> cellm/CHANGELOG.md"
fi

# Sync contributing.md -> .github/CONTRIBUTING.md
log_info "Syncing contributing.md -> .github/CONTRIBUTING.md"
if [[ -f "$PLUGIN_DIR/docs/contributing.md" ]]; then
    cp "$PLUGIN_DIR/docs/contributing.md" "$PUBLIC_REPO/.github/CONTRIBUTING.md"
    log_info "  docs/contributing.md -> .github/CONTRIBUTING.md"
fi

echo ""
log_info "Documentation sync complete!"
echo ""
log_info "Files synced to $PUBLIC_REPO:"
echo "  - .github/docs/ (all documentation)"
echo "  - cellm/README.md (plugin readme)"
echo "  - cellm/CHANGELOG.md (version history)"
echo "  - .github/CONTRIBUTING.md (contribution guide)"
echo ""
log_warn "Remember to commit and push changes in the public repository"

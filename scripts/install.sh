#!/bin/bash
# =============================================================================
# CELLM Installation Script
# Main entry point for CELLM installation
# 
# Website: https://cellm.ai
# Repository: https://github.com/murillodutt/cellm
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VERSION="0.10.0"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                 CELLM Installer v${VERSION}                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Show help
show_help() {
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  base          Install CELLM to ~/.cellm (first-time setup)"
    echo "  project       Install CELLM to current project (.claude/)"
    echo "  help          Show this help message"
    echo ""
    echo "If no command is specified, the script will auto-detect:"
    echo "  - If ~/.cellm doesn't exist → runs base installation"
    echo "  - If in a project directory → runs project installation"
    echo ""
    echo "Options are passed through to the specific installer."
    echo ""
    echo "Examples:"
    echo "  $0                          # Auto-detect installation type"
    echo "  $0 base                     # Install to ~/.cellm"
    echo "  $0 project                  # Install to current project"
    echo "  $0 project --profile nuxt   # Install with specific profile"
    echo ""
    echo "For more options, run:"
    echo "  $0 base --help"
    echo "  $0 project --help"
    echo ""
}

# Auto-detect installation type
auto_detect() {
    local cellm_base="$HOME/.cellm"

    # Check if CELLM base is installed
    if [ ! -d "$cellm_base" ]; then
        print_info "CELLM not installed. Running base installation..."
        echo ""
        exec "$SCRIPT_DIR/base-install.sh" "$@"
    fi

    # Check if we're in a project directory
    if [ -f "package.json" ] || [ -f "nuxt.config.ts" ] || [ -f "tsconfig.json" ]; then
        print_info "Project detected. Running project installation..."
        echo ""
        exec "$SCRIPT_DIR/project-install.sh" "$@"
    fi

    # Can't auto-detect
    echo "Could not auto-detect installation type."
    echo ""
    echo "Please specify:"
    echo "  $0 base      # Install CELLM to ~/.cellm"
    echo "  $0 project   # Install CELLM to current project"
    echo ""
    exit 1
}

# Main
main() {
    case "${1:-}" in
        base)
            shift
            exec "$SCRIPT_DIR/base-install.sh" "$@"
            ;;
        project)
            shift
            exec "$SCRIPT_DIR/project-install.sh" "$@"
            ;;
        help|--help|-h)
            print_header
            show_help
            exit 0
            ;;
        "")
            print_header
            auto_detect "$@"
            ;;
        *)
            print_header
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"

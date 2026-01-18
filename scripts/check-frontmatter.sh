#!/bin/bash
# =============================================================================
# CELLM Frontmatter Checker
# Validates YAML frontmatter in markdown files
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
CYAN='\033[0;36m'
NC='\033[0m'

# Counters
TOTAL=0
VALID=0
INVALID=0
WARNINGS=0

# Options
VERBOSE=false
FIX_MODE=false
TARGET_DIR=""

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              CELLM Frontmatter Checker                       ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_pass() {
    echo -e "${GREEN}  [+] $1${NC}"
    VALID=$((VALID + 1))
    TOTAL=$((TOTAL + 1))
}

check_fail() {
    echo -e "${RED}  [-] $1${NC}"
    INVALID=$((INVALID + 1))
    TOTAL=$((TOTAL + 1))
}

check_warn() {
    echo -e "${YELLOW}  [!] $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}    $1${NC}"
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [directory] [options]"
    echo ""
    echo "Arguments:"
    echo "  directory            Directory to check (default: cellm-core)"
    echo ""
    echo "Options:"
    echo "  --verbose            Show detailed validation output"
    echo "  --fix                Attempt to fix common issues (experimental)"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                             # Check cellm-core/"
    echo "  $0 ./my-project/.claude        # Check specific directory"
    echo "  $0 --verbose                   # Verbose output"
    echo ""
    echo "Exit codes:"
    echo "  0 - All files valid"
    echo "  1 - Some files have errors"
    echo ""
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --verbose)
                VERBOSE=true
                shift
                ;;
            --fix)
                FIX_MODE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                TARGET_DIR="$1"
                shift
                ;;
        esac
    done

    # Default directory
    if [ -z "$TARGET_DIR" ]; then
        if [ -d "cellm-core" ]; then
            TARGET_DIR="cellm-core"
        elif [ -d ".claude" ]; then
            TARGET_DIR=".claude"
        else
            echo "No target directory found. Specify one or run from CELLM root."
            exit 1
        fi
    fi
}

# Extract frontmatter from file
extract_frontmatter() {
    local file="$1"
    awk '/^---$/{p++; next} p==1' "$file"
}

# Check if file has frontmatter
has_frontmatter() {
    local file="$1"
    head -1 "$file" | grep -q "^---$"
}

# Get YAML value
get_yaml_value() {
    local frontmatter="$1"
    local key="$2"
    echo "$frontmatter" | grep "^${key}:" | sed "s/^${key}:[[:space:]]*//" | tr -d '"' | tr -d "'"
}

# Validate rule frontmatter
validate_rule() {
    local file="$1"
    local frontmatter="$2"
    local basename=$(basename "$file")
    local errors=0

    # Required: id
    local id=$(get_yaml_value "$frontmatter" "id")
    if [ -z "$id" ]; then
        check_fail "$basename - missing 'id'"
        errors=1
    elif ! [[ "$id" =~ ^[A-Z][A-Z0-9-]*[0-9]{3}$ ]]; then
        check_fail "$basename - invalid id '$id' (expected: CONV-001, DOM-FE-001)"
        errors=1
    fi

    # Must have alwaysApply or paths
    local alwaysApply=$(get_yaml_value "$frontmatter" "alwaysApply")
    local paths=$(echo "$frontmatter" | grep "^paths:")
    if [ "$alwaysApply" != "true" ] && [ -z "$paths" ]; then
        check_warn "$basename - should have 'alwaysApply: true' or 'paths:[]'"
    fi

    # Optional: version format
    local version=$(get_yaml_value "$frontmatter" "version")
    if [ -n "$version" ] && ! [[ "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        print_verbose "$basename - version '$version' doesn't match vX.Y.Z format"
    fi

    if [ $errors -eq 0 ]; then
        check_pass "$basename"
    fi

    return $errors
}

# Validate pattern frontmatter
validate_pattern() {
    local file="$1"
    local frontmatter="$2"
    local basename=$(basename "$file")
    local errors=0

    # Required: id
    local id=$(get_yaml_value "$frontmatter" "id")
    if [ -z "$id" ]; then
        check_fail "$basename - missing 'id'"
        errors=1
    elif ! [[ "$id" =~ ^[A-Z][A-Z0-9]+-INDEX$ ]] && ! [[ "$id" =~ ^[A-Z][A-Z0-9]*-[0-9]{3}$ ]]; then
        check_fail "$basename - invalid id '$id' (expected: TS-INDEX, ANTI-001)"
        errors=1
    fi

    # Optional: severity validation
    local severity=$(get_yaml_value "$frontmatter" "severity")
    if [ -n "$severity" ]; then
        case "$severity" in
            critical|warning|info) ;;
            *) check_warn "$basename - invalid severity '$severity'" ;;
        esac
    fi

    if [ $errors -eq 0 ]; then
        check_pass "$basename"
    fi

    return $errors
}

# Validate workflow frontmatter
validate_workflow() {
    local file="$1"
    local frontmatter="$2"
    local basename=$(basename "$file")
    local errors=0

    # Required: workflow
    local workflow=$(get_yaml_value "$frontmatter" "workflow")
    if [ -z "$workflow" ]; then
        check_fail "$basename - missing 'workflow'"
        errors=1
    elif ! [[ "$workflow" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
        check_fail "$basename - invalid workflow '$workflow' (must be kebab-case)"
        errors=1
    fi

    # Required: phase
    local phase=$(get_yaml_value "$frontmatter" "phase")
    if [ -z "$phase" ]; then
        check_fail "$basename - missing 'phase'"
        errors=1
    else
        case "$phase" in
            planning|specification|implementation|verification) ;;
            *) check_fail "$basename - invalid phase '$phase'"; errors=1 ;;
        esac
    fi

    # Required: agent
    local agent=$(get_yaml_value "$frontmatter" "agent")
    if [ -z "$agent" ]; then
        check_fail "$basename - missing 'agent'"
        errors=1
    else
        case "$agent" in
            architect|implementer|reviewer|project-manager) ;;
            *) check_fail "$basename - invalid agent '$agent'"; errors=1 ;;
        esac
    fi

    if [ $errors -eq 0 ]; then
        check_pass "$basename"
    fi

    return $errors
}

# Validate command frontmatter
validate_command() {
    local file="$1"
    local frontmatter="$2"
    local basename=$(basename "$file")
    local errors=0

    # Required: command
    local command=$(get_yaml_value "$frontmatter" "command")
    if [ -z "$command" ]; then
        check_fail "$basename - missing 'command'"
        errors=1
    elif ! [[ "$command" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
        check_fail "$basename - invalid command '$command' (must be kebab-case)"
        errors=1
    fi

    # Required: agent
    local agent=$(get_yaml_value "$frontmatter" "agent")
    if [ -z "$agent" ]; then
        check_fail "$basename - missing 'agent'"
        errors=1
    else
        case "$agent" in
            architect|implementer|reviewer|project-manager) ;;
            *) check_fail "$basename - invalid agent '$agent'"; errors=1 ;;
        esac
    fi

    if [ $errors -eq 0 ]; then
        check_pass "$basename"
    fi

    return $errors
}

# Validate agent frontmatter
validate_agent() {
    local file="$1"
    local frontmatter="$2"
    local basename=$(basename "$file")
    local errors=0

    # Required: agent
    local agent=$(get_yaml_value "$frontmatter" "agent")
    if [ -z "$agent" ]; then
        check_fail "$basename - missing 'agent'"
        errors=1
    else
        case "$agent" in
            architect|implementer|reviewer|project-manager) ;;
            *) check_fail "$basename - invalid agent '$agent'"; errors=1 ;;
        esac
    fi

    # Required: triggers
    local triggers=$(echo "$frontmatter" | grep "^triggers:")
    if [ -z "$triggers" ]; then
        check_fail "$basename - missing 'triggers'"
        errors=1
    fi

    if [ $errors -eq 0 ]; then
        check_pass "$basename"
    fi

    return $errors
}

# Validate skill frontmatter
validate_skill() {
    local file="$1"
    local frontmatter="$2"
    local basename=$(basename "$file")
    local errors=0

    # Required: skill
    local skill=$(get_yaml_value "$frontmatter" "skill")
    if [ -z "$skill" ]; then
        check_fail "$basename - missing 'skill'"
        errors=1
    elif ! [[ "$skill" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
        check_fail "$basename - invalid skill '$skill' (must be kebab-case)"
        errors=1
    fi

    # Required: triggers
    local triggers=$(echo "$frontmatter" | grep "^triggers:")
    if [ -z "$triggers" ]; then
        check_fail "$basename - missing 'triggers'"
        errors=1
    fi

    if [ $errors -eq 0 ]; then
        check_pass "$basename"
    fi

    return $errors
}

# Check a single file
check_file() {
    local file="$1"

    # Skip non-markdown files
    [[ "$file" != *.md ]] && return 0

    # Skip README and template files
    [[ "$file" == *"README"* ]] && return 0
    [[ "$file" == *"templates/"* ]] && return 0

    # Check if file has frontmatter
    if ! has_frontmatter "$file"; then
        print_verbose "$(basename "$file") - no frontmatter (skipped)"
        return 0
    fi

    # Extract frontmatter
    local frontmatter=$(extract_frontmatter "$file")

    # Determine type based on path
    if [[ "$file" == *"/rules/"* ]]; then
        validate_rule "$file" "$frontmatter"
    elif [[ "$file" == *"/patterns/"* ]]; then
        validate_pattern "$file" "$frontmatter"
    elif [[ "$file" == *"/workflows/"* ]]; then
        validate_workflow "$file" "$frontmatter"
    elif [[ "$file" == *"/commands/"* ]]; then
        validate_command "$file" "$frontmatter"
    elif [[ "$file" == *"/agents/"* ]]; then
        validate_agent "$file" "$frontmatter"
    elif [[ "$file" == *"/skills/"* ]]; then
        validate_skill "$file" "$frontmatter"
    else
        print_verbose "$(basename "$file") - unknown type (skipped)"
    fi
}

# Show summary
show_summary() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""

    if [ $INVALID -eq 0 ]; then
        echo -e "${GREEN}[+] All frontmatter valid${NC}"
    else
        echo -e "${RED}[-] Validation failed${NC}"
    fi

    echo ""
    echo "  Total files: $TOTAL"
    echo "  Valid: $VALID"
    echo "  Invalid: $INVALID"
    echo "  Warnings: $WARNINGS"
    echo ""

    if [ $INVALID -gt 0 ]; then
        exit 1
    fi
}

# Main
main() {
    parse_args "$@"
    print_header

    echo "Directory: $TARGET_DIR"
    echo ""

    # Check rules
    if [ -d "$TARGET_DIR/rules" ]; then
        echo -e "${BLUE}▸ Rules${NC}"
        while IFS= read -r -d '' file; do
            check_file "$file"
        done < <(find "$TARGET_DIR/rules" -name "*.md" -type f -print0 2>/dev/null)
        echo ""
    fi

    # Check patterns
    if [ -d "$TARGET_DIR/patterns" ]; then
        echo -e "${BLUE}▸ Patterns${NC}"
        while IFS= read -r -d '' file; do
            check_file "$file"
        done < <(find "$TARGET_DIR/patterns" -name "*.md" -type f -print0 2>/dev/null)
        echo ""
    fi

    # Check workflows
    if [ -d "$TARGET_DIR/workflows" ]; then
        echo -e "${BLUE}▸ Workflows${NC}"
        for file in "$TARGET_DIR/workflows"/*.md; do
            [ -f "$file" ] && check_file "$file"
        done
        echo ""
    fi

    # Check commands
    if [ -d "$TARGET_DIR/commands" ]; then
        echo -e "${BLUE}▸ Commands${NC}"
        for file in "$TARGET_DIR/commands"/*.md; do
            [ -f "$file" ] && check_file "$file"
        done
        echo ""
    fi

    # Check agents
    if [ -d "$TARGET_DIR/agents" ]; then
        echo -e "${BLUE}▸ Agents${NC}"
        for file in "$TARGET_DIR/agents"/*.md; do
            [ -f "$file" ] && check_file "$file"
        done
        echo ""
    fi

    # Check skills
    if [ -d "$TARGET_DIR/skills" ]; then
        echo -e "${BLUE}▸ Skills${NC}"
        for file in "$TARGET_DIR/skills"/*.md; do
            [ -f "$file" ] && check_file "$file"
        done
        echo ""
    fi

    show_summary
}

main "$@"

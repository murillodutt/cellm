#!/bin/bash
# =============================================================================
# CELLM Compile Script
# Compiles CELLM profiles from cellm-core into deployable format
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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CELLM_ROOT="$(dirname "$SCRIPT_DIR")"
CELLM_CORE="$CELLM_ROOT/cellm-core"
VERSION="0.10.0"

# Default options
PROFILE="default"
OUTPUT_DIR=""
INCLUDE_RULES=true
INCLUDE_PATTERNS=true
INCLUDE_COMMANDS=true
INCLUDE_WORKFLOWS=true
INCLUDE_AGENTS=true
INCLUDE_SKILLS=true
MINIFY=false
VERBOSE=false

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                CELLM Compiler v${VERSION}                         ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}[+] $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}[!] $1${NC}"
}

print_error() {
    echo -e "${RED}[-] $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}  $1${NC}"
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [profile] [output-dir] [options]"
    echo ""
    echo "Arguments:"
    echo "  profile              Profile name to compile (default: default)"
    echo "  output-dir           Output directory (default: ./compiled/<profile>)"
    echo ""
    echo "Options:"
    echo "  --no-rules           Exclude rules from compilation"
    echo "  --no-patterns        Exclude patterns from compilation"
    echo "  --no-commands        Exclude commands from compilation"
    echo "  --no-workflows       Exclude workflows from compilation"
    echo "  --no-agents          Exclude agents from compilation"
    echo "  --no-skills          Exclude skills from compilation"
    echo "  --minify             Remove comments and extra whitespace"
    echo "  --verbose            Show detailed output"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Compile default profile"
    echo "  $0 nuxt-saas ./dist                  # Compile nuxt-saas to ./dist"
    echo "  $0 default --no-skills --minify     # Compile without skills, minified"
    echo ""
}

# Parse arguments
parse_args() {
    local positional=()

    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-rules)
                INCLUDE_RULES=false
                shift
                ;;
            --no-patterns)
                INCLUDE_PATTERNS=false
                shift
                ;;
            --no-commands)
                INCLUDE_COMMANDS=false
                shift
                ;;
            --no-workflows)
                INCLUDE_WORKFLOWS=false
                shift
                ;;
            --no-agents)
                INCLUDE_AGENTS=false
                shift
                ;;
            --no-skills)
                INCLUDE_SKILLS=false
                shift
                ;;
            --minify)
                MINIFY=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                positional+=("$1")
                shift
                ;;
        esac
    done

    # Set positional arguments
    if [ ${#positional[@]} -ge 1 ]; then
        PROFILE="${positional[0]}"
    fi

    if [ ${#positional[@]} -ge 2 ]; then
        OUTPUT_DIR="${positional[1]}"
    else
        OUTPUT_DIR="$CELLM_ROOT/compiled/$PROFILE"
    fi
}

# Validate source exists
validate_source() {
    if [ ! -d "$CELLM_CORE" ]; then
        print_error "CELLM core not found at: $CELLM_CORE"
        echo "  Run this script from the CELLM repository root."
        exit 1
    fi

    print_success "Source: $CELLM_CORE"
}

# Create output structure
create_output_structure() {
    print_info "Creating output structure..."

    mkdir -p "$OUTPUT_DIR"

    [ "$INCLUDE_RULES" = true ] && mkdir -p "$OUTPUT_DIR/rules/core" "$OUTPUT_DIR/rules/domain"
    [ "$INCLUDE_PATTERNS" = true ] && mkdir -p "$OUTPUT_DIR/patterns/core" "$OUTPUT_DIR/patterns/anti"
    [ "$INCLUDE_COMMANDS" = true ] && mkdir -p "$OUTPUT_DIR/commands"
    [ "$INCLUDE_WORKFLOWS" = true ] && mkdir -p "$OUTPUT_DIR/workflows"
    [ "$INCLUDE_AGENTS" = true ] && mkdir -p "$OUTPUT_DIR/agents"
    [ "$INCLUDE_SKILLS" = true ] && mkdir -p "$OUTPUT_DIR/skills"

    print_success "Output: $OUTPUT_DIR"
}

# Process markdown file (optionally minify)
process_file() {
    local src="$1"
    local dst="$2"

    if [ "$MINIFY" = true ]; then
        # Remove HTML comments, empty lines, and trailing whitespace
        sed -e 's/<!--.*-->//g' -e '/^[[:space:]]*$/d' -e 's/[[:space:]]*$//' "$src" > "$dst"
    else
        cp "$src" "$dst"
    fi

    print_verbose "Processed: $(basename "$src")"
}

# Compile rules
compile_rules() {
    if [ "$INCLUDE_RULES" != true ]; then
        print_warning "Rules: skipped"
        return
    fi

    local count=0

    # Core rules
    if [ -d "$CELLM_CORE/rules/core" ]; then
        for file in "$CELLM_CORE/rules/core"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/rules/core/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    # Domain rules
    if [ -d "$CELLM_CORE/rules/domain" ]; then
        for file in "$CELLM_CORE/rules/domain"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/rules/domain/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    print_success "Rules: $count files"
}

# Compile patterns
compile_patterns() {
    if [ "$INCLUDE_PATTERNS" != true ]; then
        print_warning "Patterns: skipped"
        return
    fi

    local count=0

    # Core patterns
    if [ -d "$CELLM_CORE/patterns/core" ]; then
        for file in "$CELLM_CORE/patterns/core"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/patterns/core/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    # Anti-patterns
    if [ -d "$CELLM_CORE/patterns/anti" ]; then
        for file in "$CELLM_CORE/patterns/anti"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/patterns/anti/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    # Pattern index
    if [ -f "$CELLM_CORE/patterns/index.md" ]; then
        process_file "$CELLM_CORE/patterns/index.md" "$OUTPUT_DIR/patterns/index.md"
        count=$((count + 1))
    fi

    print_success "Patterns: $count files"
}

# Compile commands
compile_commands() {
    if [ "$INCLUDE_COMMANDS" != true ]; then
        print_warning "Commands: skipped"
        return
    fi

    local count=0

    if [ -d "$CELLM_CORE/commands" ]; then
        for file in "$CELLM_CORE/commands"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/commands/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    print_success "Commands: $count files"
}

# Compile workflows
compile_workflows() {
    if [ "$INCLUDE_WORKFLOWS" != true ]; then
        print_warning "Workflows: skipped"
        return
    fi

    local count=0

    if [ -d "$CELLM_CORE/workflows" ]; then
        for file in "$CELLM_CORE/workflows"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/workflows/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    print_success "Workflows: $count files"
}

# Compile agents
compile_agents() {
    if [ "$INCLUDE_AGENTS" != true ]; then
        print_warning "Agents: skipped"
        return
    fi

    local count=0

    if [ -d "$CELLM_CORE/agents" ]; then
        for file in "$CELLM_CORE/agents"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/agents/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    print_success "Agents: $count files"
}

# Compile skills
compile_skills() {
    if [ "$INCLUDE_SKILLS" != true ]; then
        print_warning "Skills: skipped"
        return
    fi

    local count=0

    if [ -d "$CELLM_CORE/skills" ]; then
        for file in "$CELLM_CORE/skills"/*.md; do
            if [ -f "$file" ]; then
                process_file "$file" "$OUTPUT_DIR/skills/$(basename "$file")"
                count=$((count + 1))
            fi
        done
    fi

    print_success "Skills: $count files"
}

# Copy INDEX.md
copy_index() {
    if [ -f "$CELLM_CORE/INDEX.md" ]; then
        process_file "$CELLM_CORE/INDEX.md" "$OUTPUT_DIR/INDEX.md"
        print_success "INDEX.md: copied"
    fi
}

# Generate manifest
generate_manifest() {
    local manifest="$OUTPUT_DIR/manifest.json"

    cat > "$manifest" << EOF
{
  "cellm": "$VERSION",
  "profile": "$PROFILE",
  "compiled": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "options": {
    "rules": $INCLUDE_RULES,
    "patterns": $INCLUDE_PATTERNS,
    "commands": $INCLUDE_COMMANDS,
    "workflows": $INCLUDE_WORKFLOWS,
    "agents": $INCLUDE_AGENTS,
    "skills": $INCLUDE_SKILLS,
    "minified": $MINIFY
  },
  "counts": {
    "rules": $(find "$OUTPUT_DIR/rules" -name "*.md" 2>/dev/null | wc -l | tr -d ' '),
    "patterns": $(find "$OUTPUT_DIR/patterns" -name "*.md" 2>/dev/null | wc -l | tr -d ' '),
    "commands": $(find "$OUTPUT_DIR/commands" -name "*.md" 2>/dev/null | wc -l | tr -d ' '),
    "workflows": $(find "$OUTPUT_DIR/workflows" -name "*.md" 2>/dev/null | wc -l | tr -d ' '),
    "agents": $(find "$OUTPUT_DIR/agents" -name "*.md" 2>/dev/null | wc -l | tr -d ' '),
    "skills": $(find "$OUTPUT_DIR/skills" -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
  }
}
EOF

    print_success "Manifest: generated"
}

# Calculate total size
show_summary() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"

    local total_files=$(find "$OUTPUT_DIR" -name "*.md" | wc -l | tr -d ' ')
    local total_size=$(du -sh "$OUTPUT_DIR" | cut -f1)

    echo ""
    echo -e "${GREEN}[+] Compilation Complete${NC}"
    echo ""
    echo "  Profile: $PROFILE"
    echo "  Output: $OUTPUT_DIR"
    echo "  Files: $total_files markdown files"
    echo "  Size: $total_size"
    echo ""
}

# Main
main() {
    parse_args "$@"
    print_header

    echo "Profile: $PROFILE"
    echo ""

    validate_source
    create_output_structure

    echo ""
    print_info "Compiling artifacts..."
    echo ""

    compile_rules
    compile_patterns
    compile_commands
    compile_workflows
    compile_agents
    compile_skills
    copy_index
    generate_manifest

    show_summary
}

main "$@"

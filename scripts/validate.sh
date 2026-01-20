#!/bin/bash
# =============================================================================
# CELLM Validation Script
# Validates CELLM structure, schemas, and files
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
ERRORS=0
WARNINGS=0
CHECKS=0

# Schema directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$(dirname "$SCRIPT_DIR")/schemas"

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                  CELLM Validation                            ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_pass() {
    echo -e "${GREEN}  [+] $1${NC}"
    CHECKS=$((CHECKS + 1))
}

check_fail() {
    echo -e "${RED}  [-] $1${NC}"
    ERRORS=$((ERRORS + 1))
    CHECKS=$((CHECKS + 1))
}

check_warn() {
    echo -e "${YELLOW}  [!] $1${NC}"
    WARNINGS=$((WARNINGS + 1))
    CHECKS=$((CHECKS + 1))
}

section() {
    echo ""
    echo -e "${BLUE}▸ $1${NC}"
}

# Detect context (base installation or project)
detect_context() {
    if [ -d "$HOME/.cellm" ] && [ "$(pwd)" = "$HOME/.cellm" ]; then
        CONTEXT="base"
        CELLM_DIR="$HOME/.cellm"
    elif [ -d "cellm-core" ]; then
        # Development context takes priority over project context
        CONTEXT="development"
        CELLM_DIR="cellm-core"
    elif [ -d ".claude" ]; then
        CONTEXT="project"
        CELLM_DIR=".claude"
    else
        echo "Could not detect CELLM context."
        echo "Run this from:"
        echo "  - ~/.cellm (base installation)"
        echo "  - A project with .claude/ directory"
        echo "  - The CELLM development repository"
        exit 1
    fi
    
    echo "Context: $CONTEXT"
    echo "Directory: $CELLM_DIR"
}

# Validate directory structure
validate_structure() {
    section "Directory Structure"
    
    case $CONTEXT in
        base)
            REQUIRED_DIRS=("profiles" "scripts" "profiles/default")
            ;;
        project)
            REQUIRED_DIRS=("commands" "project")
            ;;
        development)
            REQUIRED_DIRS=("rules" "patterns" "commands" "workflows" "agents" "skills")
            ;;
    esac
    
    for dir in "${REQUIRED_DIRS[@]}"; do
        if [ -d "$CELLM_DIR/$dir" ]; then
            check_pass "$dir/"
        else
            check_fail "$dir/ missing"
        fi
    done
}

# Extract YAML value from frontmatter
get_yaml_value() {
    local frontmatter="$1"
    local key="$2"
    echo "$frontmatter" | grep "^${key}:" | sed "s/^${key}:[[:space:]]*//" | tr -d '"' | tr -d "'"
}

# Validate ID pattern
validate_id_pattern() {
    local id="$1"
    local type="$2"

    case $type in
        rule)
            # Pattern: CONV-001, LIM-001, DOM-FE-001, etc.
            if [[ "$id" =~ ^[A-Z][A-Z0-9-]*[0-9]{3}$ ]]; then
                return 0
            fi
            ;;
        pattern)
            # Pattern: TS-INDEX, ANTI-001, PATTERNS-INDEX, NX-DATA, TS-CORE, etc.
            if [[ "$id" =~ ^[A-Z][A-Z0-9]+-INDEX$ ]] || [[ "$id" =~ ^[A-Z][A-Z0-9]*-[0-9]{3}$ ]] || [[ "$id" =~ ^[A-Z][A-Z0-9]+-[A-Z]+$ ]]; then
                return 0
            fi
            ;;
    esac
    return 1
}

# Validate agent name
validate_agent() {
    local agent="$1"
    case "$agent" in
        architect|implementer|reviewer|project-manager)
            return 0
            ;;
    esac
    return 1
}

# Validate phase
validate_phase() {
    local phase="$1"
    case "$phase" in
        planning|specification|implementation|verification)
            return 0
            ;;
    esac
    return 1
}

# Validate kebab-case
validate_kebab_case() {
    local value="$1"
    if [[ "$value" =~ ^[a-z]+(-[a-z]+)*$ ]]; then
        return 0
    fi
    return 1
}

# Validate frontmatter against schema
validate_file_schema() {
    local file="$1"
    local type="$2"
    local frontmatter="$3"
    local basename=$(basename "$file")
    local errors=0

    case $type in
        rule)
            # Required: id
            local id=$(get_yaml_value "$frontmatter" "id")
            if [ -z "$id" ]; then
                check_fail "$basename - missing required field 'id'"
                errors=1
            elif ! validate_id_pattern "$id" "rule"; then
                check_fail "$basename - invalid id pattern '$id' (expected: CONV-001, DOM-FE-001)"
                errors=1
            fi

            # Must have alwaysApply:true OR paths:[]
            local alwaysApply=$(get_yaml_value "$frontmatter" "alwaysApply")
            local paths=$(echo "$frontmatter" | grep "^paths:")
            if [ "$alwaysApply" != "true" ] && [ -z "$paths" ]; then
                check_warn "$basename - should have 'alwaysApply: true' or 'paths:[]'"
            fi
            ;;

        pattern)
            # Required: id
            local id=$(get_yaml_value "$frontmatter" "id")
            if [ -z "$id" ]; then
                check_fail "$basename - missing required field 'id'"
                errors=1
            elif ! validate_id_pattern "$id" "pattern"; then
                check_fail "$basename - invalid id pattern '$id' (expected: TS-INDEX, ANTI-001)"
                errors=1
            fi

            # Optional: severity validation
            local severity=$(get_yaml_value "$frontmatter" "severity")
            if [ -n "$severity" ]; then
                case "$severity" in
                    critical|warning|info) ;;
                    *) check_warn "$basename - invalid severity '$severity' (expected: critical, warning, info)" ;;
                esac
            fi
            ;;

        workflow)
            # Required: workflow, phase, agent
            local workflow=$(get_yaml_value "$frontmatter" "workflow")
            local phase=$(get_yaml_value "$frontmatter" "phase")
            local agent=$(get_yaml_value "$frontmatter" "agent")

            if [ -z "$workflow" ]; then
                check_fail "$basename - missing required field 'workflow'"
                errors=1
            elif ! validate_kebab_case "$workflow"; then
                check_fail "$basename - invalid workflow name '$workflow' (must be kebab-case)"
                errors=1
            fi

            if [ -z "$phase" ]; then
                check_fail "$basename - missing required field 'phase'"
                errors=1
            elif ! validate_phase "$phase"; then
                check_fail "$basename - invalid phase '$phase' (expected: planning, specification, implementation, verification)"
                errors=1
            fi

            if [ -z "$agent" ]; then
                check_fail "$basename - missing required field 'agent'"
                errors=1
            elif ! validate_agent "$agent"; then
                check_fail "$basename - invalid agent '$agent' (expected: architect, implementer, reviewer, project-manager)"
                errors=1
            fi
            ;;

        command)
            # Required: command, agent
            local command=$(get_yaml_value "$frontmatter" "command")
            local agent=$(get_yaml_value "$frontmatter" "agent")

            if [ -z "$command" ]; then
                check_fail "$basename - missing required field 'command'"
                errors=1
            elif ! validate_kebab_case "$command"; then
                check_fail "$basename - invalid command name '$command' (must be kebab-case)"
                errors=1
            fi

            if [ -z "$agent" ]; then
                check_fail "$basename - missing required field 'agent'"
                errors=1
            elif ! validate_agent "$agent"; then
                check_fail "$basename - invalid agent '$agent' (expected: architect, implementer, reviewer, project-manager)"
                errors=1
            fi
            ;;

        agent)
            # Required: agent, triggers
            local agent=$(get_yaml_value "$frontmatter" "agent")
            local triggers=$(echo "$frontmatter" | grep "^triggers:")

            if [ -z "$agent" ]; then
                check_fail "$basename - missing required field 'agent'"
                errors=1
            elif ! validate_agent "$agent"; then
                check_fail "$basename - invalid agent '$agent' (expected: architect, implementer, reviewer, project-manager)"
                errors=1
            fi

            if [ -z "$triggers" ]; then
                check_fail "$basename - missing required field 'triggers'"
                errors=1
            fi
            ;;

        skill)
            # Required: skill, triggers
            local skill=$(get_yaml_value "$frontmatter" "skill")
            local triggers=$(echo "$frontmatter" | grep "^triggers:")

            if [ -z "$skill" ]; then
                check_fail "$basename - missing required field 'skill'"
                errors=1
            elif ! validate_kebab_case "$skill"; then
                check_fail "$basename - invalid skill name '$skill' (must be kebab-case)"
                errors=1
            fi

            if [ -z "$triggers" ]; then
                check_fail "$basename - missing required field 'triggers'"
                errors=1
            fi
            ;;
    esac

    return $errors
}

# Validate frontmatter in markdown files
validate_frontmatter() {
    section "Frontmatter Validation"

    local validated=0
    local failed=0

    # Find all markdown files
    while IFS= read -r -d '' file; do
        # Skip certain files
        if [[ "$file" == *"README"* ]] || [[ "$file" == *"templates/"* ]]; then
            continue
        fi

        # Check if file starts with ---
        if head -1 "$file" | grep -q "^---$"; then
            # Extract frontmatter (between first and second ---)
            frontmatter=$(awk '/^---$/{p++; next} p==1' "$file")

            # Determine type based on path
            local type=""
            if [[ "$file" == *"/rules/"* ]]; then
                type="rule"
            elif [[ "$file" == *"/patterns/"* ]]; then
                type="pattern"
            elif [[ "$file" == *"/workflows/"* ]]; then
                type="workflow"
            elif [[ "$file" == *"/commands/"* ]]; then
                type="command"
            elif [[ "$file" == *"/agents/"* ]]; then
                type="agent"
            elif [[ "$file" == *"/skills/"* ]]; then
                type="skill"
            fi

            if [ -n "$type" ]; then
                if validate_file_schema "$file" "$type" "$frontmatter"; then
                    check_pass "$(basename "$file") - valid $type schema"
                    validated=$((validated + 1))
                else
                    failed=$((failed + 1))
                fi
            fi
        fi
    done < <(find "$CELLM_DIR" -name "*.md" -type f -print0)

    echo ""
    echo -e "  ${CYAN}Validated: $validated files${NC}"
}

# Validate YAML files
validate_yaml() {
    section "YAML Validation"
    
    # Find all yaml files
    find "$CELLM_DIR" -name "*.yaml" -o -name "*.yml" | while read -r file; do
        # Basic YAML syntax check (check for common errors)
        if grep -qE "^\t" "$file"; then
            check_fail "$(basename "$file") - contains tabs (use spaces)"
        elif grep -qE ": \|$" "$file" 2>/dev/null || grep -qE ": >$" "$file" 2>/dev/null; then
            check_pass "$(basename "$file")"
        else
            # Try to parse with simple validation
            if grep -qE "^[a-z_]+:" "$file"; then
                check_pass "$(basename "$file")"
            else
                check_warn "$(basename "$file") - could not validate"
            fi
        fi
    done
}

# Validate IDs are unique
validate_unique_ids() {
    section "Unique IDs"
    
    # Collect all IDs from rules and patterns
    ids=$(find "$CELLM_DIR" -name "*.md" -exec grep -h "^id:" {} \; 2>/dev/null | cut -d':' -f2 | tr -d ' "' | sort)
    
    if [ -n "$ids" ]; then
        duplicates=$(echo "$ids" | uniq -d)
        
        if [ -z "$duplicates" ]; then
            total=$(echo "$ids" | wc -l | tr -d ' ')
            check_pass "All $total IDs are unique"
        else
            for dup in $duplicates; do
                check_fail "Duplicate ID: $dup"
            done
        fi
    else
        check_warn "No IDs found to validate"
    fi
}

# Validate budget calculations
validate_budget() {
    section "Budget Estimation"
    
    total_budget=0
    
    # Count tokens in always-loaded files
    if [ -d "$CELLM_DIR/rules/core" ]; then
        core_files=$(find "$CELLM_DIR/rules/core" -name "*.md" 2>/dev/null)
        for file in $core_files; do
            # Rough estimate: ~4 chars per token
            chars=$(wc -c < "$file" | tr -d ' ')
            tokens=$((chars / 4))
            total_budget=$((total_budget + tokens))
        done
    fi
    
    if [ -d "$CELLM_DIR/patterns/anti" ]; then
        anti_files=$(find "$CELLM_DIR/patterns/anti" -name "*.md" 2>/dev/null)
        for file in $anti_files; do
            chars=$(wc -c < "$file" | tr -d ' ')
            tokens=$((chars / 4))
            total_budget=$((total_budget + tokens))
        done
    fi
    
    if [ $total_budget -gt 0 ]; then
        if [ $total_budget -lt 1500 ]; then
            check_pass "Estimated core budget: ~$total_budget tokens (OK)"
        elif [ $total_budget -lt 2000 ]; then
            check_warn "Estimated core budget: ~$total_budget tokens (warning)"
        else
            check_fail "Estimated core budget: ~$total_budget tokens (exceeds 2000)"
        fi
    else
        check_warn "Could not estimate budget"
    fi
}

# Show summary
show_summary() {
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    
    if [ $ERRORS -eq 0 ]; then
        echo -e "${GREEN}[+] Validation Passed${NC}"
    else
        echo -e "${RED}[-] Validation Failed${NC}"
    fi
    
    echo ""
    echo "  Checks: $CHECKS"
    echo "  Passed: $((CHECKS - ERRORS - WARNINGS))"
    echo "  Warnings: $WARNINGS"
    echo "  Errors: $ERRORS"
    echo ""
    
    if [ $ERRORS -gt 0 ]; then
        exit 1
    fi
}

# Validate schema files exist
validate_schemas() {
    section "Schema Files"

    local required_schemas=("base" "rule" "pattern" "workflow" "command" "agent" "skill" "config")

    for schema in "${required_schemas[@]}"; do
        if [ -f "$SCHEMA_DIR/${schema}.schema.json" ]; then
            check_pass "${schema}.schema.json"
        else
            check_warn "${schema}.schema.json - not found"
        fi
    done
}

# Semantic validation: cross-references
validate_semantic() {
    section "Semantic Validation"

    # Only run in development context
    if [ "$CONTEXT" != "development" ]; then
        echo "  Skipping (only runs in development context)"
        return
    fi

    local errors=0

    # Create temp files to store data (works with bash 3.2)
    local tmp_agents=$(mktemp)
    local tmp_commands=$(mktemp)
    local tmp_workflows=$(mktemp)
    local tmp_triggers=$(mktemp)
    trap "rm -f $tmp_agents $tmp_commands $tmp_workflows $tmp_triggers" EXIT

    # Collect all agents and their triggers
    for file in "$CELLM_DIR"/agents/*.md; do
        if [ -f "$file" ]; then
            local agent=$(awk '/^---$/,/^---$/' "$file" | grep "^agent:" | sed 's/agent:[[:space:]]*//')
            if [ -n "$agent" ]; then
                echo "$agent" >> "$tmp_agents"
                # Extract triggers
                awk '/^---$/,/^---$/' "$file" | grep -A10 "^triggers:" | grep "^\s*-" | sed 's/.*-[[:space:]]*//' | tr -d '"' | tr -d "'" | while read trigger; do
                    echo "$agent:$trigger" >> "$tmp_triggers"
                done
            fi
        fi
    done

    # Collect all commands
    for file in "$CELLM_DIR"/commands/*.md; do
        if [ -f "$file" ]; then
            local cmd=$(awk '/^---$/,/^---$/' "$file" | grep "^command:" | sed 's/command:[[:space:]]*//')
            local cmd_agent=$(awk '/^---$/,/^---$/' "$file" | grep "^agent:" | sed 's/agent:[[:space:]]*//')
            if [ -n "$cmd" ]; then
                echo "$cmd:$cmd_agent" >> "$tmp_commands"
            fi
        fi
    done

    # Collect all workflows
    for file in "$CELLM_DIR"/workflows/*.md; do
        if [ -f "$file" ]; then
            local wf=$(awk '/^---$/,/^---$/' "$file" | grep "^workflow:" | sed 's/workflow:[[:space:]]*//')
            local wf_agent=$(awk '/^---$/,/^---$/' "$file" | grep "^agent:" | sed 's/agent:[[:space:]]*//')
            if [ -n "$wf" ]; then
                echo "$wf:$wf_agent" >> "$tmp_workflows"
            fi
        fi
    done

    # Validate command → agent references
    while IFS=: read -r cmd cmd_agent; do
        if [ -n "$cmd_agent" ] && ! grep -q "^${cmd_agent}$" "$tmp_agents"; then
            check_fail "Command '$cmd' references unknown agent '$cmd_agent'"
            errors=$((errors + 1))
        fi
    done < "$tmp_commands"

    # Validate workflow → agent references
    while IFS=: read -r wf wf_agent; do
        if [ -n "$wf_agent" ] && ! grep -q "^${wf_agent}$" "$tmp_agents"; then
            check_fail "Workflow '$wf' references unknown agent '$wf_agent'"
            errors=$((errors + 1))
        fi
    done < "$tmp_workflows"

    # Validate command ↔ workflow agent consistency
    while IFS=: read -r cmd cmd_agent; do
        wf_line=$(grep "^${cmd}:" "$tmp_workflows" 2>/dev/null || true)
        if [ -n "$wf_line" ]; then
            wf_agent=$(echo "$wf_line" | cut -d: -f2)
            if [ "$cmd_agent" != "$wf_agent" ]; then
                check_warn "Command '$cmd' uses agent '$cmd_agent' but workflow uses '$wf_agent'"
            fi
        fi
    done < "$tmp_commands"

    # Check that all commands are covered by agent triggers
    while IFS=: read -r cmd cmd_agent; do
        if ! grep -q ":/${cmd}$" "$tmp_triggers" 2>/dev/null; then
            check_warn "Command '$cmd' is not covered by any agent trigger"
        fi
    done < "$tmp_commands"

    if [ $errors -eq 0 ]; then
        check_pass "All cross-references valid"
    fi

    # Validate content structure
    echo ""
    echo -e "  ${CYAN}Content Validation:${NC}"

    # Rules should have headings
    local rules_without_headings=0
    while IFS= read -r -d '' file; do
        if ! grep -q "^#" "$file"; then
            rules_without_headings=$((rules_without_headings + 1))
        fi
    done < <(find "$CELLM_DIR/rules" -name "*.md" -type f -print0 2>/dev/null)
    if [ $rules_without_headings -eq 0 ]; then
        check_pass "All rules have markdown headings"
    else
        check_warn "$rules_without_headings rules missing headings"
    fi

    # Skills should have code blocks
    local skills_without_code=0
    for file in "$CELLM_DIR"/skills/*.md; do
        if [ -f "$file" ]; then
            if ! grep -q '```' "$file"; then
                skills_without_code=$((skills_without_code + 1))
            fi
        fi
    done
    if [ $skills_without_code -eq 0 ]; then
        check_pass "All skills have code examples"
    else
        check_warn "$skills_without_code skills missing code examples"
    fi

    # Patterns should have code blocks or lists
    local patterns_without_content=0
    while IFS= read -r -d '' file; do
        if ! grep -qE '```|^[-*]\s|^\|' "$file"; then
            patterns_without_content=$((patterns_without_content + 1))
        fi
    done < <(find "$CELLM_DIR/patterns" -name "*.md" -type f -print0 2>/dev/null)
    if [ $patterns_without_content -eq 0 ]; then
        check_pass "All patterns have examples or lists"
    else
        check_warn "$patterns_without_content patterns missing examples"
    fi
}

# Validate INDEX.md references
validate_index() {
    section "INDEX.md Validation"

    local index_file="$CELLM_DIR/INDEX.md"

    if [ ! -f "$index_file" ]; then
        check_fail "INDEX.md not found"
        return
    fi

    check_pass "INDEX.md exists"

    # Check for required sections
    if grep -qi "sempre carregar\|always load" "$index_file"; then
        check_pass "Has 'Always Load' section"
    else
        check_warn "Missing 'Always Load' section"
    fi

    if grep -qi "por comando\|by command" "$index_file"; then
        check_pass "Has 'By Command' section"
    else
        check_warn "Missing 'By Command' section"
    fi

    if grep -qi "por path\|by path" "$index_file"; then
        check_pass "Has 'By Path' section"
    else
        check_warn "Missing 'By Path' section"
    fi

    # Check that referenced files exist
    local missing_refs=0
    while IFS= read -r ref; do
        if [ -n "$ref" ]; then
            local full_path="$CELLM_DIR/$ref"
            if [ ! -f "$full_path" ]; then
                check_fail "INDEX.md references missing file: $ref"
                missing_refs=$((missing_refs + 1))
            fi
        fi
    done < <(grep -oE '(rules|patterns|workflows|commands|agents|skills)/[a-z-]+(/[a-z-]+)?\.md' "$index_file" | sort -u)

    if [ $missing_refs -eq 0 ]; then
        check_pass "All file references valid"
    fi
}

# Main
main() {
    print_header
    detect_context
    validate_structure
    validate_schemas
    validate_frontmatter
    validate_yaml
    validate_unique_ids
    validate_semantic
    validate_index
    validate_budget
    show_summary
}

main "$@"

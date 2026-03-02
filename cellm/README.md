# CELLM Plugin

Context engineering for LLM-driven development. 29 skills, 4 agents, 6 hook events, Oracle integration.

See [../README.md](../README.md) for full reference.

## Quick Start

```bash
claude plugin install cellm
```

Optional Oracle setup:
```
/cellm:init
```

## Structure

```
.claude-plugin/plugin.json   # Manifest
skills/                      # 29 skills (22 workflow + 7 context, auto-loaded by path)
agents/                      # architect, implementer, reviewer, project-manager
hooks/hooks.json             # 6 event hooks
scripts/                     # Hook scripts
.mcp.json                    # Oracle MCP server config
```

## Skills Architecture

Two types of skills coexist in the flat `skills/` directory:

**Context skills** (7) have `user-invocable: false` and `paths` in frontmatter. They auto-load when the Claude touches matching files. Multiple context skills stack: editing a `.vue` file loads vue + tailwind + dse simultaneously.

**Workflow skills** (18) are invoked manually as `/cellm:{name}`. They cover the full development lifecycle: plan, shape, write-spec, create-tasks, orchestrate, implement, verify.

## Requirements

- Claude Code CLI
- Bun >= 1.1.0 (for Oracle)

## Architectural Hygiene (Lessons Learned)

A massive audit of this plugin revealed several structural gaps caused by assuming behavior instead of strictly following the official Claude Code extensibility documentation. When creating or modifying artifacts, **strictly adhere to these rules**:

1. **Namespace Collisions (`name` field)**: NEVER include the `name` field in the frontmatter of plugin Skills or Agents. The namespace is exclusively derived from the file or directory name. Forcing it manually causes silent routing failures and shadow-prefixing.
2. **Intent Clarity (`user-invocable`)**: EVERY Skill must explicitly declare its routing intention. If it acts as a slash command for the developer, it MUST have `user-invocable: true`. If it is a passive interceptor or contextual background knowledge, it MUST have `user-invocable: false`. Ambiguity breaks the CLI autocomplete and command router.
3. **Boundary Setting (`## NEVER` blocks)**: LLMs require strict negative constraints to prevent hallucinations and proactive assumptions. Every Skill must end with a `## NEVER` block containing explicit anti-patterns. 
4. **Hook Semantics**: Hooks operate in a strict state machine. Use `PreToolUse` ONLY for permission blocking or payload mutations (`continue: true/false`). Use `PostToolUse` for reactive feedback loops (e.g., reminders to read related files). You cannot use PreToolUse to send a "reminder" while simultaneously allowing the tool to execute.
5. **Matcher Hygiene**: Lifecycle events like `SessionStart`, `UserPromptSubmit`, and `Stop` do NOT accept `matcher` fields. For events with specific matchers like `PreCompact`, if you want it to trigger globally (both auto and manual), you must **omit the matcher entirely** instead of inventing wildcards like `matcher: "*"`.

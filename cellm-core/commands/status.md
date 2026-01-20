---
id: CMD-STATUS
version: v1.1.0
status: OK
command: status
agent: project-manager
budget: ~200 tokens
---

# /status

## Load

- project/product/mission.md (summary)
- project/product/tech-stack.md (summary)
- specs/ (list)

## Output

```text
╔════════════════════════════════════════════════════════════╗
║ PROJECT: {name}                                            ║
║ CELLM: v0.10.0 | Profile: nuxt-saas                        ║
╠════════════════════════════════════════════════════════════╣
║ ACTIVE SPEC: {spec-name}                                   ║
║ Phase: {phase} | Tasks: {done}/{total} ({percent}%)        ║
╠════════════════════════════════════════════════════════════╣
║ RECENT SPECS                                               ║
║ [+] {spec-1}                              [completed]        ║
║ ◐ {spec-2}                              [implementing] ←   ║
║ ○ {spec-3}                              [specified]        ║
╠════════════════════════════════════════════════════════════╣
║ CONTEXT: {tokens}/2000 tokens ({percent}%)                 ║
╚════════════════════════════════════════════════════════════╝
```

## Data to Collect

1. Project name (CLAUDE.md or config.yaml)
2. Active spec (config.yaml → active_spec)
3. Progress (tasks.md → count [x] vs [ ])
4. Specs list (ls specs/)
5. Estimated tokens

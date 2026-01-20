---
id: TPL-CLAUDE
version: v1.1.0
status: OK
template: true
budget: ~150 tokens
---

# CLAUDE.md Template

```markdown
# {PROJECT_NAME}

<project>
name: {PROJECT_NAME}
cellm: v0.10.0
profile: nuxt-saas
</project>

<context>
local: .claude/
index: .claude/index.md
</context>

<loading>
1. Read .claude/index.md
2. Load rules/core/* (always)
3. Load patterns/anti/* (always)
4. Load project/product/* (always)
5. Path-triggered: rules/domain/*, patterns/core/*
6. Command-triggered: workflows/*, agents/*
7. Session: session/current.md
</loading>

<precedence>
session > project > patterns > domain > core > reference
</precedence>

<commands>
/plan-product, /shape-spec, /write-spec, /create-tasks,
/implement, /verify, /status, /reuse-check, /spec, /metrics
</commands>
```

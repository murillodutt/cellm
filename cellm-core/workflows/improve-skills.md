---
id: WF-IMPROVE-SKILLS
version: v0.10.0
status: OK
workflow: improve-skills
phase: verification
agent: architect
budget: ~400 tokens
---

# Skill Optimization

## Pre-conditions

- skills/ directory exists
- At least one skill file present

## Flow

1. **Inventory**
   - List all skill files
   - Count total tokens per skill
   - Identify trigger patterns

2. **Analyze Each Skill**
   - Check trigger specificity
   - Evaluate description quality
   - Review code examples
   - Calculate token usage

3. **Generate Recommendations**
   - Prioritize by impact
   - Suggest concrete changes
   - Estimate token savings

4. **Apply (optional)**
   - User confirms changes
   - Update skill files
   - Validate no regressions

## Quality Checks

| Check | Pass | Fail |
|-------|------|------|
| Trigger specificity | `app/components/**` | `**/*` |
| Description verb | "Use X for Y" | "X is a thing" |
| Example relevance | Common pattern | Rare edge case |
| Token count | < 300 | > 500 |

## Optimization Patterns

**Trigger Improvements:**

```yaml
# Bad: too broad
triggers: ["**/*.ts"]

# Good: specific
triggers: ["app/stores/**", "**/store/**"]
```

**Description Improvements:**

```markdown
# Bad: passive
Pinia is a state management library.

# Good: action-oriented
Use Pinia for complex state. Always setup stores with composition API.
```

**Example Improvements:**

```typescript
// Bad: shows everything
export const useStore = defineStore('id', () => {
  const x = ref(0)
  const y = ref('')
  const z = computed(() => x.value + 1)
  // ... 20 more lines
})

// Good: minimal pattern
export const useStore = defineStore('id', () => {
  const state = ref<T>(initial)
  const derived = computed(() => transform(state.value))
  return { state, derived }
})
```

## Validation

- [ ] All skills analyzed
- [ ] Recommendations generated
- [ ] Token impact calculated
- [ ] No broken triggers

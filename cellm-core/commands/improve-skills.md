---
id: CMD-IMPROVE-SKILLS
version: v0.10.0
status: OK
command: improve-skills
agent: architect
budget: ~200 tokens
---

# /improve-skills

## Purpose

Analyze and optimize skill descriptions for better Claude Code recognition.

## Load

- skills/*.md
- patterns/index.md

## Steps

1. Read all skill files
2. Analyze each skill's:
   - Trigger patterns (file globs)
   - Description clarity
   - Code examples relevance
   - Token efficiency
3. Suggest improvements:
   - Clearer triggers
   - More specific descriptions
   - Better code examples
   - Reduced redundancy

## Analysis Criteria

| Aspect | Good | Needs Improvement |
| ------ | ---- | ----------------- |
| Triggers | Specific globs | Overly broad patterns |
| Description | Action-oriented | Vague or passive |
| Examples | Common use cases | Edge cases only |
| Tokens | < 300 per skill | > 500 tokens |

## Output

Report with:

- Current state per skill
- Suggested improvements
- Token savings estimate

---
id: TPL-CONFIG
version: v1.1.0
status: OK
template: true
budget: ~100 tokens
---

# config.yaml Template

```yaml
# .claude/config.yaml

project:
  name: "{PROJECT_NAME}"
  
cellm:
  profile: nuxt-saas
  version: v1.1.0
  
budget:
  max_tokens: 2000
  warn_at: 1500
  
active_spec: null

settings:
  language: English
  strict_mode: true
```

---
id: ES-INDEX
tags: [eslint, linting]
---

# ESLint Patterns

## ES-001: Import Order

> Problem: Imports declared in inconsistent order, making code harder to read and causing merge conflicts

```typescript
// [-] Wrong - unorganized
import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types'
import { ref } from 'vue'
import './local-style.css'

// [+] Correct - organized by group
import type { User } from '~/types'
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import './local-style.css'
```

**Import Order:**
1. Type imports (`import type { X }`)
2. External libs (vue, pinia, @nuxt/*)
3. Internal (~/stores, ~/utils)
4. Relative (./components)

**Related:** TS-013

## ES-002: Unused Variables

> Problem: Variables declared but not used pollute scope and may indicate logic errors

```typescript
// [-] Wrong - unused variable
const { data, error } = await useFetch('/api')
// 'error' is never used

// [+] Correct - prefix with underscore
const { data, error: _error } = await useFetch('/api')
```

**Guidelines:**
- Will use later: keep
- Partial destructuring: prefix with _ (e.g., `_unused`)
- Never using: remove

## ES-003: Prefer const

> Problem: Using `let` when value is never reassigned fails to signal reference immutability

```typescript
// [-] Wrong - let but never reassigned
let x = 1
console.log(x)

// [+] Correct - const for immutable reference
const x = 1
console.log(x)
```

**Declaration Rules:**
- `const`: when no reassignment
- `let`: when reassignment is necessary
- `var`: NEVER use (banned)

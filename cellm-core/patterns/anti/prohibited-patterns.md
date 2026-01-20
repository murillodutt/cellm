---
id: ANTI-PATTERNS
version: v1.1.0
status: OK
severity: critical
alwaysApply: true
budget: ~300 tokens
---

# Prohibited Patterns

**ANTI-001: Never `any`**
-> use specific type or `unknown`

```typescript
// [-] Wrong
const data: any = {}

// [+] Correct
const data: unknown = {}
```

**ANTI-002: Never hardcode colors**
-> use tokens: primary, neutral, error

```vue
<!-- [-] -->
<div class="text-blue-500">

<!-- [+] -->
<div class="text-primary">
```

**ANTI-003: Never sync I/O**
-> use async/await, fs/promises

```typescript
// [-] Wrong
const data = fs.readFileSync('file.txt')

// [+] Correct
const data = await fs.promises.readFile('file.txt')
```

**ANTI-004: Never console.log in production**
-> use structured logger

```typescript
// [-] Wrong
console.log('Error', err)

// [+] Correct
logger.error('Failed to process', { err })
```

**ANTI-005: Never expose stack traces**
-> generic errors for client

```typescript
// [-] Wrong
throw createError({ message: err.stack })

// [+] Correct
throw createError({ message: 'Internal Server Error' })
```

---

## Quick Lookup

| Error | Pattern | Fix |
| ----- | ------- | --- |
| TS2589 | TS-015 | Use typedFetch wrapper |
| TS2345 | TS-006 | Type $fetch call |
| TS7006 | TS-014 | Use explicit types |
| hydration mismatch | NX-015 | Use computed/mounted/useId |
| vue/valid-v-model | VU-007 | Use shallowRef |
| @typescript-eslint/no-explicit-any | TS-014 | Use alternatives |

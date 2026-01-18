---
name: Icon Substitution Reference
description: ASCII alternatives for emojis with color mappings for terminal, web, markdown, and human-AI communication
scope: communication, code, documentation
load_on: status-reporting, documentation, commit-messages, user-communication
---

# Icon Substitution Reference

This project prohibits emojis in code, documentation, and human-AI communication. Use these ASCII alternatives with semantic color mappings instead.

**Applies to:**
- Code comments
- Commit messages
- Documentation (README, guides, specs)
- GitHub templates (issues, PRs)
- Human-to-AI communication (responses, status reports)
- Terminal output
- Web UI (with color context)

## Quick Reference

**Status**: `[+]` `[-]` `[!]` `[i]` `[=]` `[~]` `[...]`  
**Priority**: `[!!!]` `[!!]` `[!]` `[.]` `[-]`  
**Type**: `[BUG]` `[FEAT]` `[DOCS]` `[FIX]` `[REFAC]` `[PERF]` `[SEC]` `[TEST]`  
**Health**: `[UP]` `[DEG]` `[DOWN]` `[MAINT]` `[?]`  
**Environment**: `[PROD]` `[STAGE]` `[DEV]` `[LOCAL]`  
**Communication**: `[CHAT]` `[DOCS]` `[LINK]` `[PKG]` `[CODE]` `[OK]`

---

## Status / Estado

| Emoji | ASCII | Texto | ANSI Terminal | Tailwind | Hex |
|-------|-------|-------|---------------|----------|-----|
| ✅ | [+] | APPROVED | `\x1b[32m[+]\x1b[0m` | `text-green-600` | `#16a34a` |
| ❌ | [-] | REJECTED | `\x1b[31m[-]\x1b[0m` | `text-red-600` | `#dc2626` |
| ⚠️ | [!] | WARNING | `\x1b[33m[!]\x1b[0m` | `text-yellow-600` | `#ca8a04` |
| ℹ️ | [i] | INFO | `\x1b[36m[i]\x1b[0m` | `text-blue-600` | `#2563eb` |
| ⏸️ | [=] | PAUSED | `\x1b[90m[=]\x1b[0m` | `text-gray-600` | `#4b5563` |
| 🔄 | [~] | IN-PROGRESS | `\x1b[34m[~]\x1b[0m` | `text-indigo-600` | `#4f46e5` |
| ⏳ | [...] | PENDING | `\x1b[37m[...]\x1b[0m` | `text-gray-400` | `#9ca3af` |

## Prioridade / Severidade

| Emoji | ASCII | Texto | ANSI Terminal | Tailwind | Hex |
|-------|-------|-------|---------------|----------|-----|
| 🔴 | [!!!] | CRITICAL | `\x1b[41;97m[!!!]\x1b[0m` | `bg-red-600 text-white` | `#dc2626` |
| 🟠 | [!!] | HIGH | `\x1b[31m[!!]\x1b[0m` | `text-orange-600` | `#ea580c` |
| 🟡 | [!] | MEDIUM | `\x1b[33m[!]\x1b[0m` | `text-yellow-600` | `#ca8a04` |
| 🟢 | [.] | LOW | `\x1b[32m[.]\x1b[0m` | `text-green-600` | `#16a34a` |
| ⚫ | [-] | NONE | `\x1b[90m[-]\x1b[0m` | `text-gray-500` | `#6b7280` |

## Tipo / Categoria

| Emoji | ASCII | Texto | ANSI Terminal | Tailwind | Hex |
|-------|-------|-------|---------------|----------|-----|
| 🐛 | [BUG] | BUG | `\x1b[31m[BUG]\x1b[0m` | `text-red-600` | `#dc2626` |
| ✨ | [FEAT] | FEATURE | `\x1b[35m[FEAT]\x1b[0m` | `text-purple-600` | `#9333ea` |
| 📝 | [DOCS] | DOCS | `\x1b[36m[DOCS]\x1b[0m` | `text-cyan-600` | `#0891b2` |
| 🔧 | [FIX] | FIX | `\x1b[33m[FIX]\x1b[0m` | `text-yellow-600` | `#ca8a04` |
| ♻️ | [REFAC] | REFACTOR | `\x1b[34m[REFAC]\x1b[0m` | `text-blue-600` | `#2563eb` |
| ⚡ | [PERF] | PERF | `\x1b[93m[PERF]\x1b[0m` | `text-amber-500` | `#f59e0b` |
| 🔒 | [SEC] | SECURITY | `\x1b[91m[SEC]\x1b[0m` | `text-red-700` | `#b91c1c` |
| 🧪 | [TEST] | TEST | `\x1b[32m[TEST]\x1b[0m` | `text-green-600` | `#16a34a` |

## Health / Monitoramento

| Emoji | ASCII | Texto | ANSI Terminal | Tailwind | Hex |
|-------|-------|-------|---------------|----------|-----|
| 🟢 | [UP] | HEALTHY | `\x1b[42;97m[UP]\x1b[0m` | `bg-green-600 text-white` | `#16a34a` |
| 🟡 | [DEG] | DEGRADED | `\x1b[43;30m[DEG]\x1b[0m` | `bg-yellow-500 text-black` | `#eab308` |
| 🔴 | [DOWN] | DOWN | `\x1b[41;97m[DOWN]\x1b[0m` | `bg-red-600 text-white` | `#dc2626` |
| 🔵 | [MAINT] | MAINTENANCE | `\x1b[44;97m[MAINT]\x1b[0m` | `bg-blue-600 text-white` | `#2563eb` |
| ⚫ | [?] | UNKNOWN | `\x1b[100;97m[?]\x1b[0m` | `bg-gray-600 text-white` | `#4b5563` |

## Ambiente

| Emoji | ASCII | Texto | ANSI Terminal | Tailwind | Hex |
|-------|-------|-------|---------------|----------|-----|
| 🟢 | [PROD] | PRODUCTION | `\x1b[42;97m[PROD]\x1b[0m` | `bg-green-700 text-white` | `#15803d` |
| 🟡 | [STAGE] | STAGING | `\x1b[43;30m[STAGE]\x1b[0m` | `bg-yellow-600 text-white` | `#ca8a04` |
| 🔵 | [DEV] | DEV | `\x1b[44;97m[DEV]\x1b[0m` | `bg-blue-600 text-white` | `#2563eb` |
| ⚫ | [LOCAL] | LOCAL | `\x1b[100;97m[LOCAL]\x1b[0m` | `bg-gray-700 text-white` | `#374151` |

## Comunicação / Recursos

| Emoji | ASCII | Texto | ANSI Terminal | Tailwind | Hex |
|-------|-------|-------|---------------|----------|-----|
| 💬 | [CHAT] | DISCUSSION | `\x1b[36m[CHAT]\x1b[0m` | `text-blue-600` | `#2563eb` |
| 📖 | [DOCS] | DOCUMENTATION | `\x1b[36m[DOCS]\x1b[0m` | `text-cyan-600` | `#0891b2` |
| 🔗 | [LINK] | REFERENCE | `\x1b[34m[LINK]\x1b[0m` | `text-blue-600` | `#2563eb` |
| 📦 | [PKG] | PACKAGE | `\x1b[35m[PKG]\x1b[0m` | `text-purple-600` | `#9333ea` |
| 💻 | [CODE] | CODE | `\x1b[32m[CODE]\x1b[0m` | `text-green-600` | `#16a34a` |
| 🎉 | [OK] | SUCCESS | `\x1b[32m[OK]\x1b[0m` | `text-green-600` | `#16a34a` |

---

## Implementation Examples

### Terminal (Node.js)

```typescript
// Using ANSI codes directly
console.log('\x1b[32m[+] APPROVED\x1b[0m Build completed')
console.log('\x1b[31m[-] REJECTED\x1b[0m Invalid credentials')
console.log('\x1b[33m[!] WARNING\x1b[0m Rate limit: 95%')

// With library (chalk/picocolors)
import pc from 'picocolors'
console.log(pc.green('[+] APPROVED'), 'Build completed')
console.log(pc.red('[-] REJECTED'), 'Invalid credentials')
console.log(pc.yellow('[!] WARNING'), 'Rate limit: 95%')
```

### Vue/Nuxt Component

```vue
<script setup lang="ts">
const statusConfig = {
  APPROVED: { text: '[+] APPROVED', class: 'text-green-600' },
  REJECTED: { text: '[-] REJECTED', class: 'text-red-600' },
  WARNING: { text: '[!] WARNING', class: 'text-yellow-600' },
} as const

const status = ref<keyof typeof statusConfig>('APPROVED')
</script>

<template>
  <span :class="statusConfig[status].class">
    {{ statusConfig[status].text }}
  </span>
</template>
```

### Markdown Badges

```markdown
![APPROVED](https://img.shields.io/badge/STATUS-APPROVED-16a34a)
![REJECTED](https://img.shields.io/badge/STATUS-REJECTED-dc2626)
![WARNING](https://img.shields.io/badge/STATUS-WARNING-ca8a04)
```

### CSS Custom Properties

```css
:root {
  --status-approved: #16a34a;
  --status-rejected: #dc2626;
  --status-warning: #ca8a04;
  --status-info: #2563eb;
  --status-pending: #9ca3af;
}

.status-approved { color: var(--status-approved); }
.status-rejected { color: var(--status-rejected); }
.status-warning { color: var(--status-warning); }
```

### TypeScript Type-Safe

```typescript
const STATUS = {
  APPROVED: { symbol: '[+]', color: '#16a34a', ansi: '\x1b[32m' },
  REJECTED: { symbol: '[-]', color: '#dc2626', ansi: '\x1b[31m' },
  WARNING: { symbol: '[!]', color: '#ca8a04', ansi: '\x1b[33m' },
} as const

type Status = keyof typeof STATUS

function logStatus(status: Status, message: string) {
  const { symbol, ansi } = STATUS[status]
  console.log(`${ansi}${symbol}\x1b[0m ${message}`)
}
```

### Nuxt UI v4 (Design Tokens)

```vue
<script setup lang="ts">
const statusVariant = {
  APPROVED: 'primary',
  REJECTED: 'error',
  WARNING: 'warning',
} as const
</script>

<template>
  <UBadge :color="statusVariant.APPROVED">
    [+] APPROVED
  </UBadge>
</template>
```

---

## Usage Guidelines

1. **Always use ASCII alternatives** instead of emojis in:
   - Code comments
   - Commit messages
   - Documentation
   - Log messages
   - CLI output
   - **Human-to-AI communication** (when AI responds to user)
   - Status reports
   - Issue/PR descriptions

2. **Add color context** when the medium supports it:
   - Terminal: Use ANSI codes
   - Web: Use Tailwind classes or hex values
   - Markdown: Use badges
   - Plain text: ASCII symbols alone are sufficient

3. **Maintain semantic consistency**:
   - `[+]` always means positive/approved/success
   - `[-]` always means negative/rejected/failure
   - `[!]` always means warning/attention needed
   - `[i]` always means informational/neutral

4. **Text fallback**: In plain text contexts, the ASCII symbol alone is sufficient and self-explanatory.

5. **Communication examples**:
   ```
   [+] Task completed successfully
   [-] Build failed - check logs
   [!] Rate limit approaching (95%)
   [i] Processing 1500 files
   [~] Migration in progress
   [...] Waiting for approval
   ```

---

## Migration Examples

### Before (with emojis - communication)
```
✅ Feature completed
❌ Build failed
⚠️ Rate limit warning
🔄 Processing...
```

### After (ASCII + semantic meaning)
```
[+] Feature completed
[-] Build failed
[!] Rate limit warning
[~] Processing...
```

### In AI responses to user
```
Before:
"[+] All tests passed! 🎉"

After:
"[+] All tests passed"
```

### In colored terminal
```typescript
console.log('\x1b[32m[+]\x1b[0m Feature completed')
console.log('\x1b[31m[-]\x1b[0m Build failed')
console.log('\x1b[33m[!]\x1b[0m Rate limit warning')
```

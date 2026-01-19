---
id: PATTERNS-INDEX
version: v0.10.0
status: OK
alwaysApply: true
budget: ~200 tokens
---

# Patterns Index

## Anti-Patterns (Critical)

| ID | Rule | File |
 | ---- |------- | --------- |
| ANTI-001 | Never any | anti/prohibited.md |
| ANTI-002 | Never hardcode colors | anti/prohibited.md |
| ANTI-003 | Never sync I/O | anti/prohibited.md |
| ANTI-004 | Never console.log prod | anti/prohibited.md |
| ANTI-005 | Never expose stack | anti/prohibited.md |

## By Technology

| Prefix | Technology | File |
 | --------- |------------ | --------- |
| TS-* | TypeScript | core/typescript.md |
| VU-* | Vue 3 | core/vue.md |
| NX-* | Nuxt 4 | core/nuxt.md |
| UI-* | Nuxt UI | core/nuxt-ui.md |
| PN-* | Pinia | core/pinia.md |
| ES-* | ESLint | core/eslint.md |
| DR-* | Drizzle | core/drizzle.md |
| TW-* | Tailwind | core/tailwind.md |
| ST-* | Stripe | core/stripe.md |

## Loading

- anti/* → Always
- index.md → Always
- core/* → By path trigger

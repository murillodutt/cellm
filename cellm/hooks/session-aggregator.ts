#!/usr/bin/env bun
// CELLM — SessionStart aggregator (Bun + TypeScript, zero shell)
//
// Replaces the 3 post-hook-http.sh calls (init + context + persona) with
// one Bun process that fires them in parallel via Promise.allSettled.
// ensure-oracle.sh is kept separate (lifecycle/bootstrap concern).
//
// Budget: 3500ms total, 1800ms per call. Never blocks Claude Code.
// Runtime: bun >=1.2.
//
// Hardened for spec-49cc4b66 (2026-04-23):
//   G1 partial-failure isolation — emit surviving contexts + [HOOK-WARN] marker
//   G3 stdin capacity — 256KB cap + 1500ms deadline + visible truncation warning

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PER_CALL_TIMEOUT_MS = 1800
const HOOK_BUDGET_MS = 3500
const STDIN_BYTE_LIMIT = 256 * 1024
const STDIN_DEADLINE_MS = 1500
const WORKER_JSON = join(homedir(), '.cellm', 'worker.json')
const DEFAULT_PORT = 31415
const DEFAULT_HOST = '127.0.0.1'

const ENDPOINTS = [
  '/api/hooks/init',
  '/api/hooks/context',
  // inject-persona.sh is a local filesystem op; kept as separate shell hook.
]

interface StdinRead {
  payload: string
  truncated: boolean
}

function resolveBaseUrl(): string {
  const envUrl = process.env.CELLM_WORKER_URL
  if (envUrl) return envUrl.replace(/\/$/, '')
  try {
    const cfg = JSON.parse(readFileSync(WORKER_JSON, 'utf8')) as { host?: string; port?: number }
    return `http://${cfg.host ?? DEFAULT_HOST}:${cfg.port ?? DEFAULT_PORT}`
  } catch {
    return `http://${DEFAULT_HOST}:${DEFAULT_PORT}`
  }
}

async function readStdin(): Promise<StdinRead> {
  if (process.stdin.isTTY) return { payload: '', truncated: false }
  let buf = ''
  let size = 0
  let truncated = false

  const reader = (async () => {
    for await (const chunk of process.stdin) {
      const next = chunk as Buffer
      size += next.length
      if (size > STDIN_BYTE_LIMIT) {
        truncated = true
        break
      }
      buf += next.toString('utf8')
    }
  })()

  const deadline = new Promise<void>((resolve) => setTimeout(resolve, STDIN_DEADLINE_MS))
  await Promise.race([reader, deadline])
  return { payload: buf, truncated }
}

interface EndpointResult {
  status: 'ok' | 'failure'
  body: string | null
}

async function postJson(baseUrl: string, apiPath: string, body: string, timeoutMs: number): Promise<EndpointResult> {
  try {
    const res = await fetch(baseUrl + apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return { status: 'failure', body: null }
    const text = await res.text()
    if (text.length > 200_000) return { status: 'failure', body: null }
    return { status: 'ok', body: text }
  } catch {
    return { status: 'failure', body: null }
  }
}

function extractContext(raw: string | null): string | null {
  if (!raw || raw === '""' || raw === 'null') return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'hookSpecificOutput' in parsed) {
      const hso = (parsed as { hookSpecificOutput?: { additionalContext?: unknown } }).hookSpecificOutput
      if (hso && typeof hso.additionalContext === 'string' && hso.additionalContext.trim().length) {
        return hso.additionalContext
      }
    }
    if (typeof parsed === 'string' && parsed.trim().length) return parsed
    return null
  } catch {
    const t = raw.trim()
    return t.length ? t : null
  }
}

async function main(): Promise<void> {
  const budgetTimer = setTimeout(() => {
    process.stdout.write('')
    process.exit(0)
  }, HOOK_BUDGET_MS)

  try {
    const stdin = await readStdin()
    const payload = stdin.payload || '{}'
    const baseUrl = resolveBaseUrl()

    const results = await Promise.allSettled(
      ENDPOINTS.map((p) => postJson(baseUrl, p, payload, PER_CALL_TIMEOUT_MS))
    )

    const contexts: string[] = []
    let failures = 0
    for (const r of results) {
      if (r.status !== 'fulfilled') {
        failures += 1
        continue
      }
      if (r.value.status === 'failure') {
        failures += 1
        continue
      }
      const ctx = extractContext(r.value.body)
      if (ctx) contexts.push(ctx)
    }

    if (stdin.truncated) {
      contexts.unshift(
        `[HOOK-WARN] prompt truncated at ${STDIN_BYTE_LIMIT} bytes — downstream hook search may miss later content`,
      )
    }

    if (failures > 0 && failures < ENDPOINTS.length) {
      contexts.push(`[HOOK-WARN] ${failures}/${ENDPOINTS.length} context endpoint(s) failed this turn`)
    }

    clearTimeout(budgetTimer)

    if (!contexts.length) {
      process.stdout.write('')
      process.exit(0)
    }

    const envelope = {
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: contexts.join('\n\n'),
      },
    }
    process.stdout.write(JSON.stringify(envelope))
    process.exit(0)
  } catch {
    clearTimeout(budgetTimer)
    process.stdout.write('')
    process.exit(0)
  }
}

await main()

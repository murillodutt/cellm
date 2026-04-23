#!/usr/bin/env bun
// CELLM — SessionStart aggregator (Bun + TypeScript, zero shell)
//
// Replaces the 3 post-hook-http.sh calls (init + context + persona) with
// one Bun process that fires them in parallel via Promise.allSettled.
// ensure-oracle.sh is kept separate (lifecycle/bootstrap concern).
//
// Budget: 3500ms total, 1800ms per call. Never blocks Claude Code.
// Runtime: bun >=1.2.

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const PER_CALL_TIMEOUT_MS = 1800
const HOOK_BUDGET_MS = 3500
const WORKER_JSON = join(homedir(), '.cellm', 'worker.json')
const DEFAULT_PORT = 31415
const DEFAULT_HOST = '127.0.0.1'

const ENDPOINTS = [
  '/api/hooks/init',
  '/api/hooks/context',
  // inject-persona.sh is a local filesystem op; kept as separate shell hook.
]

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

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return ''
  let buf = ''
  let size = 0
  const limit = 65_536
  const deadline = new Promise<string>((resolve) => setTimeout(() => resolve(buf), 500))

  const reader = (async () => {
    for await (const chunk of process.stdin) {
      size += (chunk as Buffer).length
      if (size > limit) break
      buf += (chunk as Buffer).toString('utf8')
    }
    return buf
  })()

  return Promise.race([reader, deadline])
}

async function postJson(baseUrl: string, apiPath: string, body: string, timeoutMs: number): Promise<string | null> {
  try {
    const res = await fetch(baseUrl + apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      signal: AbortSignal.timeout(timeoutMs),
    })
    if (!res.ok) return null
    const text = await res.text()
    return text.length > 200_000 ? null : text
  } catch {
    return null
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
    const input = await readStdin()
    const payload = input || '{}'
    const baseUrl = resolveBaseUrl()

    const results = await Promise.allSettled(
      ENDPOINTS.map((p) => postJson(baseUrl, p, payload, PER_CALL_TIMEOUT_MS))
    )

    const contexts: string[] = []
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value) {
        const ctx = extractContext(r.value)
        if (ctx) contexts.push(ctx)
      }
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

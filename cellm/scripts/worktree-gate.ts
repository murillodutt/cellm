#!/usr/bin/env bun
/**
 * CELLM Worktree Gate — PreToolUse hook
 *
 * Blocks git worktree creation when CELLM_WORKTREE_ENABLED policy is false.
 * Covers two tool invocation paths:
 *   1. Bash commands matching /\bgit\s+worktree\s+add\b/
 *   2. Agent tool calls with tool_input.isolation === 'worktree'
 *
 * Precedence (first hit wins):
 *   ENV  CELLM_WORKTREE_ENABLED=(true|false|...)
 *   HTTP GET http://127.0.0.1:<port>/api/ui-settings -> worktree.enabled
 *   DEFAULT false (fail-closed — worktree is opt-in)
 *
 * Output contract (Claude Code PreToolUse spec):
 *   Exit 0 with stdout JSON { hookSpecificOutput.permissionDecision: "deny"|"allow"|... }
 *   Any other outcome (non-worktree tool, policy enabled) -> exit 0 with empty stdout.
 */

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

interface HookInput {
  tool_name?: string
  tool_input?: Record<string, unknown>
  hook_event_name?: string
}

interface DenyOutput {
  hookSpecificOutput: {
    hookEventName: 'PreToolUse'
    permissionDecision: 'deny'
    permissionDecisionReason: string
  }
}

const WORKTREE_ADD_REGEX = /\bgit\s+worktree\s+add\b/

function parseBooleanFlag(value: string | undefined | null): boolean | undefined {
  if (value === undefined || value === null) return undefined
  const normalized = value.trim().toLowerCase()
  if (normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes') return true
  if (normalized === '0' || normalized === 'false' || normalized === 'off' || normalized === 'no') return false
  return undefined
}

function readStdin(): string {
  try {
    return readFileSync(0, 'utf8')
  } catch {
    return ''
  }
}

function resolveWorkerPort(): number {
  const envPort = process.env.CELLM_WORKER_PORT
  if (envPort && /^\d+$/.test(envPort)) {
    const n = Number(envPort)
    if (n >= 1 && n <= 65535) return n
  }
  try {
    const workerJsonPath = join(process.env.CELLM_DIR ?? join(homedir(), '.cellm'), 'worker.json')
    const raw = readFileSync(workerJsonPath, 'utf8')
    const parsed = JSON.parse(raw) as { port?: number }
    if (typeof parsed.port === 'number' && parsed.port >= 1 && parsed.port <= 65535) {
      return parsed.port
    }
  } catch {
    // fall through
  }
  return 31415
}

async function fetchPolicyFromWorker(): Promise<boolean | undefined> {
  const port = resolveWorkerPort()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 1000)
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/ui-settings`, {
      signal: controller.signal,
    })
    if (!res.ok) return undefined
    const body = (await res.json()) as { worktree?: { enabled?: unknown } }
    const enabled = body?.worktree?.enabled
    if (typeof enabled === 'boolean') return enabled
    return undefined
  } catch {
    return undefined
  } finally {
    clearTimeout(timer)
  }
}

async function isWorktreePolicyEnabled(): Promise<boolean> {
  const envOverride = parseBooleanFlag(process.env.CELLM_WORKTREE_ENABLED)
  if (envOverride !== undefined) return envOverride

  const fromWorker = await fetchPolicyFromWorker()
  if (fromWorker !== undefined) return fromWorker

  return false
}

function shouldGate(input: HookInput): boolean {
  const tool = input.tool_name
  const ti = input.tool_input ?? {}

  if (tool === 'Bash') {
    const cmd = typeof ti.command === 'string' ? ti.command : ''
    return WORKTREE_ADD_REGEX.test(cmd)
  }

  if (tool === 'Agent') {
    return ti.isolation === 'worktree'
  }

  return false
}

function emitDeny(reason: string): void {
  const out: DenyOutput = {
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason: reason,
    },
  }
  process.stdout.write(JSON.stringify(out))
}

async function main(): Promise<void> {
  const raw = readStdin()
  if (!raw.trim()) {
    process.exit(0)
  }

  let input: HookInput
  try {
    input = JSON.parse(raw) as HookInput
  } catch {
    process.exit(0)
  }

  if (!shouldGate(input)) {
    process.exit(0)
  }

  const enabled = await isWorktreePolicyEnabled()
  if (enabled) {
    process.exit(0)
  }

  const target = input.tool_name === 'Agent'
    ? 'Agent with isolation="worktree"'
    : 'git worktree add'
  emitDeny(
    `CELLM worktree policy is disabled (CELLM_WORKTREE_ENABLED=false). ` +
    `Blocked: ${target}. Enable via Oracle Settings UI ` +
    `(Worktree Policy section) or set env CELLM_WORKTREE_ENABLED=true.`,
  )
  process.exit(0)
}

void main()

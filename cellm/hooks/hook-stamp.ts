import { createHash, randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, isAbsolute, join, relative, sep } from 'node:path'

export const HOOK_STAMP_VERSION = 'cellm-hook-stamp/v1'
export const DEFAULT_LEDGER_PATH = join(homedir(), '.cellm', 'hook-stamps.jsonl')

const STAMP_START = '<!-- cellm-hook-stamp/v1'
const STAMP_END = '-->'
const HEADER_STAMP_BLOCK_RE = /^(?:<!-- cellm-hook-stamp\/v1[\s\S]*?-->\n*)+/
const SENSITIVE_KEY_RE = /(secret|token|password|passwd|credential|auth|api[-_]?key|private[-_]?key)/i
const SENSITIVE_VALUE_RE = /(sk-[a-z0-9_-]{8,}|gh[pousr]_[a-z0-9_]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/i
const MAX_METADATA_STRING = 200
const MAX_SCALAR_STRING = 240

export type HookStampAction = 'additionalContext' | 'document_write' | 'systemMessage' | 'noop'
export type HookStampTargetKind = 'document' | 'transcript' | 'runtime-log' | 'additional-context' | 'unknown'

export interface HookStampInput {
  sessionId?: string | null
  hookEvent: string
  hookName: string
  action: HookStampAction
  targetKind: HookStampTargetKind
  targetPath?: string | null
  projectRoot?: string | null
  prompt?: string | null
  inputBytes?: number | null
  output?: string | Buffer | null
  outputBytes?: number | null
  outputSha256?: string | null
  durationMs?: number | null
  metadata?: Record<string, unknown> | null
  recordedAt?: string
  startedAt?: string | null
  id?: string
}

export interface HookStampRecord {
  schema: typeof HOOK_STAMP_VERSION
  id: string
  recordedAt: string
  sessionId?: string
  hookEvent: string
  hookName: string
  action: HookStampAction
  targetKind: HookStampTargetKind
  targetPath?: string
  inputBytes: number
  outputBytes: number
  outputSha256: string
  durationMs?: number
  promptMarkerRetained: boolean
  promptMarker?: '.'
  metadata?: Record<string, string | number | boolean | null>
}

export function shouldRetainPromptMarker(prompt: string | null | undefined): boolean {
  return prompt?.trim() === '.'
}

export function sha256Hex(value: string | Buffer | null | undefined): string {
  return createHash('sha256').update(value ?? '').digest('hex')
}

export function byteLength(value: string | Buffer | null | undefined): number {
  if (!value) return 0
  return Buffer.isBuffer(value) ? value.length : Buffer.byteLength(value, 'utf8')
}

export function sanitizeTargetPath(targetPath: string | null | undefined, projectRoot?: string | null): string | undefined {
  if (!targetPath) return undefined
  if (!isAbsolute(targetPath)) {
    const normalized = normalizePath(sanitizeScalar(targetPath, 500))
    return isSafeRelativePath(normalized) ? normalized : undefined
  }
  if (!projectRoot) return undefined

  const rel = relative(projectRoot, targetPath)
  const normalized = normalizePath(sanitizeScalar(rel, 500))
  return isSafeRelativePath(normalized) ? normalized : undefined
}

export function sanitizeMetadata(input: Record<string, unknown> | null | undefined): Record<string, string | number | boolean | null> | undefined {
  if (!input) return undefined

  const output: Record<string, string | number | boolean | null> = {}
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEY_RE.test(key)) {
      output[key] = '[redacted]'
      continue
    }
    if (value === null || typeof value === 'boolean') {
      output[key] = value
      continue
    }
    if (typeof value === 'number') {
      if (Number.isFinite(value)) output[key] = value
      continue
    }
    if (typeof value === 'string') {
      if (SENSITIVE_VALUE_RE.test(value)) {
        output[key] = '[redacted]'
        continue
      }
      output[key] = value.length > MAX_METADATA_STRING
        ? `${value.slice(0, MAX_METADATA_STRING)}...`
        : value
    }
  }

  return Object.keys(output).length ? output : undefined
}

export function makeHookStamp(input: HookStampInput): HookStampRecord {
  const promptMarkerRetained = shouldRetainPromptMarker(input.prompt)
  const outputBytes = normalizeNumber(input.outputBytes) ?? byteLength(input.output)
  const outputSha256 = normalizeSha256(input.outputSha256, input.output)
  const metadata = sanitizeMetadata(input.metadata)
  const record: HookStampRecord = {
    schema: HOOK_STAMP_VERSION,
    id: sanitizeScalar(input.id ?? `hks_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`),
    recordedAt: sanitizeScalar(input.recordedAt ?? new Date().toISOString()),
    hookEvent: sanitizeScalar(input.hookEvent),
    hookName: sanitizeScalar(input.hookName),
    action: input.action,
    targetKind: input.targetKind,
    inputBytes: normalizeNumber(input.inputBytes) ?? 0,
    outputBytes,
    outputSha256,
    promptMarkerRetained,
  }

  if (input.sessionId) record.sessionId = sanitizeScalar(input.sessionId)
  const targetPath = sanitizeTargetPath(input.targetPath, input.projectRoot)
  if (targetPath) record.targetPath = targetPath
  const durationMs = normalizeNumber(input.durationMs)
  if (durationMs !== null) record.durationMs = durationMs
  if (promptMarkerRetained) record.promptMarker = '.'
  if (metadata) record.metadata = metadata

  return record
}

export function recordHookStamp(input: HookStampInput, ledgerPath = DEFAULT_LEDGER_PATH): HookStampRecord | null {
  try {
    const record = makeHookStamp(input)
    mkdirSync(dirname(ledgerPath), { recursive: true })
    appendFileSync(ledgerPath, `${JSON.stringify(record)}\n`)
    return record
  } catch {
    return null
  }
}

export function renderMarkdownHeaderStamp(input: HookStampInput): string {
  const record = makeHookStamp(input)
  const lines = [
    STAMP_START,
    `id: ${record.id}`,
    `hook: ${record.hookName}`,
    `event: ${record.hookEvent}`,
    `action: ${record.action}`,
    `target: ${record.targetPath ?? record.targetKind}`,
  ]

  if (record.promptMarkerRetained) lines.push('promptMarker: "."')
  if (input.startedAt) lines.push(`startedAt: ${sanitizeScalar(input.startedAt)}`)
  if (record.durationMs !== undefined) lines.push(`durationMs: ${record.durationMs}`)
  lines.push(`inputBytes: ${record.inputBytes}`)
  lines.push(`outputBytes: ${record.outputBytes}`)
  lines.push(`outputSha256: ${record.outputSha256}`)
  lines.push(STAMP_END)
  return `${lines.join('\n')}\n\n`
}

export function removeMarkdownHeaderStamps(markdown: string): string {
  return markdown.replace(HEADER_STAMP_BLOCK_RE, '')
}

export function applyMarkdownHeaderStamp(markdown: string, input: HookStampInput): string {
  const clean = removeMarkdownHeaderStamps(markdown)
  if (!shouldRetainPromptMarker(input.prompt)) return clean
  return renderMarkdownHeaderStamp(input) + clean.replace(/^\n+/, '')
}

function normalizeNumber(value: number | null | undefined): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return null
  return Math.round(value)
}

function normalizePath(path: string): string {
  return path.split(sep).join('/')
}

function isSafeRelativePath(path: string): boolean {
  if (!path || path === '.' || path.startsWith('/')) return false
  return !path.split('/').some(part => part === '..')
}

function sanitizeScalar(value: string, maxLength = MAX_SCALAR_STRING): string {
  const clean = value.replace(/[\r\n\t]+/g, ' ').replace(/[^\S ]+/g, ' ').trim()
  return clean.length > maxLength ? `${clean.slice(0, maxLength)}...` : clean
}

function normalizeSha256(value: string | null | undefined, fallback: string | Buffer | null | undefined): string {
  if (!value) return sha256Hex(fallback)
  const clean = sanitizeScalar(value)
  return /^[a-f0-9]{64}$/i.test(clean) ? clean.toLowerCase() : sha256Hex(fallback)
}

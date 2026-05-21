import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'bun:test'
import {
  applyMarkdownHeaderStamp,
  makeHookStamp,
  recordHookStamp,
  removeMarkdownHeaderStamps,
  sanitizeMetadata,
  sanitizeTargetPath,
  shouldRetainPromptMarker,
} from './hook-stamp'

const baseInput = {
  hookEvent: 'UserPromptSubmit',
  hookName: 'submit-aggregator',
  action: 'additionalContext' as const,
  targetKind: 'additional-context' as const,
  inputBytes: 12,
  output: 'context',
  recordedAt: '2026-05-21T00:00:00.000Z',
  id: 'hks_test',
}

describe('hook-stamp v1', () => {
  it('retains the prompt marker only for the exact dot prompt', () => {
    expect(shouldRetainPromptMarker('.')).toBe(true)
    expect(shouldRetainPromptMarker(' . ')).toBe(true)
    expect(shouldRetainPromptMarker('...')).toBe(false)
    expect(shouldRetainPromptMarker('hello.')).toBe(false)
  })

  it('builds a sanitized ledger record without prompt text', () => {
    const record = makeHookStamp({
      ...baseInput,
      sessionId: 'session-1',
      prompt: '.',
      metadata: { contextCount: 2, token: 'secret-value', nested: { unsafe: true } },
    })

    expect(record.schema).toBe('cellm-hook-stamp/v1')
    expect(record.sessionId).toBe('session-1')
    expect(record.promptMarkerRetained).toBe(true)
    expect(record.promptMarker).toBe('.')
    expect(record.outputBytes).toBe(7)
    expect(record.outputSha256).toHaveLength(64)
    expect(record.metadata).toEqual({ contextCount: 2, token: '[redacted]' })
    expect(JSON.stringify(record)).not.toContain('secret-value')
  })

  it('uses project-relative target paths and drops external absolute paths', () => {
    const root = '/repo'

    expect(sanitizeTargetPath('/repo/docs/a.md', root)).toBe('docs/a.md')
    expect(sanitizeTargetPath('/outside/docs/a.md', root)).toBeUndefined()
    expect(sanitizeTargetPath('docs/a.md', root)).toBe('docs/a.md')
    expect(sanitizeTargetPath('../outside.md', root)).toBeUndefined()
    expect(sanitizeTargetPath('docs/../outside.md', root)).toBeUndefined()
  })

  it('records JSONL to a caller-provided ledger path', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cellm-hook-stamp-'))
    const ledgerPath = join(dir, 'nested', 'hook-stamps.jsonl')
    try {
      const record = recordHookStamp({ ...baseInput, prompt: 'continue' }, ledgerPath)
      const line = readFileSync(ledgerPath, 'utf8').trim()

      expect(record?.id).toBe('hks_test')
      expect(JSON.parse(line)).toMatchObject({
        schema: 'cellm-hook-stamp/v1',
        id: 'hks_test',
        promptMarkerRetained: false,
      })
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('adds a Markdown header stamp only when the prompt marker is retained', () => {
    const stamped = applyMarkdownHeaderStamp('# Title\nBody\n', {
      ...baseInput,
      action: 'document_write',
      targetKind: 'document',
      targetPath: '/repo/docs/report.md',
      projectRoot: '/repo',
      prompt: '.',
      startedAt: '2026-05-21T00:00:00.000Z',
      durationMs: 42,
    })

    expect(stamped).toStartWith('<!-- cellm-hook-stamp/v1')
    expect(stamped).toContain('target: docs/report.md')
    expect(stamped).toContain('promptMarker: "."')
    expect(stamped).not.toContain('/repo/')
  })

  it('removes Markdown stamps idempotently when the dot marker is absent', () => {
    const once = applyMarkdownHeaderStamp('# Title\n', { ...baseInput, prompt: '.' })
    const clean = applyMarkdownHeaderStamp(once, { ...baseInput, prompt: 'ok' })

    expect(clean).toBe('# Title\n')
    expect(removeMarkdownHeaderStamps(clean)).toBe('# Title\n')
  })

  it('removes only header stamps and preserves body examples', () => {
    const bodyExample = '# Title\n\n```md\n<!-- cellm-hook-stamp/v1\nid: example\n-->\n```\n'
    const stamped = applyMarkdownHeaderStamp(bodyExample, { ...baseInput, prompt: '.' })
    const clean = applyMarkdownHeaderStamp(stamped, { ...baseInput, prompt: 'continue' })

    expect(clean).toBe(bodyExample)
  })

  it('sanitizes header scalar fields against multiline injection', () => {
    const stamped = applyMarkdownHeaderStamp('# Title\n', {
      ...baseInput,
      hookName: 'bad\nhook',
      hookEvent: 'UserPromptSubmit\ninjected: true',
      outputSha256: 'bad\nhash',
      startedAt: '2026-05-21T00:00:00.000Z\ninjected: true',
      prompt: '.',
    })

    expect(stamped).toContain('hook: bad hook')
    expect(stamped).toContain('event: UserPromptSubmit injected: true')
    expect(stamped).toContain('startedAt: 2026-05-21T00:00:00.000Z injected: true')
    expect(stamped).not.toContain('hook: bad\nhook')
    expect(stamped).not.toContain('outputSha256: bad\nhash')
  })

  it('fails closed when the ledger path is not writable as a file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cellm-hook-stamp-dir-'))
    try {
      expect(recordHookStamp({ ...baseInput, prompt: '.' }, dir)).toBeNull()
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('does not duplicate retained Markdown stamps', () => {
    const once = applyMarkdownHeaderStamp('# Title\n', { ...baseInput, prompt: '.' })
    const twice = applyMarkdownHeaderStamp(once, { ...baseInput, prompt: '.' })

    expect(twice.match(/cellm-hook-stamp\/v1/g)?.length).toBe(1)
  })

  it('keeps metadata minimal and type-safe', () => {
    expect(sanitizeMetadata({
      ok: true,
      count: 2,
      empty: null,
      list: ['drop'],
      password: 'drop-me',
      modelToken: 'sk-test-secret-12345678',
    })).toEqual({
      ok: true,
      count: 2,
      empty: null,
      password: '[redacted]',
      modelToken: '[redacted]',
    })
  })
})

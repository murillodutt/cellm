/**
 * Automated test for long-session-guard.sh — bun test runner.
 *
 * Validates threshold-driven advisory output for the Long Session Guard.
 *
 * Spec: docs/technical/SPEC-FREEZE-DIAGNOSTIC-LOOP.md (mitigation phase)
 * Empirical basis: 24 historical hangs analysis, 2026-04-27.
 *
 * Run: bun test cellm-plugin/cellm/skills/tilly/tests/long-session-guard.test.ts
 */
import { describe, it, expect, beforeAll, afterAll } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCRIPT = join(__dirname, '..', '..', '..', 'scripts', 'long-session-guard.sh')

interface HookOutput {
  hookSpecificOutput: {
    hookEventName: string
    additionalContext: string
  }
}

let homeDir: string
let projectsDir: string

function fakeSession(slug: string, sessionId: string, lines: string[]): string {
  const dir = join(projectsDir, slug)
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${sessionId}.jsonl`)
  writeFileSync(path, lines.join('\n') + '\n')
  return path
}

function runGuard(input: object, env: Record<string, string> = {}): { stdout: string; code: number } {
  const result = spawnSync('bash', [SCRIPT], {
    input: JSON.stringify(input),
    env: { ...process.env, HOME: homeDir, ...env },
    encoding: 'utf-8',
  })
  return { stdout: result.stdout ?? '', code: result.status ?? -1 }
}

beforeAll(() => {
  homeDir = mkdtempSync(join(tmpdir(), 'cellm-lsg-'))
  projectsDir = join(homeDir, '.claude', 'projects')
  mkdirSync(projectsDir, { recursive: true })
})

afterAll(() => {
  rmSync(homeDir, { recursive: true, force: true })
})

describe('long-session-guard.sh — exit and silence paths', () => {
  it('exits 0 on missing stdin', () => {
    const result = spawnSync('bash', [SCRIPT], { input: '', encoding: 'utf-8' })
    expect(result.status).toBe(0)
    expect(result.stdout ?? '').toBe('')
  })

  it('exits 0 on missing session_id', () => {
    const { stdout, code } = runGuard({ cwd: '/tmp/nowhere' })
    expect(code).toBe(0)
    expect(stdout).toBe('')
  })

  it('exits 0 when JSONL file does not exist', () => {
    const { stdout, code } = runGuard({
      session_id: 'does-not-exist',
      cwd: '/tmp/whatever',
    })
    expect(code).toBe(0)
    expect(stdout).toBe('')
  })

  it('exits 0 silently for a small session below all thresholds', () => {
    const sid = 'small-session'
    const slug = '-tmp-cellm-lsg-small'
    fakeSession(slug, sid, [
      '{"timestamp":"2026-04-27T10:00:00.000Z","type":"user"}',
      '{"timestamp":"2026-04-27T10:00:05.000Z","type":"assistant"}',
    ])
    const { stdout, code } = runGuard({ session_id: sid, cwd: '/tmp/cellm-lsg-small' })
    expect(code).toBe(0)
    expect(stdout).toBe('')
  })
})

describe('long-session-guard.sh — warn threshold', () => {
  it('emits warn level when edit count crosses CELLM_LSG_WARN_EDITS', () => {
    const sid = 'warn-by-edits'
    const slug = '-tmp-cellm-lsg-warn'
    const lines: string[] = []
    for (let i = 0; i < 42; i++) {
      lines.push(`{"timestamp":"2026-04-27T10:0${(i % 6).toString()}:00.000Z","type":"assistant","message":{"content":[{"type":"tool_use","name":"Edit"}]}}`)
    }
    fakeSession(slug, sid, lines)
    const { stdout, code } = runGuard({ session_id: sid, cwd: '/tmp/cellm-lsg-warn' })
    expect(code).toBe(0)
    expect(stdout).toContain('LONG-SESSION-GUARD warn')
    expect(stdout).toContain('edits=42')
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.hookEventName).toBe('UserPromptSubmit')
  })
})

describe('long-session-guard.sh — strong threshold', () => {
  it('emits strong level when edit count crosses CELLM_LSG_STRONG_EDITS', () => {
    const sid = 'strong-by-edits'
    const slug = '-tmp-cellm-lsg-strong'
    const lines: string[] = []
    for (let i = 0; i < 60; i++) {
      lines.push(`{"timestamp":"2026-04-27T10:0${(i % 6).toString()}:00.000Z","type":"assistant","message":{"content":[{"type":"tool_use","name":"Write"}]}}`)
    }
    fakeSession(slug, sid, lines)
    const { stdout, code } = runGuard({ session_id: sid, cwd: '/tmp/cellm-lsg-strong' })
    expect(code).toBe(0)
    expect(stdout).toContain('LONG-SESSION-GUARD strong')
    expect(stdout).toContain('edits=60')
    expect(stdout).toContain('Empirical risk of model freeze')
  })

  it('respects CELLM_LSG_STRONG_EDITS env override', () => {
    const sid = 'override-edits'
    const slug = '-tmp-cellm-lsg-override'
    const lines: string[] = []
    for (let i = 0; i < 12; i++) {
      lines.push(`{"timestamp":"2026-04-27T10:0${(i % 6).toString()}:00.000Z","type":"assistant","message":{"content":[{"type":"tool_use","name":"Edit"}]}}`)
    }
    fakeSession(slug, sid, lines)
    const { stdout } = runGuard(
      { session_id: sid, cwd: '/tmp/cellm-lsg-override' },
      { CELLM_LSG_STRONG_EDITS: '10', CELLM_LSG_WARN_EDITS: '5' },
    )
    expect(stdout).toContain('LONG-SESSION-GUARD strong')
  })
})

describe('long-session-guard.sh — output contract', () => {
  it('output is valid single-line JSON envelope', () => {
    const sid = 'valid-json'
    const slug = '-tmp-cellm-lsg-valid'
    const lines: string[] = []
    for (let i = 0; i < 60; i++) {
      lines.push(`{"timestamp":"2026-04-27T10:0${(i % 6).toString()}:00.000Z","type":"assistant","message":{"content":[{"type":"tool_use","name":"Edit"}]}}`)
    }
    fakeSession(slug, sid, lines)
    const { stdout } = runGuard({ session_id: sid, cwd: '/tmp/cellm-lsg-valid' })
    expect(() => JSON.parse(stdout)).not.toThrow()
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.hookEventName).toBe('UserPromptSubmit')
    expect(typeof parsed.hookSpecificOutput.additionalContext).toBe('string')
  })
})

/**
 * Automated test for inject-persona.sh — bun test runner.
 *
 * Validates: exit code, JSON validity, expected content, graceful skip paths.
 * Replaces bash+python3 test with pure Bun/TypeScript.
 *
 * Run: bun test cellm-plugin/cellm/tests/inject-persona.test.ts
 */
import { describe, it, expect } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = join(__dirname, '..')
const INJECT_SCRIPT = join(PLUGIN_ROOT, 'scripts', 'inject-persona.sh')

interface HookOutput {
  hookSpecificOutput: {
    hookEventName: string
    additionalContext: string
  }
}

function runInject(pluginRoot: string): { stdout: string; code: number } {
  const result = spawnSync('bash', [INJECT_SCRIPT], {
    env: { ...process.env, CLAUDE_PLUGIN_ROOT: pluginRoot },
    encoding: 'utf-8',
  })
  return { stdout: result.stdout ?? '', code: result.status ?? -1 }
}

describe('inject-persona.sh — happy path', () => {
  const { stdout, code } = runInject(PLUGIN_ROOT)

  it('exit code is 0', () => {
    expect(code).toBe(0)
  })

  it('stdout is valid JSON', () => {
    expect(() => JSON.parse(stdout)).not.toThrow()
  })

  it('JSON has hookSpecificOutput.hookEventName = SessionStart', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.hookEventName).toBe('SessionStart')
  })

  it('additionalContext contains Relational Frame section', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.additionalContext).toContain('Relational Frame')
  })

  it('additionalContext contains Signal Vocabulary section', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.additionalContext).toContain('Signal Vocabulary')
  })

  it('additionalContext contains partner/friend framing', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.additionalContext).toContain('partners and friends')
  })

  it('additionalContext contains ATOM token', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.additionalContext).toContain('ATOM')
  })

  it('additionalContext contains Wikipedia signal', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.additionalContext).toContain('Wikipedia')
  })
})

describe('inject-persona.sh — graceful skip paths', () => {
  it('missing persona file: exit 0, no output', () => {
    const empty = mkdtempSync(join(tmpdir(), 'cellm-persona-test-'))
    try {
      const { stdout, code } = runInject(empty)
      expect(code).toBe(0)
      expect(stdout).toBe('')
    } finally {
      rmSync(empty, { recursive: true, force: true })
    }
  })

  it('empty persona file: exit 0, no output', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cellm-persona-test-'))
    writeFileSync(join(dir, 'CELLM-PERSONA.md'), '')
    try {
      const { stdout, code } = runInject(dir)
      expect(code).toBe(0)
      expect(stdout).toBe('')
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

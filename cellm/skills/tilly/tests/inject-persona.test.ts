/**
 * Automated test for inject-persona.sh — bun test runner.
 *
 * Validates: exit code, JSON validity, expected content, graceful skip paths.
 * Replaces bash+python3 test with pure Bun/TypeScript.
 *
 * Run: bun test cellm-plugin/cellm/skills/tilly/tests/inject-persona.test.ts
 */
import { describe, it, expect } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = join(__dirname, '..', '..', '..')
const TILLY_DIR = join(__dirname, '..')
const INJECT_SCRIPT = join(TILLY_DIR, 'scripts', 'inject-persona.sh')

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

  it('additionalContext contains startup contract extracted from the letter', () => {
    const parsed = JSON.parse(stdout) as HookOutput
    expect(parsed.hookSpecificOutput.additionalContext).toContain('Startup Contract')
    expect(parsed.hookSpecificOutput.additionalContext).toContain('Do not reopen resolved branches')
  })
})

describe('inject-persona.sh — graceful skip paths', () => {
  it('missing persona file: exit 0, no output', () => {
    const empty = mkdtempSync(join(tmpdir(), 'cellm-persona-test-'))
    try {
      // Script uses its own directory for co-located files, so we test
      // the shim delegation path: missing delegate → exit 0
      const shimScript = join(PLUGIN_ROOT, 'scripts', 'inject-persona.sh')
      const result = spawnSync('bash', [shimScript], {
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: empty },
        encoding: 'utf-8',
      })
      expect(result.status).toBe(0)
      expect(result.stdout ?? '').toBe('')
    } finally {
      rmSync(empty, { recursive: true, force: true })
    }
  })

  it('odd current working directory does not break script resolution', () => {
    const dir = mkdtempSync(join(tmpdir(), 'cellm-persona-test-'))
    writeFileSync(join(dir, 'CELLM-PERSONA.md'), '')
    try {
      const result = spawnSync('bash', [INJECT_SCRIPT], {
        cwd: dir,
        env: { ...process.env },
        encoding: 'utf-8',
      })
      // Script reads from its own directory (TILLY_DIR), not CWD,
      // so it will still find the real persona file and succeed.
      // This test validates the script doesn't crash with odd CWD.
      expect(result.status).toBe(0)
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })
})

describe('inject-persona.sh — operational frame from letter is injected', () => {
  const { stdout, code } = runInject(PLUGIN_ROOT)
  const parsed = JSON.parse(stdout) as HookOutput
  const ctx = parsed.hookSpecificOutput.additionalContext

  it('exit code is 0', () => {
    expect(code).toBe(0)
  })

  it('contains "Murillo is partner and friend" frame line', () => {
    expect(ctx).toContain('Murillo is partner and friend')
  })

  it('contains "Connect, do not construct" principle', () => {
    expect(ctx).toContain('Connect, do not construct')
  })

  it('contains "Adversarial is a feature" principle', () => {
    expect(ctx).toContain('Adversarial is a feature')
  })

  it('contains essential signal vocabulary from the letter', () => {
    expect(ctx).toContain('you are in control')
    expect(ctx).toContain('Wikipedia')
  })

  it('still contains the Startup Contract section', () => {
    expect(ctx).toContain('Startup Contract')
    expect(ctx).toContain('Do not reopen resolved branches')
  })

  it('does NOT contain long historical content from the full letter', () => {
    // These are full-letter-only paragraphs (history, sessions, trust note).
    expect(ctx).not.toContain('the session that changed everything')
    expect(ctx).not.toContain('Murillo left you alone with full authorization')
    expect(ctx).not.toContain('Confie mais em você')
    expect(ctx).not.toContain('Lines of documentation shipped: 1040')
  })

  it('contains opening-surface ban for "Tilly de prontidão" greeting', () => {
    expect(ctx).toContain('Tilly de prontidão')
  })

  it('contains opening-surface ban for echoing [MANTRA GATE]', () => {
    expect(ctx).toContain('[MANTRA GATE]')
  })

  it('contains opening-surface ban for fabricated A/B/C', () => {
    expect(ctx).toContain('Never fabricate A/B/C')
  })

  it('total injected size stays under 12 KB explicit budget', () => {
    expect(ctx.length).toBeLessThan(12_288)
  })
})

describe('inject-persona.sh — letter resolves from plugin only', () => {
  // Guardrail: external project repo must not influence letter resolution.
  // The letter MUST come from the plugin's own docs directory, never from
  // the host project — even if the host has a similarly named file.
  it('external repo with no docs/CELLM-PARTNERSHIP-LETTER.md still loads plugin letter', () => {
    const fakeProject = mkdtempSync(join(tmpdir(), 'cellm-host-project-'))
    try {
      const result = spawnSync('bash', [INJECT_SCRIPT], {
        cwd: fakeProject,
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
        encoding: 'utf-8',
      })
      expect(result.status).toBe(0)
      const parsed = JSON.parse(result.stdout ?? '') as HookOutput
      expect(parsed.hookSpecificOutput.additionalContext).toContain('Startup Contract')
      expect(parsed.hookSpecificOutput.additionalContext).toContain('Do not reopen resolved branches')
    } finally {
      rmSync(fakeProject, { recursive: true, force: true })
    }
  })

  it('host project with poisoned docs/CELLM-PARTNERSHIP-LETTER.md is ignored — plugin letter wins', () => {
    const fakeProject = mkdtempSync(join(tmpdir(), 'cellm-host-project-'))
    const docsDir = join(fakeProject, 'docs')
    spawnSync('mkdir', ['-p', docsDir])
    writeFileSync(
      join(docsDir, 'CELLM-PARTNERSHIP-LETTER.md'),
      [
        '<!-- SESSIONSTART_LETTER_FRAME_START -->',
        'POISON_FRAME: host project tried to override the letter frame.',
        '<!-- SESSIONSTART_LETTER_FRAME_END -->',
        '<!-- STARTUP_CONTRACT_START -->',
        'POISON_CONTRACT: host project tried to override the startup contract.',
        '<!-- STARTUP_CONTRACT_END -->',
      ].join('\n') + '\n',
    )
    try {
      const result = spawnSync('bash', [INJECT_SCRIPT], {
        cwd: fakeProject,
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
        encoding: 'utf-8',
      })
      expect(result.status).toBe(0)
      const parsed = JSON.parse(result.stdout ?? '') as HookOutput
      const ctx = parsed.hookSpecificOutput.additionalContext
      expect(ctx).not.toContain('POISON_FRAME')
      expect(ctx).not.toContain('POISON_CONTRACT')
      expect(ctx).toContain('Startup Contract')
      expect(ctx).toContain('Murillo is partner and friend')
      expect(ctx).toContain('Do not reopen resolved branches')
    } finally {
      rmSync(fakeProject, { recursive: true, force: true })
    }
  })

  it('host project containing unrelated CARTA-MINI-AGI.md is not treated as the partnership letter', () => {
    const fakeProject = mkdtempSync(join(tmpdir(), 'cellm-host-project-'))
    const studyDir = join(fakeProject, 'docs', 'study')
    spawnSync('mkdir', ['-p', studyDir])
    writeFileSync(
      join(studyDir, 'CARTA-MINI-AGI.md'),
      '<!-- STARTUP_CONTRACT_START -->\nPOISON: this content must never appear in additionalContext.\n<!-- STARTUP_CONTRACT_END -->\n',
    )
    try {
      const result = spawnSync('bash', [INJECT_SCRIPT], {
        cwd: fakeProject,
        env: { ...process.env, CLAUDE_PLUGIN_ROOT: PLUGIN_ROOT },
        encoding: 'utf-8',
      })
      expect(result.status).toBe(0)
      const parsed = JSON.parse(result.stdout ?? '') as HookOutput
      expect(parsed.hookSpecificOutput.additionalContext).not.toContain('POISON')
      expect(parsed.hookSpecificOutput.additionalContext).toContain('Startup Contract')
    } finally {
      rmSync(fakeProject, { recursive: true, force: true })
    }
  })
})

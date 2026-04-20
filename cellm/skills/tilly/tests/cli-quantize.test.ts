import { describe, expect, it } from 'bun:test'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_ROOT = join(__dirname, '..', '..', '..')
const QUANTIZER = join(PLUGIN_ROOT, 'scripts', 'cli-quantize.py')

function runQuantize(input: string, args: string[] = []): { code: number; stdout: string; stderr: string } {
  const result = spawnSync('python3', [QUANTIZER, ...args], {
    input,
    encoding: 'utf-8',
  })
  return {
    code: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  }
}

describe('cli-quantize.py', () => {
  it('preserves code fences and URLs while reducing text', () => {
    const input = [
      'Sure, I am happy to help and we can basically do this in order to move forward.',
      'Use `pnpm run lint` on ./oracle.',
      'Reference: https://example.com/path?a=1',
      '```ts',
      'const value = "keep exactly";',
      'console.log(value)',
      '```',
    ].join('\n')

    const { code, stdout } = runQuantize(input, ['--mode', 'compact', '--max-chars', '800'])
    expect(code).toBe(0)
    expect(stdout.length).toBeLessThanOrEqual(800)
    expect(stdout).toContain('`pnpm run lint`')
    expect(stdout).toContain('https://example.com/path?a=1')
    expect(stdout).toContain('```ts\nconst value = "keep exactly";\nconsole.log(value)\n```')
  })

  it('keeps mandatory anchors when requested', () => {
    const input = [
      '## Relational Frame',
      'Body text.',
      '## Signal Vocabulary',
      'Body text.',
      '## Startup Contract',
      'Body text.',
    ].join('\n')

    const { code, stdout } = runQuantize(input, [
      '--mode', 'compact',
      '--max-chars', '1200',
      '--must-keep', 'Relational Frame',
      '--must-keep', 'Signal Vocabulary',
      '--must-keep', 'Startup Contract',
    ])
    expect(code).toBe(0)
    expect(stdout).toContain('Relational Frame')
    expect(stdout).toContain('Signal Vocabulary')
    expect(stdout).toContain('Startup Contract')
  })

  it('applies stronger compact reduction on long narrative blocks', () => {
    const paragraph = [
      'This section describes operational context in detail and includes rationale that is often repetitive in long timeline narratives.',
      'Additionally, the same point is restated with mild wording changes that do not add new technical signal for execution.',
      'The objective is to keep only the highest-signal blocks and remove low-value expansion while preserving critical anchors.',
    ].join(' ')
    const input = [
      '## Relational Frame',
      paragraph,
      '',
      '## Signal Vocabulary',
      paragraph,
      '',
      '## Startup Contract',
      paragraph,
      '',
      '## Additional Context',
      paragraph,
      paragraph,
    ].join('\n')

    const { code, stdout } = runQuantize(input, [
      '--mode', 'compact',
      '--max-chars', '4000',
      '--must-keep', 'Relational Frame',
      '--must-keep', 'Signal Vocabulary',
      '--must-keep', 'Startup Contract',
    ])
    expect(code).toBe(0)
    expect(stdout.length).toBeLessThan(input.length)
    expect(stdout.length).toBeLessThanOrEqual(Math.floor(input.length * 0.8))
    expect(stdout).toContain('Relational Frame')
    expect(stdout).toContain('Signal Vocabulary')
    expect(stdout).toContain('Startup Contract')
  })
})

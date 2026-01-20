/**
 * Markdown linting validation tests
 * Ensures all markdown files in cellm-core pass linting rules
 */

import { describe, it, expect } from 'vitest'
import { execSync, spawnSync } from 'child_process'
import { existsSync } from 'fs'
import { join } from 'path'
import { ROOT_DIR } from '../utils/helpers'

describe('Markdown Linting', () => {
  it('should pass markdownlint for all cellm-core files', () => {
    // Use spawnSync for better cross-platform/Node version compatibility
    const result = spawnSync('npm', ['run', 'lint:md'], {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      shell: true
    })

    // Check if linting passed (exit code 0)
    if (result.status !== 0) {
      const errorOutput = result.stdout || result.stderr || 'Unknown error (no output captured)'
      expect.fail(`Markdown linting failed (exit code ${result.status}):\n${errorOutput}`)
    }

    expect(result.status).toBe(0)
  })

  it('should have markdownlint configured', () => {
    const configPath = join(ROOT_DIR, '.markdownlintrc')
    expect(existsSync(configPath)).toBe(true)
  })
})

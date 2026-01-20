import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { join } from 'node:path'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import {
  analyzeContext,
  traceRuleLoading,
  parseIndexFile,
} from '../../src/utils/context.js'

describe('debug commands', () => {
  const testDir = join(process.cwd(), '.test-debug')
  const claudeDir = join(testDir, '.claude')

  beforeEach(() => {
    // Create test directory structure
    mkdirSync(join(claudeDir, 'rules', 'core'), { recursive: true })
    mkdirSync(join(claudeDir, 'rules', 'domain'), { recursive: true })
    mkdirSync(join(claudeDir, 'patterns', 'anti'), { recursive: true })
    mkdirSync(join(claudeDir, 'workflows'), { recursive: true })

    // Create index.md
    writeFileSync(
      join(claudeDir, 'index.md'),
      `---
id: TEST-INDEX
version: v0.12.0
status: OK
alwaysApply: true
budget: ~200 tokens
---

# Test Index

## Always Load

- rules/core/conventions.md
- patterns/anti/prohibited.md

## By Command

| Command | Agent | Workflow |
| ------- | ----- | -------- |
| /implement | implementer | workflows/implement.md |

## By Path

| Pattern | Rules | Skills | Patterns |
| ------- | ----- | ------ | -------- |
| app/**/*.vue | domain/frontend | vue | VU-* |
`
    )

    // Create test files
    writeFileSync(
      join(claudeDir, 'rules', 'core', 'conventions.md'),
      `---
id: RULE-001
version: v0.12.0
status: OK
budget: ~100 tokens
---

# Conventions

Test rule content.
`
    )

    writeFileSync(
      join(claudeDir, 'patterns', 'anti', 'prohibited.md'),
      `---
id: ANTI-001
version: v0.12.0
status: OK
budget: ~150 tokens
---

# Prohibited Patterns

Test anti-pattern content.
`
    )

    writeFileSync(
      join(claudeDir, 'workflows', 'implement.md'),
      `---
id: WF-001
version: v0.12.0
status: OK
budget: ~200 tokens
---

# Implement Workflow

Test workflow content.
`
    )
  })

  afterEach(() => {
    // Clean up test directory
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('parseIndexFile', () => {
    it('parses always load section', () => {
      const config = parseIndexFile(join(claudeDir, 'index.md'))
      expect(config.alwaysLoad).toContain('rules/core/conventions.md')
      expect(config.alwaysLoad).toContain('patterns/anti/prohibited.md')
    })

    it('parses by command section', () => {
      const config = parseIndexFile(join(claudeDir, 'index.md'))
      expect(config.byCommand.has('implement')).toBe(true)
      const implementFiles = config.byCommand.get('implement')
      expect(implementFiles).toContain('workflows/implement.md')
    })

    it('parses by path section', () => {
      const config = parseIndexFile(join(claudeDir, 'index.md'))
      expect(config.byPath.size).toBeGreaterThan(0)
    })

    it('returns empty config for non-existent file', () => {
      const config = parseIndexFile('/non/existent/path.md')
      expect(config.alwaysLoad).toHaveLength(0)
      expect(config.byCommand.size).toBe(0)
      expect(config.byPath.size).toBe(0)
    })
  })

  describe('analyzeContext', () => {
    it('analyzes context and returns file list', () => {
      const analysis = analyzeContext(testDir)
      expect(analysis.files.length).toBeGreaterThan(0)
    })

    it('calculates total tokens', () => {
      const analysis = analyzeContext(testDir)
      expect(analysis.totalTokens).toBeGreaterThan(0)
    })

    it('categorizes files by trigger', () => {
      const analysis = analyzeContext(testDir)
      expect(analysis.byTrigger.always.length).toBeGreaterThanOrEqual(0)
    })

    it('calculates budget percentage', () => {
      const analysis = analyzeContext(testDir)
      expect(analysis.percentage).toBeDefined()
      expect(analysis.percentage).toBeGreaterThanOrEqual(0)
    })

    it('determines status based on usage', () => {
      const analysis = analyzeContext(testDir)
      expect(['ok', 'warning', 'critical', 'exceeded']).toContain(analysis.status)
    })
  })

  describe('traceRuleLoading', () => {
    it('traces always-load file', () => {
      const trace = traceRuleLoading(testDir, 'conventions')
      expect(trace.found).toBe(true)
      expect(trace.file).toBeDefined()
      expect(trace.chain.length).toBeGreaterThan(0)
    })

    it('returns not found for non-existent file', () => {
      const trace = traceRuleLoading(testDir, 'non-existent-rule')
      expect(trace.found).toBe(false)
      expect(trace.reason).toContain('not found')
    })

    it('traces file by full path', () => {
      const trace = traceRuleLoading(testDir, 'rules/core/conventions')
      expect(trace.found).toBe(true)
    })

    it('traces file with .md extension', () => {
      const trace = traceRuleLoading(testDir, 'conventions.md')
      expect(trace.found).toBe(true)
    })

    it('includes load chain', () => {
      const trace = traceRuleLoading(testDir, 'conventions')
      expect(trace.chain.length).toBeGreaterThan(0)
    })
  })
})

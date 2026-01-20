/**
 * INDEX.md validation tests
 * Validates that INDEX.md correctly references all artifacts
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import {
  CELLM_CORE_DIR,
  getFilesByType,
  extractFrontmatter
} from '../utils/helpers'

const INDEX_PATH = join(CELLM_CORE_DIR, 'INDEX.md')

describe('INDEX.md Validation', () => {
  it('should exist', () => {
    expect(existsSync(INDEX_PATH)).toBe(true)
  })

  describe('Content Structure', () => {
    const indexContent = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : ''

    it('should have "Sempre Carregar" section', () => {
      expect(indexContent).toMatch(/sempre carregar|always load/i)
    })

    it('should have "Por Comando" section', () => {
      expect(indexContent).toMatch(/por comando|by command/i)
    })

    it('should have "Por Path" section', () => {
      expect(indexContent).toMatch(/por path|by path/i)
    })
  })

  describe('Always Load References', () => {
    const indexContent = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : ''

    it('should reference core conventions', () => {
      expect(indexContent).toContain('rules/core/conventions.md')
    })

    it('should reference core limits', () => {
      expect(indexContent).toContain('rules/core/limits.md')
    })

    it('should reference core protocols', () => {
      expect(indexContent).toContain('rules/core/protocols.md')
    })

    it('should reference anti-patterns', () => {
      expect(indexContent).toContain('patterns/anti/prohibited-patterns.md')
      expect(indexContent).toContain('patterns/anti/prohibited-libs.md')
      expect(indexContent).toContain('patterns/anti/prohibited-code.md')
      expect(indexContent).toContain('patterns/anti/prohibited-nav.md')
    })

    it('should reference patterns index', () => {
      expect(indexContent).toContain('patterns/index.md')
    })
  })

  describe('Command Mapping', () => {
    const indexContent = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : ''
    const commands = getFilesByType('commands')
    const commandNames = commands.map(f => {
      const fm = extractFrontmatter(f)
      return fm?.command as string
    }).filter(Boolean)

    it('should reference all main workflow commands', () => {
      const workflowCommands = ['plan-product', 'shape-spec', 'write-spec', 'create-tasks', 'implement', 'verify']

      for (const cmd of workflowCommands) {
        expect(indexContent).toContain(`/${cmd}`)
      }
    })

    it('should map commands to correct agents', () => {
      const expectedMappings: Record<string, string> = {
        'plan-product': 'architect',
        'shape-spec': 'architect',
        'write-spec': 'architect',
        'create-tasks': 'project-manager',
        'implement': 'implementer',
        'verify': 'reviewer'
      }

      for (const [cmd, expectedAgent] of Object.entries(expectedMappings)) {
        // Check that the command and agent appear near each other in the index
        const cmdIndex = indexContent.indexOf(`/${cmd}`)
        if (cmdIndex !== -1) {
          // Look for the agent within 100 characters
          const nearbyContent = indexContent.substring(cmdIndex, cmdIndex + 100)
          expect(nearbyContent.toLowerCase()).toContain(expectedAgent)
        }
      }
    })
  })

  describe('Path Trigger Mapping', () => {
    const indexContent = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : ''

    it('should map app/**/*.vue to frontend rules', () => {
      expect(indexContent).toMatch(/app\/\*\*\/\*\.vue.*frontend|frontend.*app\/\*\*\/\*\.vue/i)
    })

    it('should map server/** to backend rules', () => {
      expect(indexContent).toMatch(/server\/\*\*.*backend|backend.*server\/\*\*/i)
    })

    it('should reference vue skill for vue files', () => {
      const hasVueMapping = indexContent.includes('vue') && indexContent.includes('.vue')
      expect(hasVueMapping).toBe(true)
    })

    it('should reference drizzle skill for database files', () => {
      const hasDrizzleMapping = indexContent.toLowerCase().includes('drizzle')
      expect(hasDrizzleMapping).toBe(true)
    })
  })

  describe('Referenced Files Exist', () => {
    const indexContent = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : ''

    // Extract all file paths from index
    const filePathPattern = /(?:rules|patterns|workflows|commands|agents|skills)\/[a-z-]+(?:\/[a-z-]+)?\.md/g
    const referencedPaths = indexContent.match(filePathPattern) || []

    it.each(referencedPaths)('referenced file %s should exist', (relativePath) => {
      const fullPath = join(CELLM_CORE_DIR, relativePath)
      expect(existsSync(fullPath)).toBe(true)
    })
  })
})

describe('Artifact Completeness', () => {
  describe('All artifacts should be documented', () => {
    const indexContent = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, 'utf-8') : ''

    it('all agents should be referenced in INDEX', () => {
      const agentFiles = getFilesByType('agents')
      const errors: string[] = []

      for (const file of agentFiles) {
        const fm = extractFrontmatter(file)
        const agentName = fm?.agent as string

        if (!indexContent.toLowerCase().includes(agentName)) {
          errors.push(`Agent "${agentName}" is not referenced in INDEX.md`)
        }
      }

      expect(errors).toEqual([])
    })

    it('all workflow commands should be referenced in INDEX', () => {
      const workflowFiles = getFilesByType('workflows')
      const errors: string[] = []

      for (const file of workflowFiles) {
        const fm = extractFrontmatter(file)
        const workflowName = fm?.workflow as string

        if (!indexContent.includes(`/${workflowName}`)) {
          errors.push(`Workflow "/${workflowName}" is not referenced in INDEX.md`)
        }
      }

      expect(errors).toEqual([])
    })

    it('all skills should be referenced in INDEX', () => {
      const skillFiles = getFilesByType('skills')
      const errors: string[] = []

      for (const file of skillFiles) {
        const fm = extractFrontmatter(file)
        const skillName = fm?.skill as string

        if (!indexContent.toLowerCase().includes(skillName)) {
          errors.push(`Skill "${skillName}" is not referenced in INDEX.md`)
        }
      }

      expect(errors).toEqual([])
    })
  })
})

describe('Loading Order Validation (STRICT)', () => {
  const ruleFiles = getFilesByType('rules')
  const patternFiles = getFilesByType('patterns')

  describe('Core rules MUST have alwaysApply: true', () => {
    const coreRules = ruleFiles.filter(f => f.includes('/rules/core/'))

    it.each(coreRules)('%s MUST have alwaysApply: true', (filePath) => {
      const fm = extractFrontmatter(filePath)
      expect(fm?.alwaysApply).toBe(true)
    })

    it('ALL core rules must have alwaysApply: true (100%)', () => {
      const violations: string[] = []

      for (const file of coreRules) {
        const fm = extractFrontmatter(file)
        if (fm?.alwaysApply !== true) {
          violations.push(file)
        }
      }

      if (violations.length > 0) {
        console.error('\n[!] Core rules missing alwaysApply: true:')
        violations.forEach(v => console.error(`  - ${v}`))
      }

      expect(violations).toEqual([])
    })
  })

  describe('Architecture rules MUST NOT have alwaysApply: true', () => {
    const archRules = ruleFiles.filter(f => f.includes('/rules/architecture/'))

    it.each(archRules)('%s MUST NOT have alwaysApply: true', (filePath) => {
      const fm = extractFrontmatter(filePath)
      expect(fm?.alwaysApply).not.toBe(true)
    })

    it('NO architecture rules should have alwaysApply: true', () => {
      const violations: string[] = []

      for (const file of archRules) {
        const fm = extractFrontmatter(file)
        if (fm?.alwaysApply === true) {
          violations.push(file)
        }
      }

      if (violations.length > 0) {
        console.error('\n[!] Architecture rules incorrectly have alwaysApply: true:')
        violations.forEach(v => console.error(`  - ${v}`))
      }

      expect(violations).toEqual([])
    })
  })

  describe('Domain rules MUST NOT have alwaysApply: true', () => {
    const domainRules = ruleFiles.filter(f => f.includes('/rules/domain/'))

    it('NO domain rules should have alwaysApply: true', () => {
      const violations: string[] = []

      for (const file of domainRules) {
        const fm = extractFrontmatter(file)
        if (fm?.alwaysApply === true) {
          violations.push(file)
        }
      }

      if (violations.length > 0) {
        console.error('\n[!] Domain rules incorrectly have alwaysApply: true:')
        violations.forEach(v => console.error(`  - ${v}`))
      }

      expect(violations).toEqual([])
    })
  })

  describe('Anti-patterns should be always loaded', () => {
    const antiPatterns = patternFiles.filter(f => f.includes('/anti/'))

    it.each(antiPatterns)('%s should have alwaysApply: true', (filePath) => {
      const fm = extractFrontmatter(filePath)
      expect(fm?.alwaysApply).toBe(true)
    })
  })

  describe('Pattern index should be always loaded', () => {
    it('patterns/index.md should have alwaysApply: true', () => {
      const indexPath = join(CELLM_CORE_DIR, 'patterns/index.md')
      if (existsSync(indexPath)) {
        const fm = extractFrontmatter(indexPath)
        expect(fm?.alwaysApply).toBe(true)
      }
    })
  })
})

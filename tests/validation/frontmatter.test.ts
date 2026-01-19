/**
 * Tests for frontmatter validation in cellm-core files
 * Validates that all markdown files have valid frontmatter matching their schemas
 */

import { describe, it, expect } from 'vitest'
import { basename } from 'path'
import {
  getFilesByType,
  extractFrontmatter,
  getRelativePath,
  isValidRuleId,
  isValidPatternId,
  isKebabCase,
  isValidAgent,
  isValidPhase,
  isValidSeverity,
  CELLM_CORE_DIR
} from '../utils/helpers'

describe('Rules Frontmatter', () => {
  const ruleFiles = getFilesByType('rules')

  it('should have rule files', () => {
    expect(ruleFiles.length).toBeGreaterThan(0)
  })

  describe.each(ruleFiles)('%s', (filePath) => {
    const relativePath = getRelativePath(filePath)
    const frontmatter = extractFrontmatter(filePath)

    it('should have frontmatter', () => {
      expect(frontmatter).not.toBeNull()
    })

    it('should have valid id', () => {
      expect(frontmatter).toHaveProperty('id')
      expect(typeof frontmatter!.id).toBe('string')
      expect(isValidRuleId(frontmatter!.id as string)).toBe(true)
    })

    it('should have alwaysApply or paths', () => {
      const hasAlwaysApply = frontmatter!.alwaysApply === true
      const hasPaths = Array.isArray(frontmatter!.paths) && frontmatter!.paths.length > 0

      expect(hasAlwaysApply || hasPaths).toBe(true)
    })
  })
})

describe('Patterns Frontmatter', () => {
  const patternFiles = getFilesByType('patterns')

  it('should have pattern files', () => {
    expect(patternFiles.length).toBeGreaterThan(0)
  })

  describe.each(patternFiles)('%s', (filePath) => {
    const relativePath = getRelativePath(filePath)
    const frontmatter = extractFrontmatter(filePath)

    it('should have frontmatter', () => {
      expect(frontmatter).not.toBeNull()
    })

    it('should have valid id', () => {
      expect(frontmatter).toHaveProperty('id')
      expect(typeof frontmatter!.id).toBe('string')
      expect(isValidPatternId(frontmatter!.id as string)).toBe(true)
    })

    it('should have valid severity if present', () => {
      if (frontmatter!.severity) {
        expect(isValidSeverity(frontmatter!.severity as string)).toBe(true)
      }
    })
  })
})

describe('Workflows Frontmatter', () => {
  const workflowFiles = getFilesByType('workflows')

  it('should have workflow files', () => {
    expect(workflowFiles.length).toBeGreaterThan(0)
  })

  describe.each(workflowFiles)('%s', (filePath) => {
    const relativePath = getRelativePath(filePath)
    const frontmatter = extractFrontmatter(filePath)

    it('should have frontmatter', () => {
      expect(frontmatter).not.toBeNull()
    })

    it('should have valid workflow name', () => {
      expect(frontmatter).toHaveProperty('workflow')
      expect(typeof frontmatter!.workflow).toBe('string')
      expect(isKebabCase(frontmatter!.workflow as string)).toBe(true)
    })

    it('should have valid phase', () => {
      expect(frontmatter).toHaveProperty('phase')
      expect(isValidPhase(frontmatter!.phase as string)).toBe(true)
    })

    it('should have valid agent', () => {
      expect(frontmatter).toHaveProperty('agent')
      expect(isValidAgent(frontmatter!.agent as string)).toBe(true)
    })
  })
})

describe('Commands Frontmatter', () => {
  const commandFiles = getFilesByType('commands')

  it('should have command files', () => {
    expect(commandFiles.length).toBeGreaterThan(0)
  })

  describe.each(commandFiles)('%s', (filePath) => {
    const relativePath = getRelativePath(filePath)
    const frontmatter = extractFrontmatter(filePath)

    it('should have frontmatter', () => {
      expect(frontmatter).not.toBeNull()
    })

    it('should have valid command name', () => {
      expect(frontmatter).toHaveProperty('command')
      expect(typeof frontmatter!.command).toBe('string')
      expect(isKebabCase(frontmatter!.command as string)).toBe(true)
    })

    it('should have valid agent', () => {
      expect(frontmatter).toHaveProperty('agent')
      expect(isValidAgent(frontmatter!.agent as string)).toBe(true)
    })
  })
})

describe('Agents Frontmatter', () => {
  const agentFiles = getFilesByType('agents')

  it('should have agent files', () => {
    expect(agentFiles.length).toBeGreaterThan(0)
  })

  describe.each(agentFiles)('%s', (filePath) => {
    const relativePath = getRelativePath(filePath)
    const frontmatter = extractFrontmatter(filePath)

    it('should have frontmatter', () => {
      expect(frontmatter).not.toBeNull()
    })

    it('should have valid agent name', () => {
      expect(frontmatter).toHaveProperty('agent')
      expect(isValidAgent(frontmatter!.agent as string)).toBe(true)
    })

    it('should have triggers array', () => {
      expect(frontmatter).toHaveProperty('triggers')
      expect(Array.isArray(frontmatter!.triggers)).toBe(true)
      expect((frontmatter!.triggers as string[]).length).toBeGreaterThan(0)
    })

    it('should have triggers starting with /', () => {
      const triggers = frontmatter!.triggers as string[]
      for (const trigger of triggers) {
        expect(trigger.startsWith('/')).toBe(true)
      }
    })
  })
})

describe('Skills Frontmatter', () => {
  const skillFiles = getFilesByType('skills')

  it('should have skill files', () => {
    expect(skillFiles.length).toBeGreaterThan(0)
  })

  describe.each(skillFiles)('%s', (filePath) => {
    const relativePath = getRelativePath(filePath)
    const frontmatter = extractFrontmatter(filePath)

    it('should have frontmatter', () => {
      expect(frontmatter).not.toBeNull()
    })

    it('should have valid skill name', () => {
      expect(frontmatter).toHaveProperty('skill')
      expect(typeof frontmatter!.skill).toBe('string')
      expect(isKebabCase(frontmatter!.skill as string)).toBe(true)
    })

    it('should have triggers array', () => {
      expect(frontmatter).toHaveProperty('triggers')
      expect(Array.isArray(frontmatter!.triggers)).toBe(true)
      expect((frontmatter!.triggers as string[]).length).toBeGreaterThan(0)
    })
  })
})

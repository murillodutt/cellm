/**
 * Integration tests for CELLM structure
 * Validates directory structure, file organization, and cross-references
 */

import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync, readFileSync, statSync } from 'fs'
import { join } from 'path'
import {
  CELLM_CORE_DIR,
  SCHEMAS_DIR,
  ROOT_DIR,
  getFilesByType,
  extractFrontmatter
} from '../utils/helpers'

describe('Directory Structure', () => {
  const REQUIRED_DIRS = [
    'rules',
    'rules/core',
    'rules/domain',
    'patterns',
    'patterns/core',
    'patterns/anti',
    'commands',
    'workflows',
    'agents',
    'skills',
    'templates'
  ]

  it.each(REQUIRED_DIRS)('should have %s directory', (dir) => {
    const fullPath = join(CELLM_CORE_DIR, dir)
    expect(existsSync(fullPath)).toBe(true)
    expect(statSync(fullPath).isDirectory()).toBe(true)
  })

  it('should have INDEX.md', () => {
    const indexPath = join(CELLM_CORE_DIR, 'INDEX.md')
    expect(existsSync(indexPath)).toBe(true)
  })

  it('should have schemas directory', () => {
    expect(existsSync(SCHEMAS_DIR)).toBe(true)
    expect(statSync(SCHEMAS_DIR).isDirectory()).toBe(true)
  })
})

describe('File Counts', () => {
  it('should have at least 4 core rules', () => {
    const coreRulesDir = join(CELLM_CORE_DIR, 'rules/core')
    const files = readdirSync(coreRulesDir).filter(f => f.endsWith('.md'))
    expect(files.length).toBeGreaterThanOrEqual(4)
  })

  it('should have architecture rules', () => {
    const archRulesDir = join(CELLM_CORE_DIR, 'rules/architecture')
    const files = readdirSync(archRulesDir).filter(f => f.endsWith('.md'))
    expect(files.length).toBeGreaterThanOrEqual(2)
  })

  it('should have at least 3 domain rules', () => {
    const domainRulesDir = join(CELLM_CORE_DIR, 'rules/domain')
    const files = readdirSync(domainRulesDir).filter(f => f.endsWith('.md'))
    expect(files.length).toBeGreaterThanOrEqual(3)
  })

  it('should have anti-patterns', () => {
    const antiDir = join(CELLM_CORE_DIR, 'patterns/anti')
    const files = readdirSync(antiDir).filter(f => f.endsWith('.md'))
    expect(files.length).toBeGreaterThanOrEqual(1)
  })

  it('should have 4 agents', () => {
    const agentFiles = getFilesByType('agents')
    expect(agentFiles.length).toBe(4)
  })

  it('should have at least 6 workflows', () => {
    const workflowFiles = getFilesByType('workflows')
    expect(workflowFiles.length).toBeGreaterThanOrEqual(6)
  })

  it('should have at least 10 commands', () => {
    const commandFiles = getFilesByType('commands')
    expect(commandFiles.length).toBeGreaterThanOrEqual(10)
  })

  it('should have at least 7 skills', () => {
    const skillFiles = getFilesByType('skills')
    expect(skillFiles.length).toBeGreaterThanOrEqual(7)
  })
})

describe('Cross-References', () => {
  it('all workflow agents should be defined', () => {
    const workflowFiles = getFilesByType('workflows')
    const agentFiles = getFilesByType('agents')

    // Get defined agents
    const definedAgents = new Set<string>()
    for (const file of agentFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.agent) {
        definedAgents.add(fm.agent as string)
      }
    }

    // Check workflow agents
    const missingAgents: string[] = []
    for (const file of workflowFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.agent && !definedAgents.has(fm.agent as string)) {
        missingAgents.push(`${fm.workflow}: ${fm.agent}`)
      }
    }

    expect(missingAgents).toEqual([])
  })

  it('all command agents should be defined', () => {
    const commandFiles = getFilesByType('commands')
    const agentFiles = getFilesByType('agents')

    // Get defined agents
    const definedAgents = new Set<string>()
    for (const file of agentFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.agent) {
        definedAgents.add(fm.agent as string)
      }
    }

    // Check command agents
    const missingAgents: string[] = []
    for (const file of commandFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.agent && !definedAgents.has(fm.agent as string)) {
        missingAgents.push(`${fm.command}: ${fm.agent}`)
      }
    }

    expect(missingAgents).toEqual([])
  })

  it('each command with workflow should have matching workflow file', () => {
    const commandFiles = getFilesByType('commands')
    const workflowFiles = getFilesByType('workflows')

    // Get defined workflows
    const definedWorkflows = new Set<string>()
    for (const file of workflowFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.workflow) {
        definedWorkflows.add(fm.workflow as string)
      }
    }

    // Commands that should have workflows (based on naming convention)
    const commandsNeedingWorkflows = ['plan-product', 'shape-spec', 'write-spec', 'create-tasks', 'implement', 'verify']

    for (const command of commandsNeedingWorkflows) {
      expect(definedWorkflows.has(command)).toBe(true)
    }
  })
})

describe('Agent Triggers', () => {
  it('all agent triggers should map to existing commands', () => {
    const agentFiles = getFilesByType('agents')
    const commandFiles = getFilesByType('commands')

    // Get defined commands
    const definedCommands = new Set<string>()
    for (const file of commandFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.command) {
        definedCommands.add(`/${fm.command}`)
      }
    }

    // Check agent triggers
    const unknownTriggers: string[] = []
    for (const file of agentFiles) {
      const fm = extractFrontmatter(file)
      if (fm?.triggers && Array.isArray(fm.triggers)) {
        for (const trigger of fm.triggers as string[]) {
          if (!definedCommands.has(trigger)) {
            unknownTriggers.push(`${fm.agent}: ${trigger}`)
          }
        }
      }
    }

    expect(unknownTriggers).toEqual([])
  })
})

describe('Required Core Files (Dynamic)', () => {
  // Instead of hardcoded lists, we verify minimum counts and key files
  // This prevents tests from becoming stale when files are added/renamed

  describe('Core rules directory', () => {
    const coreRulesDir = join(CELLM_CORE_DIR, 'rules/core')
    const coreFiles = readdirSync(coreRulesDir).filter(f => f.endsWith('.md'))

    it('should have at least 3 core rules', () => {
      expect(coreFiles.length).toBeGreaterThanOrEqual(3)
    })

    it('all core rule files should have valid frontmatter', () => {
      const invalid: string[] = []
      for (const file of coreFiles) {
        const fm = extractFrontmatter(join(coreRulesDir, file))
        if (!fm?.id || !fm?.version) {
          invalid.push(file)
        }
      }
      expect(invalid).toEqual([])
    })

    // Key files that MUST exist (minimal set)
    it('should have conventions.md (foundational)', () => {
      expect(existsSync(join(coreRulesDir, 'conventions.md'))).toBe(true)
    })

    it('should have limits.md (foundational)', () => {
      expect(existsSync(join(coreRulesDir, 'limits.md'))).toBe(true)
    })
  })

  describe('Architecture rules directory', () => {
    const archRulesDir = join(CELLM_CORE_DIR, 'rules/architecture')
    const archFiles = readdirSync(archRulesDir).filter(f => f.endsWith('.md'))

    it('should have at least 2 architecture rules', () => {
      expect(archFiles.length).toBeGreaterThanOrEqual(2)
    })

    it('all architecture rule files should have valid frontmatter', () => {
      const invalid: string[] = []
      for (const file of archFiles) {
        const fm = extractFrontmatter(join(archRulesDir, file))
        if (!fm?.id || !fm?.version) {
          invalid.push(file)
        }
      }
      expect(invalid).toEqual([])
    })
  })

  describe('Domain rules directory', () => {
    const domainRulesDir = join(CELLM_CORE_DIR, 'rules/domain')
    const domainFiles = readdirSync(domainRulesDir).filter(f => f.endsWith('.md'))

    it('should have at least 3 domain rules', () => {
      expect(domainFiles.length).toBeGreaterThanOrEqual(3)
    })

    // Key files that MUST exist (minimal set)
    it('should have frontend.md', () => {
      expect(existsSync(join(domainRulesDir, 'frontend.md'))).toBe(true)
    })

    it('should have backend.md', () => {
      expect(existsSync(join(domainRulesDir, 'backend.md'))).toBe(true)
    })
  })

  describe('Agents directory', () => {
    const agentsDir = join(CELLM_CORE_DIR, 'agents')
    const agentFiles = readdirSync(agentsDir).filter(f => f.endsWith('.md'))

    it('should have exactly 4 agents', () => {
      // Agents are a fixed set - this is intentional
      expect(agentFiles.length).toBe(4)
    })

    it('all agent files should have valid frontmatter with agent field', () => {
      const invalid: string[] = []
      for (const file of agentFiles) {
        const fm = extractFrontmatter(join(agentsDir, file))
        if (!fm?.agent || !fm?.id) {
          invalid.push(file)
        }
      }
      expect(invalid).toEqual([])
    })
  })
})

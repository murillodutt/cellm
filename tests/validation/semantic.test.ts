/**
 * Semantic validation tests for CELLM
 * Validates content meaning, not just structure
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { basename } from 'path'
import {
  getFilesByType,
  extractFrontmatter,
  getRelativePath,
  CELLM_CORE_DIR
} from '../utils/helpers'

/**
 * Get all defined agents from agent files
 */
function getDefinedAgents(): Map<string, { triggers: string[], file: string }> {
  const agents = new Map<string, { triggers: string[], file: string }>()
  const agentFiles = getFilesByType('agents')

  for (const file of agentFiles) {
    const fm = extractFrontmatter(file)
    if (fm?.agent) {
      agents.set(fm.agent as string, {
        triggers: (fm.triggers as string[]) || [],
        file: getRelativePath(file)
      })
    }
  }

  return agents
}

/**
 * Get all defined commands from command files
 */
function getDefinedCommands(): Map<string, { agent: string, file: string }> {
  const commands = new Map<string, { agent: string, file: string }>()
  const commandFiles = getFilesByType('commands')

  for (const file of commandFiles) {
    const fm = extractFrontmatter(file)
    if (fm?.command) {
      commands.set(fm.command as string, {
        agent: (fm.agent as string) || '',
        file: getRelativePath(file)
      })
    }
  }

  return commands
}

/**
 * Get all defined workflows from workflow files
 */
function getDefinedWorkflows(): Map<string, { agent: string, phase: string, file: string }> {
  const workflows = new Map<string, { agent: string, phase: string, file: string }>()
  const workflowFiles = getFilesByType('workflows')

  for (const file of workflowFiles) {
    const fm = extractFrontmatter(file)
    if (fm?.workflow) {
      workflows.set(fm.workflow as string, {
        agent: (fm.agent as string) || '',
        phase: (fm.phase as string) || '',
        file: getRelativePath(file)
      })
    }
  }

  return workflows
}

/**
 * Get all defined skills from skill files
 */
function getDefinedSkills(): Map<string, { triggers: string[], file: string }> {
  const skills = new Map<string, { triggers: string[], file: string }>()
  const skillFiles = getFilesByType('skills')

  for (const file of skillFiles) {
    const fm = extractFrontmatter(file)
    if (fm?.skill) {
      skills.set(fm.skill as string, {
        triggers: (fm.triggers as string[]) || [],
        file: getRelativePath(file)
      })
    }
  }

  return skills
}

describe('Cross-Reference Validation', () => {
  const agents = getDefinedAgents()
  const commands = getDefinedCommands()
  const workflows = getDefinedWorkflows()
  const skills = getDefinedSkills()

  describe('Agent → Command References', () => {
    it('all agent triggers should reference existing commands', () => {
      const errors: string[] = []

      for (const [agentName, agentData] of agents) {
        for (const trigger of agentData.triggers) {
          // Remove leading slash
          const commandName = trigger.replace(/^\//, '')

          if (!commands.has(commandName)) {
            errors.push(`Agent "${agentName}" references unknown command "${trigger}" (file: ${agentData.file})`)
          }
        }
      }

      if (errors.length > 0) {
        console.log('Agent → Command reference errors:')
        errors.forEach(e => console.log(`  - ${e}`))
      }

      expect(errors).toEqual([])
    })
  })

  describe('Command → Agent References', () => {
    it('all commands should reference existing agents', () => {
      const errors: string[] = []

      for (const [commandName, commandData] of commands) {
        if (!agents.has(commandData.agent)) {
          errors.push(`Command "${commandName}" references unknown agent "${commandData.agent}" (file: ${commandData.file})`)
        }
      }

      if (errors.length > 0) {
        console.log('Command → Agent reference errors:')
        errors.forEach(e => console.log(`  - ${e}`))
      }

      expect(errors).toEqual([])
    })
  })

  describe('Workflow → Agent References', () => {
    it('all workflows should reference existing agents', () => {
      const errors: string[] = []

      for (const [workflowName, workflowData] of workflows) {
        if (!agents.has(workflowData.agent)) {
          errors.push(`Workflow "${workflowName}" references unknown agent "${workflowData.agent}" (file: ${workflowData.file})`)
        }
      }

      if (errors.length > 0) {
        console.log('Workflow → Agent reference errors:')
        errors.forEach(e => console.log(`  - ${e}`))
      }

      expect(errors).toEqual([])
    })
  })

  describe('Command ↔ Workflow Consistency', () => {
    it('commands with matching workflows should use the same agent', () => {
      const errors: string[] = []

      for (const [commandName, commandData] of commands) {
        if (workflows.has(commandName)) {
          const workflowData = workflows.get(commandName)!

          if (commandData.agent !== workflowData.agent) {
            errors.push(
              `Command "${commandName}" uses agent "${commandData.agent}" but workflow uses "${workflowData.agent}"`
            )
          }
        }
      }

      if (errors.length > 0) {
        console.log('Command ↔ Workflow agent mismatch:')
        errors.forEach(e => console.log(`  - ${e}`))
      }

      expect(errors).toEqual([])
    })

    it('workflow commands should have corresponding command files', () => {
      const workflowCommands = ['plan-product', 'shape-spec', 'write-spec', 'create-tasks', 'implement', 'verify']
      const errors: string[] = []

      for (const cmd of workflowCommands) {
        if (!commands.has(cmd)) {
          errors.push(`Workflow command "${cmd}" has no corresponding command file`)
        }
        if (!workflows.has(cmd)) {
          errors.push(`Workflow command "${cmd}" has no corresponding workflow file`)
        }
      }

      expect(errors).toEqual([])
    })
  })

  describe('Agent Coverage', () => {
    it('all agents should have at least one trigger', () => {
      const errors: string[] = []

      for (const [agentName, agentData] of agents) {
        if (agentData.triggers.length === 0) {
          errors.push(`Agent "${agentName}" has no triggers (file: ${agentData.file})`)
        }
      }

      expect(errors).toEqual([])
    })

    it('all commands should be covered by an agent trigger', () => {
      const coveredCommands = new Set<string>()

      for (const [, agentData] of agents) {
        for (const trigger of agentData.triggers) {
          coveredCommands.add(trigger.replace(/^\//, ''))
        }
      }

      const errors: string[] = []
      for (const [commandName] of commands) {
        if (!coveredCommands.has(commandName)) {
          errors.push(`Command "/${commandName}" is not covered by any agent trigger`)
        }
      }

      if (errors.length > 0) {
        console.log('Uncovered commands:')
        errors.forEach(e => console.log(`  - ${e}`))
      }

      expect(errors).toEqual([])
    })
  })
})

describe('Content Structure Validation', () => {
  describe('Rules Content', () => {
    const ruleFiles = getFilesByType('rules')

    it.each(ruleFiles)('%s should have markdown headings', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      const hasHeadings = /^#+\s+.+$/m.test(content)

      expect(hasHeadings).toBe(true)
    })

    it.each(ruleFiles)('%s should have meaningful content (>100 chars)', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')
      // Remove frontmatter
      const bodyContent = content.replace(/^---[\s\S]*?---\n/, '')

      expect(bodyContent.length).toBeGreaterThan(100)
    })
  })

  describe('Patterns Content', () => {
    const patternFiles = getFilesByType('patterns')

    it.each(patternFiles)('%s should have code examples or lists', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')

      // Check for code blocks, lists, tables, or arrow notation (→)
      const hasCodeBlocks = /```[\s\S]*?```/.test(content)
      const hasLists = /^[-*]\s+.+$/m.test(content)
      const hasTables = /^\|.+\|$/m.test(content)
      const hasArrowNotation = /→/.test(content)
      const hasBoldItems = /\*\*[A-Z]+-[0-9]+:/.test(content) // Pattern IDs in bold

      expect(hasCodeBlocks || hasLists || hasTables || hasArrowNotation || hasBoldItems).toBe(true)
    })
  })

  describe('Commands Content', () => {
    const commandFiles = getFilesByType('commands')

    it.each(commandFiles)('%s should describe what to load or do', (filePath) => {
      const content = readFileSync(filePath, 'utf-8').toLowerCase()

      // Commands should mention loading, steps, output, subcommands, or actions
      const hasLoadSection = content.includes('carregar') || content.includes('load')
      const hasStepsSection = content.includes('passos') || content.includes('steps') || content.includes('fluxo')
      const hasOutputSection = content.includes('output') || content.includes('saída')
      const hasSubcommands = content.includes('subcomando') || content.includes('subcommand')
      const hasNumberedSteps = /^\d+\.\s+/m.test(content) // Numbered lists (1. 2. 3.)
      const hasActions = content.includes('ler') || content.includes('gerar') || content.includes('mostrar')

      expect(hasLoadSection || hasStepsSection || hasOutputSection || hasSubcommands || hasNumberedSteps || hasActions).toBe(true)
    })
  })

  describe('Workflows Content', () => {
    const workflowFiles = getFilesByType('workflows')

    it.each(workflowFiles)('%s should have preconditions or flow', (filePath) => {
      const content = readFileSync(filePath, 'utf-8').toLowerCase()

      const hasPreconditions = content.includes('pré-condição') || content.includes('precondition') || content.includes('pré-condições')
      const hasFlow = content.includes('fluxo') || content.includes('flow') || content.includes('passos') || content.includes('steps')
      const hasValidation = content.includes('validação') || content.includes('validation')

      expect(hasPreconditions || hasFlow || hasValidation).toBe(true)
    })
  })

  describe('Agents Content', () => {
    const agentFiles = getFilesByType('agents')

    it.each(agentFiles)('%s should describe responsibilities', (filePath) => {
      const content = readFileSync(filePath, 'utf-8').toLowerCase()

      const hasResponsibilities = content.includes('responsabilidade') || content.includes('responsibilit')
      const hasRole = content.includes('role') || content.includes('papel')
      const hasRules = content.includes('regras') || content.includes('rules')
      const hasActions = content.includes('você') || content.includes('you') // Agent descriptions
      const hasCommandSections = /^##\s+\/[a-z-]+/m.test(content) // Command sections like "## /status"
      const hasOutputSection = content.includes('output')

      expect(hasResponsibilities || hasRole || hasRules || hasActions || hasCommandSections || hasOutputSection).toBe(true)
    })
  })

  describe('Skills Content', () => {
    const skillFiles = getFilesByType('skills')

    it.each(skillFiles)('%s should have code examples', (filePath) => {
      const content = readFileSync(filePath, 'utf-8')

      const hasCodeBlocks = /```[\s\S]*?```/.test(content)

      expect(hasCodeBlocks).toBe(true)
    })

    it.each(skillFiles)('%s should mention the technology name', (filePath) => {
      const fm = extractFrontmatter(filePath)
      const content = readFileSync(filePath, 'utf-8').toLowerCase()
      const skillName = (fm?.skill as string || '').toLowerCase()

      // The skill name or related terms should appear in content
      expect(content).toContain(skillName)
    })
  })
})

describe('Path Trigger Validation', () => {
  describe('Skill Triggers', () => {
    const skills = getDefinedSkills()

    it('skill triggers should be valid glob patterns', () => {
      const errors: string[] = []

      for (const [skillName, skillData] of skills) {
        for (const trigger of skillData.triggers) {
          // Basic glob validation
          if (!trigger.includes('*') && !trigger.includes('/')) {
            errors.push(`Skill "${skillName}" has invalid trigger "${trigger}" - should be a glob pattern`)
          }
        }
      }

      expect(errors).toEqual([])
    })

    it('vue skill should trigger on .vue files', () => {
      const vueSkill = skills.get('vue')
      expect(vueSkill).toBeDefined()

      const triggersVue = vueSkill!.triggers.some(t => t.includes('.vue') || t.includes('**/*.vue'))
      expect(triggersVue).toBe(true)
    })

    it('nuxt skill should trigger on app/ or server/', () => {
      const nuxtSkill = skills.get('nuxt')
      expect(nuxtSkill).toBeDefined()

      const triggersNuxt = nuxtSkill!.triggers.some(t =>
        t.includes('app/') || t.includes('server/') || t.includes('app/**') || t.includes('server/**')
      )
      expect(triggersNuxt).toBe(true)
    })

    it('drizzle skill should trigger on database files', () => {
      const drizzleSkill = skills.get('drizzle')
      expect(drizzleSkill).toBeDefined()

      const triggersDrizzle = drizzleSkill!.triggers.some(t =>
        t.includes('database') || t.includes('schema') || t.includes('server/')
      )
      expect(triggersDrizzle).toBe(true)
    })
  })

  describe('Domain Rule Triggers', () => {
    const ruleFiles = getFilesByType('rules')
    const domainRules = ruleFiles.filter(f => f.includes('/domain/'))

    it.each(domainRules)('%s should have path triggers', (filePath) => {
      const fm = extractFrontmatter(filePath)

      // Domain rules should have paths array
      expect(fm).toHaveProperty('paths')
      expect(Array.isArray(fm!.paths)).toBe(true)
      expect((fm!.paths as string[]).length).toBeGreaterThan(0)
    })
  })
})

describe('ID Consistency', () => {
  describe('Rule IDs', () => {
    const ruleFiles = getFilesByType('rules')

    it('core rules should use consistent ID prefixes', () => {
      const coreRules = ruleFiles.filter(f => f.includes('/core/'))
      const validPrefixes = ['CONV', 'LIM', 'PROTO', 'ARCH', 'GIT']

      const errors: string[] = []
      for (const file of coreRules) {
        const fm = extractFrontmatter(file)
        const id = fm?.id as string

        const hasValidPrefix = validPrefixes.some(p => id.startsWith(p))
        if (!hasValidPrefix) {
          errors.push(`Core rule "${basename(file)}" has ID "${id}" with unexpected prefix`)
        }
      }

      expect(errors).toEqual([])
    })

    it('domain rules should use DOM- prefix', () => {
      const domainRules = ruleFiles.filter(f => f.includes('/domain/'))

      const errors: string[] = []
      for (const file of domainRules) {
        const fm = extractFrontmatter(file)
        const id = fm?.id as string

        if (!id.startsWith('DOM-')) {
          errors.push(`Domain rule "${basename(file)}" has ID "${id}" - expected DOM- prefix`)
        }
      }

      expect(errors).toEqual([])
    })
  })

  describe('Pattern IDs', () => {
    const patternFiles = getFilesByType('patterns')

    it('anti-patterns should use ANTI- prefix', () => {
      const antiPatterns = patternFiles.filter(f => f.includes('/anti/'))

      for (const file of antiPatterns) {
        const fm = extractFrontmatter(file)
        const id = fm?.id as string

        expect(id.startsWith('ANTI') || id.startsWith('PATTERNS')).toBe(true)
      }
    })

    it('technology patterns should use technology prefix', () => {
      const techPatterns = patternFiles.filter(f => f.includes('/core/'))
      const validPrefixes = ['TS', 'VU', 'NX', 'UI', 'PN', 'DR', 'TW', 'ST', 'ES']

      const errors: string[] = []
      for (const file of techPatterns) {
        const fm = extractFrontmatter(file)
        const id = fm?.id as string

        const hasValidPrefix = validPrefixes.some(p => id.startsWith(p))
        if (!hasValidPrefix) {
          errors.push(`Tech pattern "${basename(file)}" has ID "${id}" with unexpected prefix`)
        }
      }

      expect(errors).toEqual([])
    })
  })
})

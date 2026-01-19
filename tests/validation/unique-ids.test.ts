/**
 * Tests for unique IDs across all CELLM files
 * Ensures no duplicate IDs exist in rules, patterns, etc.
 */

import { describe, it, expect } from 'vitest'
import {
  getFilesByType,
  extractFrontmatter,
  getRelativePath,
  CELLM_CORE_DIR
} from '../utils/helpers'

describe('Unique IDs', () => {
  describe('Rules', () => {
    it('should have unique IDs across all rule files', () => {
      const ruleFiles = getFilesByType('rules')
      const ids: Map<string, string[]> = new Map()

      for (const file of ruleFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.id) {
          const id = frontmatter.id as string
          const relativePath = getRelativePath(file)

          if (!ids.has(id)) {
            ids.set(id, [])
          }
          ids.get(id)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [id, files] of ids) {
        if (files.length > 1) {
          duplicates.push(`${id}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })

  describe('Patterns', () => {
    it('should have unique IDs across all pattern files', () => {
      const patternFiles = getFilesByType('patterns')
      const ids: Map<string, string[]> = new Map()

      for (const file of patternFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.id) {
          const id = frontmatter.id as string
          const relativePath = getRelativePath(file)

          if (!ids.has(id)) {
            ids.set(id, [])
          }
          ids.get(id)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [id, files] of ids) {
        if (files.length > 1) {
          duplicates.push(`${id}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })

  describe('Global Uniqueness', () => {
    it('should have globally unique IDs across rules and patterns', () => {
      const allFiles = [
        ...getFilesByType('rules'),
        ...getFilesByType('patterns')
      ]

      const ids: Map<string, string[]> = new Map()

      for (const file of allFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.id) {
          const id = frontmatter.id as string
          const relativePath = getRelativePath(file)

          if (!ids.has(id)) {
            ids.set(id, [])
          }
          ids.get(id)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [id, files] of ids) {
        if (files.length > 1) {
          duplicates.push(`${id}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })

  describe('Commands', () => {
    it('should have unique command names', () => {
      const commandFiles = getFilesByType('commands')
      const commands: Map<string, string[]> = new Map()

      for (const file of commandFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.command) {
          const command = frontmatter.command as string
          const relativePath = getRelativePath(file)

          if (!commands.has(command)) {
            commands.set(command, [])
          }
          commands.get(command)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [command, files] of commands) {
        if (files.length > 1) {
          duplicates.push(`${command}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })

  describe('Workflows', () => {
    it('should have unique workflow names', () => {
      const workflowFiles = getFilesByType('workflows')
      const workflows: Map<string, string[]> = new Map()

      for (const file of workflowFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.workflow) {
          const workflow = frontmatter.workflow as string
          const relativePath = getRelativePath(file)

          if (!workflows.has(workflow)) {
            workflows.set(workflow, [])
          }
          workflows.get(workflow)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [workflow, files] of workflows) {
        if (files.length > 1) {
          duplicates.push(`${workflow}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })

  describe('Agents', () => {
    it('should have unique agent definitions', () => {
      const agentFiles = getFilesByType('agents')
      const agents: Map<string, string[]> = new Map()

      for (const file of agentFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.agent) {
          const agent = frontmatter.agent as string
          const relativePath = getRelativePath(file)

          if (!agents.has(agent)) {
            agents.set(agent, [])
          }
          agents.get(agent)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [agent, files] of agents) {
        if (files.length > 1) {
          duplicates.push(`${agent}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })

  describe('Skills', () => {
    it('should have unique skill names', () => {
      const skillFiles = getFilesByType('skills')
      const skills: Map<string, string[]> = new Map()

      for (const file of skillFiles) {
        const frontmatter = extractFrontmatter(file)
        if (frontmatter?.skill) {
          const skill = frontmatter.skill as string
          const relativePath = getRelativePath(file)

          if (!skills.has(skill)) {
            skills.set(skill, [])
          }
          skills.get(skill)!.push(relativePath)
        }
      }

      // Check for duplicates
      const duplicates: string[] = []
      for (const [skill, files] of skills) {
        if (files.length > 1) {
          duplicates.push(`${skill}: ${files.join(', ')}`)
        }
      }

      expect(duplicates).toEqual([])
    })
  })
})

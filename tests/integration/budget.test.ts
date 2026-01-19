/**
 * Integration tests for token budget estimation
 * Validates that core files stay within token limits
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'
import {
  CELLM_CORE_DIR,
  getFilesByType,
  extractFrontmatter,
  getRelativePath
} from '../utils/helpers'

// Token estimation: ~4 characters per token (rough approximation)
const CHARS_PER_TOKEN = 4

// Budget limits
const MAX_CORE_BUDGET = 2500 // tokens (expanded for comprehensive ban tables)
const WARN_CORE_BUDGET = 2000 // tokens
const MAX_FILE_BUDGET = 500 // tokens per file

/**
 * Estimate tokens for a file
 */
function estimateTokens(filePath: string): number {
  const content = readFileSync(filePath, 'utf-8')
  return Math.ceil(content.length / CHARS_PER_TOKEN)
}

/**
 * Get always-loaded files
 */
function getAlwaysLoadedFiles(): string[] {
  const files: string[] = []

  // Core rules (alwaysApply: true)
  const ruleFiles = getFilesByType('rules')
  for (const file of ruleFiles) {
    const fm = extractFrontmatter(file)
    if (fm?.alwaysApply === true) {
      files.push(file)
    }
  }

  // Anti-patterns (alwaysApply: true)
  const patternFiles = getFilesByType('patterns')
  for (const file of patternFiles) {
    const fm = extractFrontmatter(file)
    if (fm?.alwaysApply === true) {
      files.push(file)
    }
  }

  return files
}

describe('Token Budget', () => {
  describe('Core Budget', () => {
    it('should stay within core budget limit', () => {
      const alwaysLoadedFiles = getAlwaysLoadedFiles()
      let totalTokens = 0

      for (const file of alwaysLoadedFiles) {
        totalTokens += estimateTokens(file)
      }

      expect(totalTokens).toBeLessThanOrEqual(MAX_CORE_BUDGET)
    })

    it('should ideally stay within warning threshold', () => {
      const alwaysLoadedFiles = getAlwaysLoadedFiles()
      let totalTokens = 0

      for (const file of alwaysLoadedFiles) {
        totalTokens += estimateTokens(file)
      }

      // This is a soft check - we log a warning but don't fail
      if (totalTokens > WARN_CORE_BUDGET) {
        console.warn(`Core budget warning: ${totalTokens} tokens (threshold: ${WARN_CORE_BUDGET})`)
      }

      expect(totalTokens).toBeLessThanOrEqual(MAX_CORE_BUDGET)
    })
  })

  describe('Individual File Budgets', () => {
    const ruleFiles = getFilesByType('rules')
    const patternFiles = getFilesByType('patterns')
    const workflowFiles = getFilesByType('workflows')
    const commandFiles = getFilesByType('commands')
    const agentFiles = getFilesByType('agents')
    const skillFiles = getFilesByType('skills')

    describe('Rules', () => {
      it.each(ruleFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        const relativePath = getRelativePath(filePath)

        if (tokens > MAX_FILE_BUDGET) {
          console.warn(`${relativePath}: ${tokens} tokens (limit: ${MAX_FILE_BUDGET})`)
        }

        // Allow up to 2x for larger files, but warn
        expect(tokens).toBeLessThanOrEqual(MAX_FILE_BUDGET * 2)
      })
    })

    describe('Patterns', () => {
      it.each(patternFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        const relativePath = getRelativePath(filePath)

        if (tokens > MAX_FILE_BUDGET) {
          console.warn(`${relativePath}: ${tokens} tokens (limit: ${MAX_FILE_BUDGET})`)
        }

        // Patterns can be larger due to code examples (up to 5x for comprehensive patterns)
        expect(tokens).toBeLessThanOrEqual(MAX_FILE_BUDGET * 5)
      })
    })

    describe('Workflows', () => {
      it.each(workflowFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        expect(tokens).toBeLessThanOrEqual(MAX_FILE_BUDGET * 2)
      })
    })

    describe('Commands', () => {
      it.each(commandFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        expect(tokens).toBeLessThanOrEqual(MAX_FILE_BUDGET * 2)
      })
    })

    describe('Agents', () => {
      it.each(agentFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        expect(tokens).toBeLessThanOrEqual(MAX_FILE_BUDGET * 2)
      })
    })

    describe('Skills', () => {
      it.each(skillFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        // Skills can be larger due to code examples
        expect(tokens).toBeLessThanOrEqual(MAX_FILE_BUDGET * 3)
      })
    })
  })

  describe('Budget Summary', () => {
    it('should log budget summary', () => {
      const categories = [
        { name: 'Rules', files: getFilesByType('rules') },
        { name: 'Patterns', files: getFilesByType('patterns') },
        { name: 'Workflows', files: getFilesByType('workflows') },
        { name: 'Commands', files: getFilesByType('commands') },
        { name: 'Agents', files: getFilesByType('agents') },
        { name: 'Skills', files: getFilesByType('skills') }
      ]

      console.log('\n=== Token Budget Summary ===')

      let grandTotal = 0

      for (const category of categories) {
        let categoryTotal = 0
        for (const file of category.files) {
          categoryTotal += estimateTokens(file)
        }
        grandTotal += categoryTotal
        console.log(`${category.name}: ~${categoryTotal} tokens (${category.files.length} files)`)
      }

      console.log(`---`)
      console.log(`Total: ~${grandTotal} tokens`)

      const alwaysLoaded = getAlwaysLoadedFiles()
      let coreTotal = 0
      for (const file of alwaysLoaded) {
        coreTotal += estimateTokens(file)
      }
      console.log(`Core (always loaded): ~${coreTotal} tokens (${alwaysLoaded.length} files)`)
      console.log('===========================\n')

      expect(true).toBe(true) // Always pass, just for logging
    })
  })
})

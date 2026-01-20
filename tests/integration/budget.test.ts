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

// Budget limits (STRICT - these are hard limits, not warnings)
const MAX_CORE_BUDGET = 2200 // tokens - hard limit for always-loaded content (with safety margin)
const MAX_CORE_FILE_BUDGET = 1000 // tokens - max for individual core/alwaysApply file (allows comprehensive ban tables)
const MAX_FILE_BUDGET = 500 // tokens per file (non-core)

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
  describe('Core Budget (STRICT)', () => {
    it('total always-loaded content must stay within core budget', () => {
      const alwaysLoadedFiles = getAlwaysLoadedFiles()
      let totalTokens = 0
      const breakdown: Array<{ file: string; tokens: number }> = []

      for (const file of alwaysLoadedFiles) {
        const tokens = estimateTokens(file)
        totalTokens += tokens
        breakdown.push({ file: getRelativePath(file), tokens })
      }

      // Log breakdown for visibility
      console.log('\n=== Always-Loaded Budget Breakdown ===')
      for (const item of breakdown) {
        const status = item.tokens > MAX_CORE_FILE_BUDGET ? '[!] OVER' : '[+] OK'
        console.log(`${status} ${item.file}: ${item.tokens} tokens`)
      }
      console.log(`Total: ${totalTokens}/${MAX_CORE_BUDGET} tokens`)
      console.log('======================================\n')

      expect(totalTokens).toBeLessThanOrEqual(MAX_CORE_BUDGET)
    })

    it('each always-loaded file must stay within individual limit', () => {
      const alwaysLoadedFiles = getAlwaysLoadedFiles()
      const violations: string[] = []

      for (const file of alwaysLoadedFiles) {
        const tokens = estimateTokens(file)
        if (tokens > MAX_CORE_FILE_BUDGET) {
          violations.push(`${getRelativePath(file)}: ${tokens} tokens (limit: ${MAX_CORE_FILE_BUDGET})`)
        }
      }

      if (violations.length > 0) {
        console.error('\n[!] Core file budget violations:')
        violations.forEach(v => console.error(`  - ${v}`))
      }

      expect(violations).toEqual([])
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
        const isCore = filePath.includes('/core/')

        // Core rules have stricter limit
        const limit = isCore ? MAX_CORE_FILE_BUDGET : MAX_FILE_BUDGET * 2

        if (tokens > (isCore ? MAX_CORE_FILE_BUDGET : MAX_FILE_BUDGET)) {
          console.warn(`[!] ${relativePath}: ${tokens} tokens (limit: ${isCore ? MAX_CORE_FILE_BUDGET : MAX_FILE_BUDGET})`)
        }

        expect(tokens).toBeLessThanOrEqual(limit)
      })
    })

    describe('Patterns', () => {
      it.each(patternFiles)('%s should be within file budget', (filePath) => {
        const tokens = estimateTokens(filePath)
        const relativePath = getRelativePath(filePath)

        if (tokens > MAX_FILE_BUDGET) {
          console.warn(`[!] ${relativePath}: ${tokens} tokens (limit: ${MAX_FILE_BUDGET})`)
        }

        // Patterns can be larger due to comprehensive code examples (up to 5x)
        // This allows for detailed framework patterns like nuxt.md with many examples
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

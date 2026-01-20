import { describe, it, expect } from 'vitest'
import {
  estimateTokens,
  estimateFileTokens,
  parseBudget,
  formatTokens,
  checkBudget,
  createProgressBar,
  formatBudgetStatus,
  BUDGET_LIMITS,
} from '../../src/utils/token.js'

describe('token utils', () => {
  describe('estimateTokens', () => {
    it('estimates tokens for text', () => {
      // Roughly 4 characters per token
      const text = 'This is a test with some words'
      const tokens = estimateTokens(text)
      expect(tokens).toBeGreaterThan(0)
      expect(tokens).toBeLessThan(text.length) // Should be less than character count
    })

    it('normalizes whitespace', () => {
      const text1 = 'hello world'
      const text2 = 'hello    world'
      expect(estimateTokens(text1)).toBe(estimateTokens(text2))
    })

    it('handles empty string', () => {
      expect(estimateTokens('')).toBe(0)
    })
  })

  describe('parseBudget', () => {
    it('parses number directly', () => {
      expect(parseBudget(500)).toBe(500)
    })

    it('parses string with tilde', () => {
      expect(parseBudget('~500 tokens')).toBe(500)
    })

    it('parses plain number string', () => {
      expect(parseBudget('500')).toBe(500)
    })

    it('parses string without tokens suffix', () => {
      expect(parseBudget('~300')).toBe(300)
    })

    it('returns 0 for undefined', () => {
      expect(parseBudget(undefined)).toBe(0)
    })

    it('returns 0 for invalid string', () => {
      expect(parseBudget('invalid')).toBe(0)
    })
  })

  describe('formatTokens', () => {
    it('formats small numbers', () => {
      expect(formatTokens(500)).toBe('500 tokens')
    })

    it('formats large numbers with k suffix', () => {
      expect(formatTokens(1500)).toBe('1.5k tokens')
    })

    it('formats exactly 1000', () => {
      expect(formatTokens(1000)).toBe('1.0k tokens')
    })
  })

  describe('checkBudget', () => {
    it('returns ok for normal usage', () => {
      const status = checkBudget(1000, 2200)
      expect(status.status).toBe('ok')
      expect(status.used).toBe(1000)
      expect(status.total).toBe(2200)
    })

    it('returns warning for 90% usage', () => {
      const status = checkBudget(1980, 2200)
      expect(status.status).toBe('warning')
    })

    it('returns critical for 95% usage', () => {
      const status = checkBudget(2090, 2200)
      expect(status.status).toBe('critical')
    })

    it('returns exceeded for over 100%', () => {
      const status = checkBudget(2300, 2200)
      expect(status.status).toBe('exceeded')
    })

    it('uses default budget if not specified', () => {
      const status = checkBudget(1000)
      expect(status.total).toBe(BUDGET_LIMITS.CORE)
    })
  })

  describe('createProgressBar', () => {
    it('creates empty bar for 0%', () => {
      const bar = createProgressBar(0, 10)
      expect(bar).toBe('[          ]')
    })

    it('creates full bar for 100%', () => {
      const bar = createProgressBar(1, 10)
      expect(bar).toBe('[==========]')
    })

    it('creates half bar for 50%', () => {
      const bar = createProgressBar(0.5, 10)
      expect(bar).toBe('[=====     ]')
    })

    it('caps at 100%', () => {
      const bar = createProgressBar(1.5, 10)
      expect(bar).toBe('[==========]')
    })
  })

  describe('BUDGET_LIMITS', () => {
    it('has correct values', () => {
      expect(BUDGET_LIMITS.CORE).toBe(2200)
      expect(BUDGET_LIMITS.FILE_MAX).toBe(500)
      expect(BUDGET_LIMITS.WARNING_THRESHOLD).toBe(0.9)
      expect(BUDGET_LIMITS.CRITICAL_THRESHOLD).toBe(0.95)
    })
  })

  describe('formatBudgetStatus', () => {
    it('formats budget status correctly', () => {
      const status = {
        used: 1000,
        total: 2200,
        percentage: 0.4545,
        status: 'ok' as const,
      }
      const result = formatBudgetStatus(status)
      expect(result).toContain('1000/2200 tokens')
      expect(result).toContain('45%')
      expect(result).toContain('[')
    })

    it('includes progress bar', () => {
      const status = {
        used: 1100,
        total: 2200,
        percentage: 0.5,
        status: 'ok' as const,
      }
      const result = formatBudgetStatus(status)
      expect(result).toContain('=')
      expect(result).toContain('[')
      expect(result).toContain(']')
    })
  })

  describe('estimateFileTokens', () => {
    it('returns 0 for non-existent file', () => {
      const result = estimateFileTokens('/non/existent/path.md')
      expect(result).toBe(0)
    })
  })
})

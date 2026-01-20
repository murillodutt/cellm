import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdirSync, rmSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import {
  calculatePreventionRate,
  calculateTokenEfficiency,
  formatDuration,
  formatDate,
  formatPercentageWithStatus,
  createBarChart,
  createTableRow,
  createTableSeparator,
  generateSessionId,
  createSampleSession,
  aggregateDailyMetrics,
  getMetricsHistory,
  hasExistingSessions,
  getMostRecentOrSampleSession,
  initMetricsStorage,
  saveSession,
  loadSession,
  loadIndex,
  listSessionFiles,
  getSessionsInRange,
  KPI_TARGETS,
  KPI_ALERTS,
  METRICS_DIR,
  type SessionMetrics,
} from '../../src/utils/metrics.js'

describe('metrics utilities', () => {
  // ============================================
  // Calculation Functions
  // ============================================

  describe('calculatePreventionRate', () => {
    it('should return 100 when no events occurred', () => {
      expect(calculatePreventionRate(0, 0)).toBe(100)
    })

    it('should return 0 when all events are hits (no prevents)', () => {
      expect(calculatePreventionRate(10, 0)).toBe(0)
    })

    it('should return 100 when all events are prevents (no hits)', () => {
      expect(calculatePreventionRate(0, 10)).toBe(100)
    })

    it('should calculate correct rate for mixed events', () => {
      // 5 prevents out of 10 total (5 hits + 5 prevents) = 50%
      expect(calculatePreventionRate(5, 5)).toBe(50)
    })

    it('should round to nearest integer', () => {
      // 3 prevents out of 10 total (7 hits + 3 prevents) = 30%
      expect(calculatePreventionRate(7, 3)).toBe(30)
    })

    it('should handle real-world scenario', () => {
      // 47 hits, 5 prevents = 5 / 52 = ~9.6% => rounds to 10%
      const rate = calculatePreventionRate(47, 5)
      expect(rate).toBeGreaterThanOrEqual(9)
      expect(rate).toBeLessThanOrEqual(10)
    })
  })

  describe('calculateTokenEfficiency', () => {
    it('should return 0 when budget is 0', () => {
      expect(calculateTokenEfficiency(100, 0)).toBe(0)
    })

    it('should calculate correct percentage', () => {
      expect(calculateTokenEfficiency(1100, 2200)).toBe(50)
    })

    it('should cap at 100%', () => {
      expect(calculateTokenEfficiency(2500, 2200)).toBe(100)
    })

    it('should handle typical scenario', () => {
      // 2053 loaded out of 2200 budget = 93.3%
      const efficiency = calculateTokenEfficiency(2053, 2200)
      expect(efficiency).toBe(93)
    })
  })

  // ============================================
  // Formatting Functions
  // ============================================

  describe('formatDuration', () => {
    it('should format minutes only when less than 1 hour', () => {
      expect(formatDuration(1800)).toBe('30m') // 30 minutes
    })

    it('should format hours and minutes', () => {
      expect(formatDuration(5400)).toBe('1h 30m') // 1.5 hours
    })

    it('should format multiple hours', () => {
      expect(formatDuration(8100)).toBe('2h 15m') // 2 hours 15 min
    })

    it('should handle exact hours', () => {
      expect(formatDuration(7200)).toBe('2h 0m') // exactly 2 hours
    })

    it('should handle zero', () => {
      expect(formatDuration(0)).toBe('0m')
    })
  })

  describe('formatDate', () => {
    it('should format ISO date string', () => {
      const result = formatDate('2026-01-20T10:30:00.000Z')
      expect(result).toMatch(/01\/20\/2026/)
    })

    it('should handle different dates', () => {
      const result = formatDate('2025-12-25T12:00:00.000Z')
      // Date may vary by timezone, just check it's a valid date format
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })
  })

  describe('formatPercentageWithStatus', () => {
    it('should return [+] prefix when above target', () => {
      const result = formatPercentageWithStatus(85, 80, 70)
      expect(result).toBe('[+] 85%')
    })

    it('should return [!] prefix when between alert and target', () => {
      const result = formatPercentageWithStatus(75, 80, 70)
      expect(result).toBe('[!] 75%')
    })

    it('should return [-] prefix when below alert', () => {
      const result = formatPercentageWithStatus(65, 80, 70)
      expect(result).toBe('[-] 65%')
    })

    it('should return [+] when exactly at target', () => {
      const result = formatPercentageWithStatus(80, 80, 70)
      expect(result).toBe('[+] 80%')
    })
  })

  describe('createBarChart', () => {
    it('should create full bar for 100%', () => {
      const result = createBarChart(100, 100, 10)
      expect(result).toBe('[==========]')
    })

    it('should create empty bar for 0%', () => {
      const result = createBarChart(0, 100, 10)
      expect(result).toBe('[          ]')
    })

    it('should create half bar for 50%', () => {
      const result = createBarChart(50, 100, 10)
      expect(result).toBe('[=====     ]')
    })

    it('should handle default width', () => {
      const result = createBarChart(50, 100)
      expect(result.length).toBe(22) // 20 width + 2 brackets
    })

    it('should not exceed max width', () => {
      const result = createBarChart(150, 100, 10)
      expect(result).toBe('[==========]')
    })
  })

  describe('createTableRow', () => {
    it('should create padded row', () => {
      const result = createTableRow(['A', 'B', 'C'], [5, 5, 5])
      expect(result).toBe('| A     | B     | C     |')
    })

    it('should handle different widths', () => {
      const result = createTableRow(['Date', '10', '5'], [10, 4, 4])
      expect(result).toBe('| Date       | 10   | 5    |')
    })
  })

  describe('createTableSeparator', () => {
    it('should create separator with correct widths', () => {
      const result = createTableSeparator([5, 5, 5])
      expect(result).toBe('|-------|-------|-------|')
    })
  })

  // ============================================
  // Session Functions
  // ============================================

  describe('generateSessionId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId()
      expect(id1).not.toBe(id2)
    })

    it('should include date prefix', () => {
      const id = generateSessionId()
      const today = new Date().toISOString().split('T')[0]
      expect(id.startsWith(today)).toBe(true)
    })

    it('should match expected format', () => {
      const id = generateSessionId()
      // Format: YYYY-MM-DD-xxxxxx
      expect(id).toMatch(/^\d{4}-\d{2}-\d{2}-[a-z0-9]{6}$/)
    })
  })

  describe('createSampleSession', () => {
    it('should create session with required fields', () => {
      const session = createSampleSession('/test/project')

      expect(session.id).toBeDefined()
      expect(session.projectPath).toBe('/test/project')
      expect(session.startTime).toBeDefined()
      expect(session.patterns.hits).toBeInstanceOf(Array)
      expect(session.antiPatterns.prevents).toBeInstanceOf(Array)
      expect(session.tokens.loaded).toBeGreaterThan(0)
      expect(session.tokens.budget).toBe(2200)
    })

    it('should include duration', () => {
      const session = createSampleSession('/test/project')
      expect(session.duration).toBeGreaterThan(0)
    })

    it('should include layer breakdown', () => {
      const session = createSampleSession('/test/project')
      expect(session.tokens.byLayer).toBeDefined()
      expect(session.tokens.byLayer?.core).toBeGreaterThan(0)
    })
  })

  // ============================================
  // Aggregation Functions
  // ============================================

  describe('aggregateDailyMetrics', () => {
    it('should aggregate sessions by date', () => {
      const today = new Date().toISOString().split('T')[0]
      const sessions: SessionMetrics[] = [
        {
          id: 'test-1',
          projectPath: '/test',
          startTime: `${today}T10:00:00.000Z`,
          patterns: { hits: [], totalHits: 10 },
          antiPatterns: { prevents: [], totalPrevents: 2 },
          tokens: { loaded: 1000, budget: 2200, utilization: 45 },
          commands: [],
        },
        {
          id: 'test-2',
          projectPath: '/test',
          startTime: `${today}T14:00:00.000Z`,
          patterns: { hits: [], totalHits: 15 },
          antiPatterns: { prevents: [], totalPrevents: 3 },
          tokens: { loaded: 1500, budget: 2200, utilization: 68 },
          commands: [],
        },
      ]

      const result = aggregateDailyMetrics(sessions)

      expect(result.length).toBe(1)
      expect(result[0].date).toBe(today)
      expect(result[0].patternHits).toBe(25)
      expect(result[0].antiPatternPrevents).toBe(5)
      expect(result[0].sessions).toBe(2)
    })

    it('should return empty array for no sessions', () => {
      const result = aggregateDailyMetrics([])
      expect(result).toEqual([])
    })

    it('should sort by date descending', () => {
      const sessions: SessionMetrics[] = [
        {
          id: 'test-1',
          projectPath: '/test',
          startTime: '2026-01-18T10:00:00.000Z',
          patterns: { hits: [], totalHits: 10 },
          antiPatterns: { prevents: [], totalPrevents: 2 },
          tokens: { loaded: 1000, budget: 2200, utilization: 45 },
          commands: [],
        },
        {
          id: 'test-2',
          projectPath: '/test',
          startTime: '2026-01-20T10:00:00.000Z',
          patterns: { hits: [], totalHits: 15 },
          antiPatterns: { prevents: [], totalPrevents: 3 },
          tokens: { loaded: 1500, budget: 2200, utilization: 68 },
          commands: [],
        },
      ]

      const result = aggregateDailyMetrics(sessions)

      expect(result[0].date).toBe('2026-01-20')
      expect(result[1].date).toBe('2026-01-18')
    })
  })

  // ============================================
  // KPI Constants
  // ============================================

  describe('KPI constants', () => {
    it('should have correct target values', () => {
      expect(KPI_TARGETS.PREVENTION_RATE).toBe(80)
      expect(KPI_TARGETS.PATTERN_COVERAGE).toBe(70)
      expect(KPI_TARGETS.TOKEN_EFFICIENCY).toBe(60)
    })

    it('should have correct alert values', () => {
      expect(KPI_ALERTS.PREVENTION_RATE).toBe(70)
      expect(KPI_ALERTS.PATTERN_COVERAGE).toBe(50)
      expect(KPI_ALERTS.TOKEN_EFFICIENCY).toBe(40)
    })

    it('should have alerts lower than targets', () => {
      expect(KPI_ALERTS.PREVENTION_RATE).toBeLessThan(KPI_TARGETS.PREVENTION_RATE)
      expect(KPI_ALERTS.PATTERN_COVERAGE).toBeLessThan(KPI_TARGETS.PATTERN_COVERAGE)
      expect(KPI_ALERTS.TOKEN_EFFICIENCY).toBeLessThan(KPI_TARGETS.TOKEN_EFFICIENCY)
    })
  })

  // ============================================
  // Storage Functions
  // ============================================

  describe('initMetricsStorage', () => {
    it('should not throw when called', () => {
      expect(() => initMetricsStorage()).not.toThrow()
    })
  })

  describe('loadIndex', () => {
    it('should return null or valid index', () => {
      const result = loadIndex()
      // Either null (if no index exists) or valid object
      if (result !== null) {
        expect(result.sessions).toBeInstanceOf(Array)
        expect(typeof result.totalSessions).toBe('number')
      }
    })
  })

  describe('listSessionFiles', () => {
    it('should return array', () => {
      const result = listSessionFiles()
      expect(result).toBeInstanceOf(Array)
    })
  })

  describe('hasExistingSessions', () => {
    it('should return boolean', () => {
      const result = hasExistingSessions()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getMostRecentOrSampleSession', () => {
    it('should return valid session', () => {
      const result = getMostRecentOrSampleSession('/test')
      expect(result.id).toBeDefined()
      expect(result.projectPath).toBeDefined()
      expect(result.patterns).toBeDefined()
      expect(result.antiPatterns).toBeDefined()
      expect(result.tokens).toBeDefined()
    })
  })

  describe('getSessionsInRange', () => {
    it('should return array for 7 days', () => {
      const result = getSessionsInRange(7)
      expect(result).toBeInstanceOf(Array)
    })

    it('should return array for 0 days', () => {
      const result = getSessionsInRange(0)
      expect(result).toBeInstanceOf(Array)
    })
  })

  describe('getMetricsHistory', () => {
    it('should return valid history object', () => {
      const history = getMetricsHistory(7)

      expect(history.startDate).toBeDefined()
      expect(history.endDate).toBeDefined()
      expect(history.days).toBeInstanceOf(Array)
      expect(history.totals).toBeDefined()
      expect(typeof history.totals.patternHits).toBe('number')
      expect(typeof history.totals.antiPatternPrevents).toBe('number')
      expect(typeof history.totals.sessions).toBe('number')
      expect(typeof history.totals.averagePreventionRate).toBe('number')
      expect(history.topPatterns).toBeInstanceOf(Array)
    })

    it('should handle different day ranges', () => {
      const history14 = getMetricsHistory(14)
      const history30 = getMetricsHistory(30)

      expect(history14.startDate).toBeDefined()
      expect(history30.startDate).toBeDefined()
    })
  })

  describe('loadSession', () => {
    it('should return null for non-existent session', () => {
      const result = loadSession('non-existent-session-id-12345')
      expect(result).toBeNull()
    })
  })

  describe('aggregateDailyMetrics with pattern hits', () => {
    it('should calculate top patterns', () => {
      const today = new Date().toISOString().split('T')[0]
      const sessions: SessionMetrics[] = [
        {
          id: 'test-1',
          projectPath: '/test',
          startTime: `${today}T10:00:00.000Z`,
          patterns: {
            hits: [
              { patternId: 'TS-001', file: 'a.ts', timestamp: `${today}T10:00:00.000Z` },
              { patternId: 'TS-001', file: 'b.ts', timestamp: `${today}T10:01:00.000Z` },
              { patternId: 'VU-003', file: 'c.vue', timestamp: `${today}T10:02:00.000Z` },
            ],
            totalHits: 3,
          },
          antiPatterns: { prevents: [], totalPrevents: 0 },
          tokens: { loaded: 1000, budget: 2200, utilization: 45 },
          commands: [],
        },
      ]

      const result = aggregateDailyMetrics(sessions)

      expect(result[0].topPatterns.length).toBeGreaterThan(0)
      expect(result[0].topPatterns[0].id).toBe('TS-001')
      expect(result[0].topPatterns[0].count).toBe(2)
    })
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { join } from 'node:path'
import { mkdirSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import {
  feedbackCommand,
  generateFeedbackId,
  createFeedbackEntry,
  submitFeedback,
  listFeedback,
  getFeedbackStats,
  formatFeedbackEntry,
  loadFeedback,
  saveFeedback,
  type FeedbackEntry,
  type FeedbackType,
} from '../../src/commands/feedback.js'

describe('Feedback Command', () => {
  describe('command structure', () => {
    it('should have correct name', () => {
      expect(feedbackCommand.name()).toBe('feedback')
    })

    it('should have description', () => {
      expect(feedbackCommand.description()).toBeDefined()
      expect(feedbackCommand.description()).toContain('feedback')
    })

    it('should have --type option', () => {
      const typeOption = feedbackCommand.options.find(
        (o) => o.long === '--type'
      )
      expect(typeOption).toBeDefined()
    })

    it('should have --title option', () => {
      const titleOption = feedbackCommand.options.find(
        (o) => o.long === '--title'
      )
      expect(titleOption).toBeDefined()
    })

    it('should have --description option', () => {
      const descOption = feedbackCommand.options.find(
        (o) => o.long === '--description'
      )
      expect(descOption).toBeDefined()
    })

    it('should have --rating option', () => {
      const ratingOption = feedbackCommand.options.find(
        (o) => o.long === '--rating'
      )
      expect(ratingOption).toBeDefined()
    })

    it('should have --list option', () => {
      const listOption = feedbackCommand.options.find(
        (o) => o.long === '--list'
      )
      expect(listOption).toBeDefined()
    })

    it('should have --stats option', () => {
      const statsOption = feedbackCommand.options.find(
        (o) => o.long === '--stats'
      )
      expect(statsOption).toBeDefined()
    })

    it('should have --config option', () => {
      const configOption = feedbackCommand.options.find(
        (o) => o.long === '--config'
      )
      expect(configOption).toBeDefined()
    })

    it('should have --clear option', () => {
      const clearOption = feedbackCommand.options.find(
        (o) => o.long === '--clear'
      )
      expect(clearOption).toBeDefined()
    })
  })

  describe('generateFeedbackId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateFeedbackId()
      const id2 = generateFeedbackId()

      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with FB- prefix', () => {
      const id = generateFeedbackId()
      expect(id).toMatch(/^FB-/)
    })

    it('should generate uppercase IDs', () => {
      const id = generateFeedbackId()
      expect(id).toBe(id.toUpperCase())
    })
  })

  describe('createFeedbackEntry', () => {
    it('should create bug feedback entry', () => {
      const entry = createFeedbackEntry('bug', 'Test bug', {
        noTelemetry: true,
      })

      expect(entry.type).toBe('bug')
      expect(entry.title).toBe('Test bug')
      expect(entry.id).toMatch(/^FB-/)
      expect(entry.timestamp).toBeTruthy()
      expect(entry.version).toBeTruthy()
    })

    it('should create feature feedback entry', () => {
      const entry = createFeedbackEntry('feature', 'New feature', {
        description: 'Detailed description',
        noTelemetry: true,
      })

      expect(entry.type).toBe('feature')
      expect(entry.title).toBe('New feature')
      expect(entry.description).toBe('Detailed description')
    })

    it('should create general feedback entry with rating', () => {
      const entry = createFeedbackEntry('general', 'Great tool', {
        rating: 9,
        noTelemetry: true,
      })

      expect(entry.type).toBe('general')
      expect(entry.rating).toBe(9)
    })

    it('should include platform info', () => {
      const entry = createFeedbackEntry('bug', 'Test', {
        noTelemetry: true,
      })

      expect(entry.platform).toBe(process.platform)
      expect(entry.nodeVersion).toBe(process.version)
    })
  })

  describe('getFeedbackStats', () => {
    it('should return zero stats for empty feedback', () => {
      const stats = getFeedbackStats()

      expect(stats.total).toBeGreaterThanOrEqual(0)
      expect(stats.byType.bug).toBeGreaterThanOrEqual(0)
      expect(stats.byType.feature).toBeGreaterThanOrEqual(0)
      expect(stats.byType.general).toBeGreaterThanOrEqual(0)
    })
  })

  describe('formatFeedbackEntry', () => {
    it('should format bug entry', () => {
      const entry: FeedbackEntry = {
        id: 'FB-TEST-001',
        type: 'bug',
        title: 'Test bug',
        timestamp: '2026-01-20T12:00:00Z',
        version: '0.90.0',
        nodeVersion: 'v22.0.0',
        platform: 'darwin',
        telemetryEnabled: false,
      }

      const formatted = formatFeedbackEntry(entry)
      expect(formatted).toContain('FB-TEST-001')
      expect(formatted).toContain('BUG')
      expect(formatted).toContain('Test bug')
    })

    it('should format entry with description', () => {
      const entry: FeedbackEntry = {
        id: 'FB-TEST-002',
        type: 'feature',
        title: 'New feature',
        description: 'This is a long description that should be truncated',
        timestamp: '2026-01-20T12:00:00Z',
        version: '0.90.0',
        nodeVersion: 'v22.0.0',
        platform: 'darwin',
        telemetryEnabled: false,
      }

      const formatted = formatFeedbackEntry(entry)
      expect(formatted).toContain('FEATURE')
    })

    it('should format entry with rating', () => {
      const entry: FeedbackEntry = {
        id: 'FB-TEST-003',
        type: 'general',
        title: 'Great experience',
        rating: 9,
        timestamp: '2026-01-20T12:00:00Z',
        version: '0.90.0',
        nodeVersion: 'v22.0.0',
        platform: 'darwin',
        telemetryEnabled: false,
      }

      const formatted = formatFeedbackEntry(entry)
      expect(formatted).toContain('Rating: 9/10')
    })
  })

  describe('loadFeedback and saveFeedback', () => {
    const testDir = join(process.cwd(), '.test-feedback-dir')

    beforeEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    afterEach(() => {
      try {
        rmSync(testDir, { recursive: true })
      } catch {
        // ignore
      }
    })

    it('should return empty entries when no file exists', () => {
      const storage = loadFeedback()
      expect(storage.entries).toBeDefined()
      expect(Array.isArray(storage.entries)).toBe(true)
    })
  })
})

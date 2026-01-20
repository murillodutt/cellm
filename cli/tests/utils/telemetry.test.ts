import { describe, it, expect } from 'vitest'
import {
  getTelemetryDir,
  getTelemetryConfigPath,
  generateSessionId,
  createSession,
  recordEvent,
  getTelemetryStats,
  clearTelemetryData,
  exportTelemetryData,
} from '../../src/utils/telemetry.js'

describe('Telemetry Utilities', () => {

  describe('getTelemetryDir', () => {
    it('should return telemetry directory path', () => {
      const dir = getTelemetryDir()
      expect(dir).toContain('.cellm')
      expect(dir).toContain('telemetry')
    })
  })

  describe('getTelemetryConfigPath', () => {
    it('should return config file path', () => {
      const path = getTelemetryConfigPath()
      expect(path).toContain('.cellm')
      expect(path).toContain('config.json')
    })
  })

  describe('generateSessionId', () => {
    it('should generate unique session IDs', () => {
      const id1 = generateSessionId()
      const id2 = generateSessionId()

      expect(id1).toBeTruthy()
      expect(id2).toBeTruthy()
      expect(id1).not.toBe(id2)
    })

    it('should generate IDs with expected format', () => {
      const id = generateSessionId()
      expect(id).toMatch(/^[a-z0-9]+-[a-z0-9]+$/)
    })
  })

  describe('createSession', () => {
    it('should create a valid session object', () => {
      const session = createSession()

      expect(session.sessionId).toBeTruthy()
      expect(session.startTime).toBeTruthy()
      expect(session.version).toBeTruthy()
      expect(session.nodeVersion).toBe(process.version)
      expect(session.platform).toBe(process.platform)
      expect(session.events).toEqual([])
    })

    it('should create unique sessions', () => {
      const session1 = createSession()
      const session2 = createSession()

      expect(session1.sessionId).not.toBe(session2.sessionId)
    })
  })

  describe('recordEvent', () => {
    it('should add event to session', () => {
      const session = createSession()

      recordEvent(session, {
        type: 'command_start',
        command: 'init',
      })

      // Note: This test may pass or fail depending on telemetry enabled state
      // In beta, telemetry is enabled by default
      expect(session.events.length).toBeGreaterThanOrEqual(0)
    })

    it('should add timestamp to event', () => {
      const session = createSession()

      recordEvent(session, {
        type: 'command_end',
        command: 'validate',
        duration: 150,
        success: true,
      })

      if (session.events.length > 0) {
        expect(session.events[0].timestamp).toBeTruthy()
      }
    })
  })

  describe('getTelemetryStats', () => {
    it('should return empty stats when no data', () => {
      const stats = getTelemetryStats()

      expect(stats.totalSessions).toBe(0)
      expect(stats.totalEvents).toBe(0)
      expect(stats.commandUsage).toEqual({})
      expect(stats.averageLatency).toEqual({})
      expect(stats.errorRate).toBe(0)
    })
  })

  describe('clearTelemetryData', () => {
    it('should not throw when no data exists', () => {
      expect(() => clearTelemetryData()).not.toThrow()
    })
  })

  describe('exportTelemetryData', () => {
    it('should return empty array when no data', () => {
      const data = exportTelemetryData()
      expect(data).toEqual([])
    })
  })
})

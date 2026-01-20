/**
 * Beta telemetry utilities for CELLM
 *
 * Provides opt-in telemetry collection for beta testing.
 * Collects only usage patterns, never file contents or personal data.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import pkg from '../../package.json' with { type: 'json' }
const { version } = pkg

/**
 * Telemetry event types
 */
export type TelemetryEventType =
  | 'command_start'
  | 'command_end'
  | 'command_error'
  | 'validation_result'
  | 'feedback_submitted'

/**
 * Telemetry event structure
 */
export interface TelemetryEvent {
  type: TelemetryEventType
  timestamp: string
  command?: string
  duration?: number
  success?: boolean
  errorType?: string
  metadata?: Record<string, unknown>
}

/**
 * Telemetry session data
 */
export interface TelemetrySession {
  sessionId: string
  startTime: string
  version: string
  nodeVersion: string
  platform: string
  events: TelemetryEvent[]
}

/**
 * Telemetry configuration
 */
export interface TelemetryConfig {
  enabled: boolean
  sessionId: string
  events: TelemetryEvent[]
}

/**
 * Get the telemetry directory path
 */
export function getTelemetryDir(): string {
  return join(homedir(), '.cellm', 'telemetry')
}

/**
 * Get the telemetry config file path
 */
export function getTelemetryConfigPath(): string {
  return join(homedir(), '.cellm', 'config.json')
}

/**
 * Check if telemetry is enabled
 */
export function isTelemetryEnabled(): boolean {
  const configPath = getTelemetryConfigPath()
  if (!existsSync(configPath)) {
    return true // Enabled by default in beta
  }

  try {
    const config = JSON.parse(readFileSync(configPath, 'utf-8'))
    return config.telemetry !== false
  } catch {
    return true
  }
}

/**
 * Enable or disable telemetry
 */
export function setTelemetryEnabled(enabled: boolean): void {
  const configDir = join(homedir(), '.cellm')
  const configPath = getTelemetryConfigPath()

  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }

  let config: Record<string, unknown> = {}
  if (existsSync(configPath)) {
    try {
      config = JSON.parse(readFileSync(configPath, 'utf-8'))
    } catch {
      config = {}
    }
  }

  config.telemetry = enabled
  writeFileSync(configPath, JSON.stringify(config, null, 2))
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${timestamp}-${random}`
}

/**
 * Create a new telemetry session
 */
export function createSession(): TelemetrySession {
  return {
    sessionId: generateSessionId(),
    startTime: new Date().toISOString(),
    version,
    nodeVersion: process.version,
    platform: process.platform,
    events: [],
  }
}

/**
 * Record a telemetry event
 */
export function recordEvent(
  session: TelemetrySession,
  event: Omit<TelemetryEvent, 'timestamp'>
): void {
  if (!isTelemetryEnabled()) {
    return
  }

  session.events.push({
    ...event,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Save session to disk
 */
export function saveSession(session: TelemetrySession): void {
  if (!isTelemetryEnabled()) {
    return
  }

  const telemetryDir = getTelemetryDir()
  if (!existsSync(telemetryDir)) {
    mkdirSync(telemetryDir, { recursive: true })
  }

  const filename = `session-${session.sessionId}.json`
  const filepath = join(telemetryDir, filename)
  writeFileSync(filepath, JSON.stringify(session, null, 2))
}

/**
 * Get telemetry statistics
 */
export interface TelemetryStats {
  totalSessions: number
  totalEvents: number
  commandUsage: Record<string, number>
  averageLatency: Record<string, number>
  errorRate: number
}

/**
 * Calculate telemetry statistics
 */
export function getTelemetryStats(): TelemetryStats {
  const telemetryDir = getTelemetryDir()
  const stats: TelemetryStats = {
    totalSessions: 0,
    totalEvents: 0,
    commandUsage: {},
    averageLatency: {},
    errorRate: 0,
  }

  if (!existsSync(telemetryDir)) {
    return stats
  }

  const { readdirSync } = require('node:fs')
  const files = readdirSync(telemetryDir).filter((f: string) =>
    f.startsWith('session-')
  )

  const latencies: Record<string, number[]> = {}
  let totalErrors = 0
  let totalCommands = 0

  for (const file of files) {
    try {
      const session: TelemetrySession = JSON.parse(
        readFileSync(join(telemetryDir, file), 'utf-8')
      )
      stats.totalSessions++
      stats.totalEvents += session.events.length

      for (const event of session.events) {
        if (event.command) {
          stats.commandUsage[event.command] =
            (stats.commandUsage[event.command] || 0) + 1

          if (event.type === 'command_end' && event.duration) {
            if (!latencies[event.command]) {
              latencies[event.command] = []
            }
            latencies[event.command].push(event.duration)
          }

          if (event.type === 'command_error') {
            totalErrors++
          }

          totalCommands++
        }
      }
    } catch {
      // Skip invalid files
    }
  }

  // Calculate averages
  for (const [command, times] of Object.entries(latencies)) {
    stats.averageLatency[command] =
      Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  }

  stats.errorRate = totalCommands > 0 ? totalErrors / totalCommands : 0

  return stats
}

/**
 * Clear telemetry data
 */
export function clearTelemetryData(): void {
  const telemetryDir = getTelemetryDir()
  if (!existsSync(telemetryDir)) {
    return
  }

  const { readdirSync, unlinkSync } = require('node:fs')
  const files = readdirSync(telemetryDir)

  for (const file of files) {
    try {
      unlinkSync(join(telemetryDir, file))
    } catch {
      // Ignore errors
    }
  }
}

/**
 * Export telemetry data for reporting
 */
export function exportTelemetryData(): TelemetrySession[] {
  const telemetryDir = getTelemetryDir()
  const sessions: TelemetrySession[] = []

  if (!existsSync(telemetryDir)) {
    return sessions
  }

  const { readdirSync } = require('node:fs')
  const files = readdirSync(telemetryDir).filter((f: string) =>
    f.startsWith('session-')
  )

  for (const file of files) {
    try {
      const session = JSON.parse(
        readFileSync(join(telemetryDir, file), 'utf-8')
      )
      sessions.push(session)
    } catch {
      // Skip invalid files
    }
  }

  return sessions
}

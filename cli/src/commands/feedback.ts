/**
 * CELLM Feedback Command
 *
 * Collect and submit user feedback during beta testing.
 */

import { Command } from 'commander'
import { existsSync, writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import pc from 'picocolors'
import pkg from '../../package.json' with { type: 'json' }
const { version } = pkg
import {
  isTelemetryEnabled,
  setTelemetryEnabled,
  getTelemetryStats,
  clearTelemetryData,
} from '../utils/telemetry.js'

/**
 * Feedback types
 */
export type FeedbackType = 'bug' | 'feature' | 'general'

/**
 * Feedback entry structure
 */
export interface FeedbackEntry {
  id: string
  type: FeedbackType
  title: string
  description?: string
  rating?: number
  timestamp: string
  version: string
  nodeVersion: string
  platform: string
  telemetryEnabled: boolean
}

/**
 * Feedback storage
 */
export interface FeedbackStorage {
  entries: FeedbackEntry[]
}

/**
 * Get feedback storage path
 */
export function getFeedbackPath(): string {
  return join(homedir(), '.cellm', 'feedback.json')
}

/**
 * Load feedback storage
 */
export function loadFeedback(): FeedbackStorage {
  const path = getFeedbackPath()
  if (!existsSync(path)) {
    return { entries: [] }
  }

  try {
    return JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return { entries: [] }
  }
}

/**
 * Save feedback storage
 */
export function saveFeedback(storage: FeedbackStorage): void {
  const dir = join(homedir(), '.cellm')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }

  writeFileSync(getFeedbackPath(), JSON.stringify(storage, null, 2))
}

/**
 * Generate feedback ID
 */
export function generateFeedbackId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 6)
  return `FB-${timestamp}-${random}`.toUpperCase()
}

/**
 * Create a new feedback entry
 */
export function createFeedbackEntry(
  type: FeedbackType,
  title: string,
  options: {
    description?: string
    rating?: number
    noTelemetry?: boolean
  } = {}
): FeedbackEntry {
  return {
    id: generateFeedbackId(),
    type,
    title,
    description: options.description,
    rating: options.rating,
    timestamp: new Date().toISOString(),
    version,
    nodeVersion: process.version,
    platform: process.platform,
    telemetryEnabled: !options.noTelemetry && isTelemetryEnabled(),
  }
}

/**
 * Submit feedback (local storage)
 */
export function submitFeedback(entry: FeedbackEntry): { success: boolean; id: string } {
  const storage = loadFeedback()
  storage.entries.push(entry)
  saveFeedback(storage)

  return { success: true, id: entry.id }
}

/**
 * List all feedback entries
 */
export function listFeedback(): FeedbackEntry[] {
  const storage = loadFeedback()
  return storage.entries
}

/**
 * Get feedback statistics
 */
export function getFeedbackStats(): {
  total: number
  byType: Record<FeedbackType, number>
  averageRating: number | null
} {
  const storage = loadFeedback()
  const entries = storage.entries

  const byType: Record<FeedbackType, number> = {
    bug: 0,
    feature: 0,
    general: 0,
  }

  let ratingSum = 0
  let ratingCount = 0

  for (const entry of entries) {
    byType[entry.type]++
    if (entry.rating !== undefined) {
      ratingSum += entry.rating
      ratingCount++
    }
  }

  return {
    total: entries.length,
    byType,
    averageRating: ratingCount > 0 ? ratingSum / ratingCount : null,
  }
}

/**
 * Format feedback for display
 */
export function formatFeedbackEntry(entry: FeedbackEntry): string {
  const typeColor =
    entry.type === 'bug'
      ? pc.red
      : entry.type === 'feature'
        ? pc.blue
        : pc.green

  const lines = [
    `${pc.dim(entry.id)} ${typeColor(`[${entry.type.toUpperCase()}]`)} ${entry.title}`,
    pc.dim(`  ${entry.timestamp} | v${entry.version}`),
  ]

  if (entry.description) {
    lines.push(pc.dim(`  ${entry.description.substring(0, 60)}...`))
  }

  if (entry.rating !== undefined) {
    lines.push(pc.dim(`  Rating: ${entry.rating}/10`))
  }

  return lines.join('\n')
}

/**
 * Execute feedback command
 */
export async function executeFeedback(options: {
  type?: FeedbackType
  title?: string
  description?: string
  rating?: number
  noTelemetry?: boolean
  list?: boolean
  stats?: boolean
  config?: string
  clear?: boolean
}): Promise<void> {
  // Handle config subcommand
  if (options.config !== undefined) {
    if (options.config === 'true' || options.config === 'false') {
      const enabled = options.config === 'true'
      setTelemetryEnabled(enabled)
      console.log(
        `${pc.green('[+]')} Telemetry ${enabled ? 'enabled' : 'disabled'}`
      )
      return
    }

    const status = isTelemetryEnabled()
    console.log(`Telemetry: ${status ? pc.green('enabled') : pc.yellow('disabled')}`)
    return
  }

  // Handle clear
  if (options.clear) {
    clearTelemetryData()
    const storage = loadFeedback()
    storage.entries = []
    saveFeedback(storage)
    console.log(`${pc.green('[+]')} Feedback and telemetry data cleared`)
    return
  }

  // Handle stats
  if (options.stats) {
    const feedbackStats = getFeedbackStats()
    const telemetryStats = getTelemetryStats()

    console.log(pc.bold('\nFeedback Statistics'))
    console.log('-------------------')
    console.log(`Total feedback: ${feedbackStats.total}`)
    console.log(`  Bugs: ${feedbackStats.byType.bug}`)
    console.log(`  Features: ${feedbackStats.byType.feature}`)
    console.log(`  General: ${feedbackStats.byType.general}`)
    if (feedbackStats.averageRating !== null) {
      console.log(`Average rating: ${feedbackStats.averageRating.toFixed(1)}/10`)
    }

    console.log(pc.bold('\nTelemetry Statistics'))
    console.log('--------------------')
    console.log(`Sessions: ${telemetryStats.totalSessions}`)
    console.log(`Events: ${telemetryStats.totalEvents}`)
    console.log(`Error rate: ${(telemetryStats.errorRate * 100).toFixed(1)}%`)

    if (Object.keys(telemetryStats.commandUsage).length > 0) {
      console.log('\nCommand Usage:')
      for (const [cmd, count] of Object.entries(telemetryStats.commandUsage)) {
        const latency = telemetryStats.averageLatency[cmd]
        const latencyStr = latency ? ` (avg: ${latency}ms)` : ''
        console.log(`  ${cmd}: ${count}${latencyStr}`)
      }
    }

    return
  }

  // Handle list
  if (options.list) {
    const entries = listFeedback()
    if (entries.length === 0) {
      console.log(pc.dim('No feedback submitted yet'))
      return
    }

    console.log(pc.bold(`\nFeedback Entries (${entries.length})\n`))
    for (const entry of entries.slice(-10)) {
      console.log(formatFeedbackEntry(entry))
      console.log('')
    }
    return
  }

  // Submit new feedback
  if (!options.type || !options.title) {
    console.log(pc.yellow('[!]') + ' Usage: cellm feedback --type <bug|feature|general> --title "Your feedback"')
    console.log('')
    console.log('Options:')
    console.log('  --type <type>      Feedback type: bug, feature, or general')
    console.log('  --title <text>     Short summary of your feedback')
    console.log('  --description <text>  Detailed description')
    console.log('  --rating <1-10>    Satisfaction rating')
    console.log('  --no-telemetry     Don\'t include system info')
    console.log('  --list             List submitted feedback')
    console.log('  --stats            Show feedback and telemetry stats')
    console.log('  --config [true|false]  Enable/disable telemetry')
    console.log('  --clear            Clear all feedback and telemetry data')
    return
  }

  // Validate rating
  if (options.rating !== undefined && (options.rating < 1 || options.rating > 10)) {
    console.log(pc.red('[-]') + ' Rating must be between 1 and 10')
    return
  }

  const entry = createFeedbackEntry(options.type, options.title, {
    description: options.description,
    rating: options.rating,
    noTelemetry: options.noTelemetry,
  })

  const result = submitFeedback(entry)

  if (result.success) {
    console.log(pc.green('[+]') + ` Feedback submitted: ${result.id}`)
    console.log('')
    console.log(formatFeedbackEntry(entry))
    console.log('')
    console.log(pc.dim('Thank you for your feedback!'))
    console.log(pc.dim('To report on GitHub: https://github.com/murillodutt/cellm/issues'))
  } else {
    console.log(pc.red('[-]') + ' Failed to submit feedback')
  }
}

/**
 * Create the feedback command
 */
export const feedbackCommand = new Command('feedback')
  .description('Submit feedback during CELLM beta testing')
  .option('-t, --type <type>', 'Feedback type: bug, feature, or general')
  .option('--title <text>', 'Short summary of your feedback')
  .option('-d, --description <text>', 'Detailed description')
  .option('-r, --rating <number>', 'Satisfaction rating (1-10)', parseInt)
  .option('--no-telemetry', 'Don\'t include system information')
  .option('-l, --list', 'List submitted feedback')
  .option('-s, --stats', 'Show feedback and telemetry statistics')
  .option('-c, --config [enabled]', 'Configure telemetry (true/false or show status)')
  .option('--clear', 'Clear all feedback and telemetry data')
  .action(executeFeedback)

import { join } from 'node:path'
import { homedir } from 'node:os'
import { readdirSync } from 'node:fs'
import { ensureDir, fileExists, readFile, writeFile, directoryExists } from './fs.js'

// ============================================
// Types and Interfaces
// ============================================

/**
 * Pattern hit event
 */
export interface PatternHit {
  patternId: string
  file: string
  timestamp: string // ISO 8601
}

/**
 * Anti-pattern prevention event
 */
export interface AntiPatternPrevent {
  patternId: string
  file: string
  message: string
  timestamp: string // ISO 8601
}

/**
 * Command usage record
 */
export interface CommandUsage {
  command: string
  timestamp: string
  duration?: number // milliseconds
}

/**
 * Token usage breakdown
 */
export interface TokenUsage {
  loaded: number
  budget: number
  utilization: number // percentage (0-100)
  byLayer?: {
    core: number
    domain: number
    patterns: number
    project: number
    session: number
  }
}

/**
 * Session metrics
 */
export interface SessionMetrics {
  id: string
  projectPath: string
  startTime: string // ISO 8601
  endTime?: string // ISO 8601
  duration?: number // seconds

  patterns: {
    hits: PatternHit[]
    totalHits: number
  }

  antiPatterns: {
    prevents: AntiPatternPrevent[]
    totalPrevents: number
  }

  tokens: TokenUsage

  commands: CommandUsage[]
}

/**
 * Metrics index for quick lookup
 */
export interface MetricsIndex {
  lastUpdated: string
  totalSessions: number
  sessions: Array<{
    id: string
    date: string
    projectPath: string
  }>
}

/**
 * Aggregated metrics for history view
 */
export interface DailyMetrics {
  date: string
  patternHits: number
  antiPatternPrevents: number
  preventionRate: number
  sessions: number
  totalTokensUsed: number
  topPatterns: Array<{ id: string; count: number }>
}

/**
 * History report
 */
export interface MetricsHistory {
  startDate: string
  endDate: string
  days: DailyMetrics[]
  totals: {
    patternHits: number
    antiPatternPrevents: number
    sessions: number
    averagePreventionRate: number
  }
  topPatterns: Array<{ id: string; count: number; description?: string }>
}

// ============================================
// Constants
// ============================================

export const METRICS_DIR = join(homedir(), '.cellm', 'metrics')
export const SESSIONS_DIR = join(METRICS_DIR, 'sessions')
export const INDEX_FILE = join(METRICS_DIR, 'index.json')

export const KPI_TARGETS = {
  PREVENTION_RATE: 80, // > 80%
  PATTERN_COVERAGE: 70, // > 70%
  TOKEN_EFFICIENCY: 60, // > 60%
} as const

export const KPI_ALERTS = {
  PREVENTION_RATE: 70, // < 70%
  PATTERN_COVERAGE: 50, // < 50%
  TOKEN_EFFICIENCY: 40, // < 40%
} as const

// ============================================
// Storage Functions
// ============================================

/**
 * Initialize metrics storage directories
 */
export function initMetricsStorage(): void {
  ensureDir(METRICS_DIR)
  ensureDir(SESSIONS_DIR)

  // Create index if it doesn't exist
  if (!fileExists(INDEX_FILE)) {
    const initialIndex: MetricsIndex = {
      lastUpdated: new Date().toISOString(),
      totalSessions: 0,
      sessions: [],
    }
    writeFile(INDEX_FILE, JSON.stringify(initialIndex, null, 2))
  }
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  const date = new Date()
  const datePart = date.toISOString().split('T')[0]
  const randomPart = Math.random().toString(36).substring(2, 8)
  return `${datePart}-${randomPart}`
}

/**
 * Get session file path
 */
export function getSessionFilePath(sessionId: string): string {
  return join(SESSIONS_DIR, `${sessionId}.json`)
}

/**
 * Save session metrics
 */
export function saveSession(session: SessionMetrics): void {
  initMetricsStorage()

  const filePath = getSessionFilePath(session.id)
  writeFile(filePath, JSON.stringify(session, null, 2))

  // Update index
  updateIndex(session)
}

/**
 * Load session metrics
 */
export function loadSession(sessionId: string): SessionMetrics | null {
  const filePath = getSessionFilePath(sessionId)

  if (!fileExists(filePath)) {
    return null
  }

  try {
    const content = readFile(filePath)
    return JSON.parse(content) as SessionMetrics
  } catch {
    return null
  }
}

/**
 * Update metrics index
 */
function updateIndex(session: SessionMetrics): void {
  let index: MetricsIndex

  if (fileExists(INDEX_FILE)) {
    try {
      index = JSON.parse(readFile(INDEX_FILE)) as MetricsIndex
    } catch {
      index = {
        lastUpdated: new Date().toISOString(),
        totalSessions: 0,
        sessions: [],
      }
    }
  } else {
    index = {
      lastUpdated: new Date().toISOString(),
      totalSessions: 0,
      sessions: [],
    }
  }

  // Check if session already exists
  const existingIdx = index.sessions.findIndex((s) => s.id === session.id)
  if (existingIdx === -1) {
    index.sessions.unshift({
      id: session.id,
      date: session.startTime.split('T')[0],
      projectPath: session.projectPath,
    })
    index.totalSessions++
  }

  index.lastUpdated = new Date().toISOString()

  // Keep only last 100 sessions in index
  if (index.sessions.length > 100) {
    index.sessions = index.sessions.slice(0, 100)
  }

  writeFile(INDEX_FILE, JSON.stringify(index, null, 2))
}

/**
 * Load metrics index
 */
export function loadIndex(): MetricsIndex | null {
  if (!fileExists(INDEX_FILE)) {
    return null
  }

  try {
    return JSON.parse(readFile(INDEX_FILE)) as MetricsIndex
  } catch {
    return null
  }
}

/**
 * List all session files
 */
export function listSessionFiles(): string[] {
  if (!directoryExists(SESSIONS_DIR)) {
    return []
  }

  return readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''))
    .sort()
    .reverse()
}

/**
 * Get sessions for date range
 */
export function getSessionsInRange(days: number): SessionMetrics[] {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  cutoffDate.setHours(0, 0, 0, 0)

  const sessions: SessionMetrics[] = []
  const sessionIds = listSessionFiles()

  for (const sessionId of sessionIds) {
    const session = loadSession(sessionId)
    if (session) {
      const sessionDate = new Date(session.startTime)
      if (sessionDate >= cutoffDate) {
        sessions.push(session)
      }
    }
  }

  return sessions
}

// ============================================
// Metrics Calculation Functions
// ============================================

/**
 * Calculate prevention rate
 * Formula: (prevents / (prevents + hits)) * 100
 * If no events, return 100 (perfect)
 */
export function calculatePreventionRate(hits: number, prevents: number): number {
  const total = hits + prevents
  if (total === 0) return 100
  return Math.round((prevents / total) * 100)
}

/**
 * Calculate token efficiency
 * Formula: (utilization / budget) * 100, capped at 100
 */
export function calculateTokenEfficiency(loaded: number, budget: number): number {
  if (budget === 0) return 0
  return Math.min(Math.round((loaded / budget) * 100), 100)
}

/**
 * Aggregate daily metrics from sessions
 */
export function aggregateDailyMetrics(sessions: SessionMetrics[]): DailyMetrics[] {
  const dailyMap = new Map<string, DailyMetrics>()

  for (const session of sessions) {
    const date = session.startTime.split('T')[0]

    if (!dailyMap.has(date)) {
      dailyMap.set(date, {
        date,
        patternHits: 0,
        antiPatternPrevents: 0,
        preventionRate: 0,
        sessions: 0,
        totalTokensUsed: 0,
        topPatterns: [],
      })
    }

    const daily = dailyMap.get(date)!
    daily.patternHits += session.patterns.totalHits
    daily.antiPatternPrevents += session.antiPatterns.totalPrevents
    daily.sessions++
    daily.totalTokensUsed += session.tokens.loaded
  }

  // Calculate prevention rates and sort by date
  const dailyMetrics = Array.from(dailyMap.values())

  for (const daily of dailyMetrics) {
    daily.preventionRate = calculatePreventionRate(daily.patternHits, daily.antiPatternPrevents)
  }

  // Calculate top patterns per day
  for (const daily of dailyMetrics) {
    const patternCounts = new Map<string, number>()
    const dailySessions = sessions.filter((s) => s.startTime.startsWith(daily.date))

    for (const session of dailySessions) {
      for (const hit of session.patterns.hits) {
        patternCounts.set(hit.patternId, (patternCounts.get(hit.patternId) ?? 0) + 1)
      }
    }

    daily.topPatterns = Array.from(patternCounts.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  return dailyMetrics.sort((a, b) => b.date.localeCompare(a.date))
}

/**
 * Get metrics history for N days
 */
export function getMetricsHistory(days: number): MetricsHistory {
  const sessions = getSessionsInRange(days)
  const dailyMetrics = aggregateDailyMetrics(sessions)

  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Calculate totals
  const totals = {
    patternHits: 0,
    antiPatternPrevents: 0,
    sessions: 0,
    averagePreventionRate: 0,
  }

  for (const daily of dailyMetrics) {
    totals.patternHits += daily.patternHits
    totals.antiPatternPrevents += daily.antiPatternPrevents
    totals.sessions += daily.sessions
  }

  totals.averagePreventionRate = calculatePreventionRate(totals.patternHits, totals.antiPatternPrevents)

  // Calculate top patterns across all sessions
  const patternCounts = new Map<string, number>()
  for (const session of sessions) {
    for (const hit of session.patterns.hits) {
      patternCounts.set(hit.patternId, (patternCounts.get(hit.patternId) ?? 0) + 1)
    }
  }

  const topPatterns = Array.from(patternCounts.entries())
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate,
    days: dailyMetrics,
    totals,
    topPatterns,
  }
}

// ============================================
// Demo/Sample Data Functions
// ============================================

/**
 * Create a sample session for demonstration
 */
export function createSampleSession(projectPath: string): SessionMetrics {
  const now = new Date()
  const startTime = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago

  return {
    id: generateSessionId(),
    projectPath,
    startTime: startTime.toISOString(),
    endTime: now.toISOString(),
    duration: Math.round((now.getTime() - startTime.getTime()) / 1000),

    patterns: {
      hits: [
        { patternId: 'TS-001', file: 'src/utils/helpers.ts', timestamp: startTime.toISOString() },
        { patternId: 'VU-003', file: 'src/components/Form.vue', timestamp: startTime.toISOString() },
        { patternId: 'NX-005', file: 'server/api/users.ts', timestamp: now.toISOString() },
      ],
      totalHits: 47,
    },

    antiPatterns: {
      prevents: [
        {
          patternId: 'AP-001',
          file: 'src/utils/api.ts',
          message: 'any type usage blocked',
          timestamp: startTime.toISOString(),
        },
        {
          patternId: 'AP-002',
          file: 'src/components/Debug.vue',
          message: 'console.log in production code',
          timestamp: now.toISOString(),
        },
      ],
      totalPrevents: 5,
    },

    tokens: {
      loaded: 2053,
      budget: 2200,
      utilization: 93,
      byLayer: {
        core: 781,
        domain: 220,
        patterns: 850,
        project: 152,
        session: 50,
      },
    },

    commands: [
      { command: '/implement', timestamp: startTime.toISOString(), duration: 45000 },
      { command: '/verify', timestamp: now.toISOString(), duration: 12000 },
    ],
  }
}

/**
 * Check if there are any existing sessions
 */
export function hasExistingSessions(): boolean {
  return listSessionFiles().length > 0
}

/**
 * Get the most recent session or a sample
 */
export function getMostRecentOrSampleSession(projectPath: string): SessionMetrics {
  const sessionIds = listSessionFiles()

  if (sessionIds.length > 0) {
    const session = loadSession(sessionIds[0])
    if (session) return session
  }

  // Return sample session if no real sessions exist
  return createSampleSession(projectPath)
}

// ============================================
// Formatting Functions
// ============================================

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Format date for display
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

/**
 * Format percentage with color indicator prefix
 */
export function formatPercentageWithStatus(value: number, target: number, alert: number): string {
  if (value >= target) {
    return `[+] ${value}%`
  } else if (value >= alert) {
    return `[!] ${value}%`
  }
  return `[-] ${value}%`
}

/**
 * Create ASCII bar chart
 */
export function createBarChart(value: number, max: number, width: number = 20): string {
  const filled = Math.round((value / max) * width)
  const empty = width - filled
  return '[' + '='.repeat(Math.min(filled, width)) + ' '.repeat(Math.max(empty, 0)) + ']'
}

/**
 * Create horizontal table row
 */
export function createTableRow(cells: string[], widths: number[]): string {
  return (
    '| ' +
    cells.map((cell, i) => cell.padEnd(widths[i])).join(' | ') +
    ' |'
  )
}

/**
 * Create table separator
 */
export function createTableSeparator(widths: number[]): string {
  return '|' + widths.map((w) => '-'.repeat(w + 2)).join('|') + '|'
}

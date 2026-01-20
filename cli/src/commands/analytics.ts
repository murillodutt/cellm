import { Command } from 'commander'
import { resolve } from 'node:path'
import pc from 'picocolors'
import {
  getMostRecentOrSampleSession,
  getMetricsHistory,
  formatDuration,
  formatDate,
  formatPercentageWithStatus,
  createBarChart,
  createTableRow,
  createTableSeparator,
  KPI_TARGETS,
  KPI_ALERTS,
  hasExistingSessions,
  initMetricsStorage,
  type SessionMetrics,
  type MetricsHistory,
} from '../utils/metrics.js'
import { writeFile } from '../utils/fs.js'

// ============================================
// Analytics Command
// ============================================

export const analyticsCommand = new Command('analytics')
  .description('View CELLM usage metrics and analytics')
  .addCommand(createSessionCommand())
  .addCommand(createHistoryCommand())
  .addCommand(createReportCommand())

// ============================================
// Session Subcommand
// ============================================

function createSessionCommand(): Command {
  return new Command('session')
    .description('View current session metrics')
    .option('-d, --dir <path>', 'Project directory', '.')
    .action(async (options: { dir: string }) => {
      const startTime = performance.now()
      const projectPath = resolve(options.dir)

      console.log(pc.bold('\nCELLM Session Metrics'))
      console.log(pc.dim('─'.repeat(60)))

      // Ensure storage exists
      initMetricsStorage()

      // Get session data
      const session = getMostRecentOrSampleSession(projectPath)
      const isDemo = !hasExistingSessions()

      if (isDemo) {
        console.log(pc.yellow('\n[i] No session data found. Showing sample data.\n'))
      }

      // Display session info
      displaySessionMetrics(session)

      const elapsed = Math.round(performance.now() - startTime)
      console.log(pc.dim(`\nTime: ${elapsed}ms`))
    })
}

function displaySessionMetrics(session: SessionMetrics): void {
  // Header with date and duration
  const sessionDate = formatDate(session.startTime)
  const duration = session.duration ? formatDuration(session.duration) : 'ongoing'

  console.log(`\nSession Metrics (${sessionDate}, ${duration})`)
  console.log('')

  // Pattern Hits
  console.log(pc.bold('Pattern Hits:'), session.patterns.totalHits)

  // Show top 5 pattern hits
  const hitCounts = new Map<string, number>()
  for (const hit of session.patterns.hits) {
    hitCounts.set(hit.patternId, (hitCounts.get(hit.patternId) ?? 0) + 1)
  }

  const topHits = Array.from(hitCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  for (const [patternId, count] of topHits) {
    console.log(`  ${pc.green(patternId)}: ${count} hits`)
  }

  console.log('')

  // Anti-Pattern Prevents
  console.log(pc.bold('Anti-Pattern Prevents:'), session.antiPatterns.totalPrevents)

  // Show recent prevents
  const preventCounts = new Map<string, { count: number; message: string }>()
  for (const prevent of session.antiPatterns.prevents) {
    const existing = preventCounts.get(prevent.patternId)
    if (existing) {
      existing.count++
    } else {
      preventCounts.set(prevent.patternId, { count: 1, message: prevent.message })
    }
  }

  for (const [, { count, message }] of preventCounts) {
    console.log(`  ${pc.red('[-]')} ${message} (${count}x)`)
  }

  console.log('')

  // Token Usage
  console.log(pc.bold('Token Usage:'), `${session.tokens.loaded}/${session.tokens.budget} (${session.tokens.utilization}%)`)

  if (session.tokens.byLayer) {
    const layers = session.tokens.byLayer
    const total = session.tokens.budget

    console.log(`  Core:     ${layers.core.toString().padStart(4)} (${Math.round((layers.core / total) * 100)}%)`)
    console.log(`  Domain:   ${layers.domain.toString().padStart(4)} (${Math.round((layers.domain / total) * 100)}%)`)
    console.log(`  Patterns: ${layers.patterns.toString().padStart(4)} (${Math.round((layers.patterns / total) * 100)}%)`)
    console.log(`  Project:  ${layers.project.toString().padStart(4)} (${Math.round((layers.project / total) * 100)}%)`)
    console.log(`  Session:  ${layers.session.toString().padStart(4)} (${Math.round((layers.session / total) * 100)}%)`)
  }

  console.log('')

  // Prevention Rate
  const preventionRate = calculatePreventionRateFromSession(session)
  const rateStatus = formatPercentageWithStatus(preventionRate, KPI_TARGETS.PREVENTION_RATE, KPI_ALERTS.PREVENTION_RATE)

  console.log(pc.bold('Prevention Rate:'), rateStatus)
}

function calculatePreventionRateFromSession(session: SessionMetrics): number {
  const total = session.patterns.totalHits + session.antiPatterns.totalPrevents
  if (total === 0) return 100
  return Math.round((session.antiPatterns.totalPrevents / total) * 100)
}

// ============================================
// History Subcommand
// ============================================

function createHistoryCommand(): Command {
  return new Command('history')
    .description('View metrics history')
    .option('-d, --dir <path>', 'Project directory', '.')
    .option('--days <n>', 'Number of days to show', '7')
    .action(async (options: { dir: string; days: string }) => {
      const startTime = performance.now()
      const days = parseInt(options.days, 10)

      console.log(pc.bold(`\nCELLM Analytics History (Last ${days} Days)`))
      console.log(pc.dim('─'.repeat(60)))

      // Ensure storage exists
      initMetricsStorage()

      // Get history data
      const history = getMetricsHistory(days)
      const hasSessions = history.totals.sessions > 0

      if (!hasSessions) {
        console.log(pc.yellow('\n[i] No session data found. Showing sample data.\n'))
        displaySampleHistory(days)
      } else {
        displayMetricsHistory(history)
      }

      const elapsed = Math.round(performance.now() - startTime)
      console.log(pc.dim(`\nTime: ${elapsed}ms`))
    })
}

function displayMetricsHistory(history: MetricsHistory): void {
  console.log('')

  // Table header
  const widths = [10, 8, 8, 5]
  console.log(createTableRow(['Date', 'Patterns', 'Prevents', 'Rate'], widths))
  console.log(createTableSeparator(widths))

  // Table rows
  for (const day of history.days) {
    console.log(
      createTableRow(
        [day.date, day.patternHits.toString(), day.antiPatternPrevents.toString(), `${day.preventionRate}%`],
        widths
      )
    )
  }

  console.log('')

  // Summary
  const avgRate = history.totals.averagePreventionRate
  const rateStatus = formatPercentageWithStatus(avgRate, KPI_TARGETS.PREVENTION_RATE, KPI_ALERTS.PREVENTION_RATE)

  console.log(pc.bold('Average Prevention Rate:'), rateStatus)
  console.log('')

  // Top Patterns
  if (history.topPatterns.length > 0) {
    console.log(pc.bold('Top Patterns:'))
    history.topPatterns.slice(0, 5).forEach((pattern, index) => {
      console.log(`${index + 1}. ${pc.green(pattern.id)}: ${pattern.count} hits`)
    })
  }
}

function displaySampleHistory(days: number): void {
  // Generate sample data for demonstration
  const sampleDays = []
  for (let i = 0; i < Math.min(days, 7); i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    sampleDays.push({
      date: date.toISOString().split('T')[0],
      patternHits: Math.floor(Math.random() * 30) + 20,
      antiPatternPrevents: Math.floor(Math.random() * 8) + 2,
      preventionRate: Math.floor(Math.random() * 20) + 75,
    })
  }

  console.log('')

  // Table header
  const widths = [10, 8, 8, 5]
  console.log(createTableRow(['Date', 'Patterns', 'Prevents', 'Rate'], widths))
  console.log(createTableSeparator(widths))

  // Table rows
  for (const day of sampleDays) {
    console.log(
      createTableRow(
        [day.date, day.patternHits.toString(), day.antiPatternPrevents.toString(), `${day.preventionRate}%`],
        widths
      )
    )
  }

  console.log('')

  // Summary
  const avgRate = Math.round(sampleDays.reduce((sum, d) => sum + d.preventionRate, 0) / sampleDays.length)
  const rateStatus = formatPercentageWithStatus(avgRate, KPI_TARGETS.PREVENTION_RATE, KPI_ALERTS.PREVENTION_RATE)

  console.log(pc.bold('Average Prevention Rate:'), rateStatus)
  console.log('')

  // Top Patterns
  console.log(pc.bold('Top Patterns:'))
  console.log(`1. ${pc.green('TS-001')} (type guards): 89 hits`)
  console.log(`2. ${pc.green('VU-003')} (composables): 67 hits`)
  console.log(`3. ${pc.green('NX-005')} (server routes): 52 hits`)
}

// ============================================
// Report Subcommand
// ============================================

function createReportCommand(): Command {
  return new Command('report')
    .description('Generate analytics report')
    .option('-d, --dir <path>', 'Project directory', '.')
    .option('--days <n>', 'Number of days to include', '7')
    .option('-o, --output <file>', 'Output file path (Markdown)')
    .action(async (options: { dir: string; days: string; output?: string }) => {
      const startTime = performance.now()
      const days = parseInt(options.days, 10)

      console.log(pc.bold(`\nCELLM Analytics Report Generator`))
      console.log(pc.dim('─'.repeat(60)))

      // Ensure storage exists
      initMetricsStorage()

      // Get history data
      const history = getMetricsHistory(days)
      const hasSessions = history.totals.sessions > 0

      // Generate report content
      const report = generateMarkdownReport(history, days, hasSessions)

      if (options.output) {
        // Write to file
        const outputPath = resolve(options.output)
        writeFile(outputPath, report)
        console.log(pc.green(`\n[+] Report saved to: ${outputPath}`))
      } else {
        // Output to console
        console.log('\n' + report)
      }

      const elapsed = Math.round(performance.now() - startTime)
      console.log(pc.dim(`\nTime: ${elapsed}ms`))
    })
}

function generateMarkdownReport(history: MetricsHistory, days: number, hasRealData: boolean): string {
  const lines: string[] = []

  // Header
  lines.push(`# CELLM Analytics Report`)
  lines.push('')
  lines.push(`**Generated:** ${new Date().toISOString().split('T')[0]}`)
  lines.push(`**Period:** Last ${days} days (${history.startDate} to ${history.endDate})`)

  if (!hasRealData) {
    lines.push('')
    lines.push('> [i] This report contains sample data. Start using CELLM to generate real metrics.')
  }

  lines.push('')
  lines.push('---')
  lines.push('')

  // Summary Section
  lines.push('## Summary')
  lines.push('')
  lines.push('| Metric | Value | Status |')
  lines.push('|--------|-------|--------|')

  const preventionRate = hasRealData ? history.totals.averagePreventionRate : 85
  const preventionStatus = preventionRate >= KPI_TARGETS.PREVENTION_RATE ? '[+] On Target' : preventionRate >= KPI_ALERTS.PREVENTION_RATE ? '[!] Warning' : '[-] Alert'

  lines.push(`| Sessions | ${hasRealData ? history.totals.sessions : 12} | - |`)
  lines.push(`| Pattern Hits | ${hasRealData ? history.totals.patternHits : 286} | - |`)
  lines.push(`| Anti-Pattern Prevents | ${hasRealData ? history.totals.antiPatternPrevents : 42} | - |`)
  lines.push(`| Prevention Rate | ${preventionRate}% | ${preventionStatus} |`)

  lines.push('')

  // Daily Breakdown
  lines.push('## Daily Breakdown')
  lines.push('')
  lines.push('| Date | Patterns | Prevents | Rate |')
  lines.push('|------|----------|----------|------|')

  if (hasRealData && history.days.length > 0) {
    for (const day of history.days) {
      lines.push(`| ${day.date} | ${day.patternHits} | ${day.antiPatternPrevents} | ${day.preventionRate}% |`)
    }
  } else {
    // Sample data
    for (let i = 0; i < Math.min(days, 7); i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const hits = Math.floor(Math.random() * 30) + 20
      const prevents = Math.floor(Math.random() * 8) + 2
      const rate = Math.floor(Math.random() * 20) + 75
      lines.push(`| ${dateStr} | ${hits} | ${prevents} | ${rate}% |`)
    }
  }

  lines.push('')

  // Prevention Rate Chart (ASCII)
  lines.push('## Prevention Rate Trend')
  lines.push('')
  lines.push('```')
  lines.push('Prevention Rate Over Time')
  lines.push('')

  const chartData = hasRealData && history.days.length > 0
    ? history.days.slice(0, 7).reverse()
    : generateSampleChartData(Math.min(days, 7))

  for (const day of chartData) {
    const rate = 'preventionRate' in day ? day.preventionRate : day.rate
    const bar = createBarChart(rate, 100, 30)
    const shortDate = day.date.slice(5) // MM-DD
    lines.push(`${shortDate} ${bar} ${rate}%`)
  }

  lines.push('```')
  lines.push('')

  // Top Patterns
  lines.push('## Top Patterns')
  lines.push('')
  lines.push('| Rank | Pattern ID | Hits |')
  lines.push('|------|------------|------|')

  if (hasRealData && history.topPatterns.length > 0) {
    history.topPatterns.slice(0, 5).forEach((pattern, index) => {
      lines.push(`| ${index + 1} | ${pattern.id} | ${pattern.count} |`)
    })
  } else {
    lines.push('| 1 | TS-001 | 89 |')
    lines.push('| 2 | VU-003 | 67 |')
    lines.push('| 3 | NX-005 | 52 |')
    lines.push('| 4 | TS-007 | 41 |')
    lines.push('| 5 | VU-012 | 37 |')
  }

  lines.push('')

  // KPI Reference
  lines.push('## KPI Reference')
  lines.push('')
  lines.push('| KPI | Target | Alert |')
  lines.push('|-----|--------|-------|')
  lines.push(`| Prevention Rate | > ${KPI_TARGETS.PREVENTION_RATE}% | < ${KPI_ALERTS.PREVENTION_RATE}% |`)
  lines.push(`| Pattern Coverage | > ${KPI_TARGETS.PATTERN_COVERAGE}% | < ${KPI_ALERTS.PATTERN_COVERAGE}% |`)
  lines.push(`| Token Efficiency | > ${KPI_TARGETS.TOKEN_EFFICIENCY}% | < ${KPI_ALERTS.TOKEN_EFFICIENCY}% |`)

  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('*Report generated by CELLM CLI v0.13.0*')

  return lines.join('\n')
}

function generateSampleChartData(days: number): Array<{ date: string; rate: number }> {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      rate: Math.floor(Math.random() * 20) + 75,
    })
  }
  return data
}

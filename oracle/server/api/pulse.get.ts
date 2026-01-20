// CELLM Oracle - Pulse API Endpoint
// Returns project health timeline data

import type { PulseData, HealthRecord, ValidationRecord } from '~/types'

export default defineEventHandler(async (_event): Promise<PulseData> => {
  // Generate mock health history
  const now = new Date()
  const history: HealthRecord[] = []

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const baseScore = 85
    const variation = Math.floor(Math.random() * 10)

    history.push({
      timestamp: date.toISOString(),
      score: baseScore + variation,
      valid: Math.random() > 0.2,
      errors: Math.floor(Math.random() * 3),
      warnings: Math.floor(Math.random() * 5),
    })
  }

  // Generate mock recent validations
  const validations: ValidationRecord[] = []
  for (let i = 0; i < 5; i++) {
    const timestamp = new Date(now.getTime() - i * 3600000)
    validations.push({
      id: String(i + 1),
      timestamp: timestamp.toISOString(),
      result: Math.random() > 0.2 ? 'pass' : 'fail',
      duration: Math.floor(Math.random() * 200) + 150,
      issues: Math.floor(Math.random() * 4),
    })
  }

  // Calculate current score from latest history
  const currentScore = history[history.length - 1]?.score || 90

  // Count active issues
  const activeIssues = validations
    .filter(v => v.result === 'fail')
    .reduce((sum, v) => sum + v.issues, 0)

  return {
    currentScore,
    history,
    recentValidations: validations,
    activeIssues,
  }
})

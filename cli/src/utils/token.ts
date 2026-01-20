import { readFile } from './fs.js'

/**
 * Approximate token count for text
 * Uses the rule of thumb: ~4 characters per token for English text
 * This is a rough estimate, actual tokenization varies by model
 */
export function estimateTokens(text: string): number {
  // Remove excessive whitespace
  const normalized = text.replace(/\s+/g, ' ').trim()

  // Approximate: 4 characters per token (conservative estimate)
  return Math.ceil(normalized.length / 4)
}

/**
 * Estimate tokens in a file
 */
export function estimateFileTokens(filePath: string): number {
  try {
    const content = readFile(filePath)
    return estimateTokens(content)
  } catch {
    return 0
  }
}

/**
 * Parse budget string from frontmatter
 * Handles formats like: "~500 tokens", "500", "~500"
 */
export function parseBudget(budget: string | number | undefined): number {
  if (budget === undefined) return 0
  if (typeof budget === 'number') return budget

  const match = budget.match(/~?(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

/**
 * Format token count for display
 */
export function formatTokens(tokens: number): string {
  if (tokens < 1000) return `${tokens} tokens`
  return `${(tokens / 1000).toFixed(1)}k tokens`
}

/**
 * Budget thresholds
 */
export const BUDGET_LIMITS = {
  CORE: 2200,
  FILE_MAX: 500,
  WARNING_THRESHOLD: 0.9, // 90%
  CRITICAL_THRESHOLD: 0.95, // 95%
} as const

/**
 * Check if budget is within limits
 */
export interface BudgetStatus {
  used: number
  total: number
  percentage: number
  status: 'ok' | 'warning' | 'critical' | 'exceeded'
}

export function checkBudget(used: number, total: number = BUDGET_LIMITS.CORE): BudgetStatus {
  const percentage = used / total

  let status: BudgetStatus['status']
  if (percentage > 1) {
    status = 'exceeded'
  } else if (percentage >= BUDGET_LIMITS.CRITICAL_THRESHOLD) {
    status = 'critical'
  } else if (percentage >= BUDGET_LIMITS.WARNING_THRESHOLD) {
    status = 'warning'
  } else {
    status = 'ok'
  }

  return {
    used,
    total,
    percentage,
    status,
  }
}

/**
 * Format budget status for display
 */
export function formatBudgetStatus(status: BudgetStatus): string {
  const percentage = Math.round(status.percentage * 100)
  const bar = createProgressBar(status.percentage, 30)

  return `${status.used}/${status.total} tokens (${percentage}%) ${bar}`
}

/**
 * Create ASCII progress bar
 */
export function createProgressBar(percentage: number, width: number = 30): string {
  const filled = Math.min(Math.round(percentage * width), width)
  const empty = width - filled

  return '[' + '='.repeat(filled) + ' '.repeat(empty) + ']'
}

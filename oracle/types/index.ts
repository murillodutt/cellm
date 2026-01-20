// CELLM Oracle - Type Definitions

export interface ProjectStatus {
  valid: boolean
  version: string
  profile: string
  budget: BudgetInfo
  lastValidation: string
  errors: string[]
  warnings: string[]
}

export interface BudgetInfo {
  used: number
  total: number
  percentage: number
}

export interface BudgetLayer {
  name: string
  tokens: number
  percentage: number
  color: string
}

export interface BudgetData {
  layers: BudgetLayer[]
  total: number
  limit: number
  percentage: number
}

export interface PatternUsage {
  id: string
  name: string
  category: string
  hits: number
  lastUsed: string
}

export interface PatternAnalytics {
  patterns: PatternUsage[]
  totalPatterns: number
  totalHits: number
  preventionRate: number
  coverageByType: Record<string, number>
}

export interface HealthRecord {
  timestamp: string
  score: number
  valid: boolean
  errors: number
  warnings: number
}

export interface ValidationRecord {
  id: string
  timestamp: string
  result: 'pass' | 'fail'
  duration: number
  issues: number
}

export interface PulseData {
  currentScore: number
  history: HealthRecord[]
  recentValidations: ValidationRecord[]
  activeIssues: number
}

export interface Action {
  id: string
  title: string
  description: string
  category: 'optimization' | 'fix' | 'improvement' | 'maintenance'
  priority: 'high' | 'medium' | 'low'
  impact: string
  command?: string
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
}

export interface ActionsData {
  actions: Action[]
  totalPending: number
  totalCompleted: number
}

// MCP Tool Types
export interface PatternCheckResult {
  matches: boolean
  patternId: string
  patternName: string
  violations: PatternViolation[]
  suggestions: string[]
}

export interface PatternViolation {
  line?: number
  message: string
  severity: 'error' | 'warning' | 'info'
}

export interface ReuseSuggestion {
  type: 'pattern' | 'component' | 'composable' | 'utility'
  name: string
  path: string
  description: string
  similarity: number
  usage: string
}

export interface SuggestReuseResult {
  suggestions: ReuseSuggestion[]
  totalFound: number
  query: string
}

export interface ValidationResult {
  valid: boolean
  score: number
  checks: ValidationCheck[]
  summary: ValidationSummary
}

export interface ValidationCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string[]
}

export interface ValidationSummary {
  totalChecks: number
  passed: number
  failed: number
  warnings: number
  budgetUsed: number
  budgetTotal: number
}

// CELLM Oracle - Design System Types

// Worker roles in the factory metaphor
export type WorkerRole = 'architect' | 'manager' | 'implementer' | 'reviewer'

// Task status for task boards
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

// Conveyor belt stages
export type ConveyorStage = 'vision' | 'tasks' | 'code' | 'review' | 'production'

// Navigation item with optional stage
export interface NavigationItem {
  name: string
  to: string
  icon: string
  stage?: ConveyorStage
  active?: boolean
}

// Task board item
export interface TaskBoardItem {
  id: string
  label: string
  status: TaskStatus
  description?: string
}

// Gauge metric data
export interface GaugeMetricData {
  label: string
  value: number
  max: number
  unit?: string
  status?: 'success' | 'warning' | 'error' | 'neutral'
}

// Conveyor progress data
export interface ConveyorProgressData {
  stages: Array<{
    id: ConveyorStage
    label: string
    status: 'completed' | 'current' | 'pending'
  }>
}

// Worker badge props
export interface WorkerBadgeProps {
  role: WorkerRole
  label?: string
}

// Blueprint card props
export interface BlueprintCardProps {
  title?: string
  icon?: string
  variant?: 'dashed' | 'solid'
}

// Status indicator
export type StatusIndicator = 'online' | 'offline' | 'warning' | 'unknown'

// Color tokens for programmatic use
export const CELLM_COLORS = {
  orange: {
    DEFAULT: '#d4734a',
    light: '#e89575',
    dark: '#b85d3a',
  },
  green: {
    DEFAULT: '#2a9d5c',
    light: '#3eb575',
    dark: '#1e7a46',
  },
  charcoal: '#1a1a1a',
  slate: '#4a5568',
  error: '#c45c3e',
  warning: '#d4734a',
  info: '#5a7fa8',
  success: '#2a9d5c',
} as const

// Worker role labels
export const WORKER_LABELS: Record<WorkerRole, string> = {
  architect: 'Architect',
  manager: 'Manager',
  implementer: 'Implementer',
  reviewer: 'Reviewer',
}

// Conveyor stage labels
export const STAGE_LABELS: Record<ConveyorStage, string> = {
  vision: 'Vision',
  tasks: 'Tasks',
  code: 'Code',
  review: 'Review',
  production: 'Production',
}

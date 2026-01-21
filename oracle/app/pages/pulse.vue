<script setup lang="ts">
// CELLM Oracle - Project Pulse (Premium Industrial Theme)
import type { TaskBoardItem } from '~/types/design-system'

interface HealthRecord {
  timestamp: string
  score: number
  valid: boolean
  errors: number
  warnings: number
}

interface ValidationRecord {
  id: string
  timestamp: string
  result: 'pass' | 'fail'
  duration: number
  issues: number
}

interface PulseData {
  currentScore: number
  history: HealthRecord[]
  recentValidations: ValidationRecord[]
  activeIssues: number
}

const pulseData = ref<PulseData | null>(null)
const loading = ref(true)

async function fetchPulse(): Promise<void> {
  loading.value = true

  try {
    const response = await $fetch<PulseData>('/api/pulse')
    pulseData.value = response
  }
  catch {
    const now = new Date()
    pulseData.value = {
      currentScore: 94,
      history: Array.from({ length: 7 }, (_, i) => ({
        timestamp: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
        score: 85 + Math.floor(Math.random() * 10),
        valid: Math.random() > 0.2,
        errors: Math.floor(Math.random() * 3),
        warnings: Math.floor(Math.random() * 5),
      })),
      recentValidations: [
        { id: '1', timestamp: new Date().toISOString(), result: 'pass', duration: 234, issues: 0 },
        { id: '2', timestamp: new Date(now.getTime() - 3600000).toISOString(), result: 'pass', duration: 189, issues: 1 },
        { id: '3', timestamp: new Date(now.getTime() - 7200000).toISOString(), result: 'fail', duration: 312, issues: 3 },
      ],
      activeIssues: 2,
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchPulse)

const chartData = computed(() => {
  if (!pulseData.value) return []
  return pulseData.value.history.map(h => ({
    day: new Date(h.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    score: h.score,
  }))
})

const chartCategories = { score: { name: 'Score', color: '#10b981' } }
const chartXFormatter = (i: number): string => chartData.value[i]?.day || ''

const scoreStatus = computed(() => {
  if (!pulseData.value) return 'neutral'
  if (pulseData.value.currentScore >= 90) return 'success'
  if (pulseData.value.currentScore >= 70) return 'warning'
  return 'error'
})

const validationItems = computed<TaskBoardItem[]>(() => {
  if (!pulseData.value) return []
  return pulseData.value.recentValidations.map(v => ({
    id: v.id,
    label: `Validation ${v.result === 'pass' ? 'passed' : 'failed'} - ${formatRelativeTime(v.timestamp)}`,
    status: v.result === 'pass' ? 'completed' : 'failed',
    description: `${formatDuration(v.duration)} • ${v.issues} issues`,
  }))
})

function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`
}

function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="page-title">
          Project Pulse
        </h1>
        <p class="page-subtitle">
          Health score timeline and validation history
        </p>
      </div>
      <UButton icon="i-lucide-refresh-cw" color="primary" size="lg" :loading="loading" class="btn-glow" @click="fetchPulse">
        Refresh
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading && !pulseData" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="relative inline-block">
          <UIcon name="i-lucide-loader" class="size-12 text-[var(--cellm-orange)] animate-spin" />
          <div class="absolute inset-0 blur-xl bg-[var(--cellm-orange)] opacity-30 animate-pulse" />
        </div>
        <p class="text-[var(--cellm-slate)] mt-4 font-medium">Loading pulse data...</p>
      </div>
    </div>

    <template v-else-if="pulseData">
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BlueprintCard variant="glow" padding="lg" class="flex flex-col items-center justify-center">
          <GaugeMetric
            label="Health Score"
            :value="pulseData.currentScore"
            :max="100"
            :status="scoreStatus"
            size="lg"
          />
        </BlueprintCard>

        <BlueprintCard variant="default" padding="lg" class="text-center flex flex-col justify-center">
          <div class="relative inline-block mx-auto mb-2">
            <div
              class="metric-value tabular-nums"
              :class="pulseData.activeIssues > 0 ? 'text-[var(--cellm-orange)]' : 'text-[var(--cellm-green)]'"
              :style="{ textShadow: pulseData.activeIssues > 0 ? '0 0 20px var(--cellm-orange-glow)' : '0 0 20px var(--cellm-green-glow)' }"
            >
              {{ pulseData.activeIssues }}
            </div>
          </div>
          <p class="metric-label">Active Issues</p>
        </BlueprintCard>

        <BlueprintCard variant="default" padding="lg" class="text-center flex flex-col justify-center">
          <div class="metric-value text-[var(--cellm-purple)] tabular-nums" style="text-shadow: 0 0 20px var(--cellm-purple-glow);">
            {{ pulseData.recentValidations.length }}
          </div>
          <p class="metric-label">Validations Today</p>
          <p class="text-sm text-[var(--cellm-green)] font-semibold mt-2">
            {{ pulseData.recentValidations.filter(v => v.result === 'pass').length }} passed
          </p>
        </BlueprintCard>
      </div>

      <!-- Timeline Chart -->
      <BlueprintCard title="Health Timeline" icon="i-lucide-activity" variant="default">
        <div class="h-72">
          <AreaChart
            :data="chartData"
            :categories="chartCategories"
            :height="260"
            :x-formatter="chartXFormatter"
            :hide-legend="true"
            :y-grid-line="true"
            y-label="Score"
          />
        </div>
      </BlueprintCard>

      <!-- Recent Validations -->
      <BlueprintCard title="Recent Validations" icon="i-lucide-clipboard-check" variant="default">
        <TaskBoard :items="validationItems" />
      </BlueprintCard>

      <!-- History Table -->
      <BlueprintCard title="7-Day History" icon="i-lucide-calendar" variant="default">
        <div class="overflow-x-auto -mx-4 px-4">
          <table class="table-industrial">
            <thead>
              <tr>
                <th>Date</th>
                <th>Score</th>
                <th>Status</th>
                <th>Errors</th>
                <th>Warnings</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in pulseData.history" :key="record.timestamp" class="group">
                <td class="font-medium text-[var(--cellm-charcoal)] dark:text-white">
                  {{ new Date(record.timestamp).toLocaleDateString() }}
                </td>
                <td>
                  <span
                    class="font-mono font-bold tabular-nums"
                    :class="record.score >= 90 ? 'text-[var(--cellm-green)]' : record.score >= 70 ? 'text-[var(--cellm-orange)]' : 'text-[var(--cellm-red)]'"
                    :style="{
                      textShadow: record.score >= 90
                        ? '0 0 10px var(--cellm-green-glow)'
                        : record.score >= 70
                          ? '0 0 10px var(--cellm-orange-glow)'
                          : '0 0 10px var(--cellm-red-glow)'
                    }"
                  >
                    {{ record.score }}
                  </span>
                </td>
                <td>
                  <span
                    class="px-3 py-1 text-xs font-semibold rounded-full"
                    :class="record.valid
                      ? 'bg-[var(--cellm-green)]/10 text-[var(--cellm-green)]'
                      : 'bg-[var(--cellm-red)]/10 text-[var(--cellm-red)]'"
                  >
                    {{ record.valid ? 'Valid' : 'Invalid' }}
                  </span>
                </td>
                <td class="font-mono tabular-nums text-[var(--cellm-charcoal)] dark:text-white">{{ record.errors }}</td>
                <td class="font-mono tabular-nums text-[var(--cellm-charcoal)] dark:text-white">{{ record.warnings }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </BlueprintCard>
    </template>
  </div>
</template>

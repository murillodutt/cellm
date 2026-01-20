<script setup lang="ts">
// CELLM Oracle - Project Pulse Page
// Using NuxtCharts Premium for visualizations

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

// Fetch pulse data
async function fetchPulse(): Promise<void> {
  loading.value = true

  try {
    const response = await $fetch<PulseData>('/api/pulse')
    pulseData.value = response
  }
  catch {
    // Use mock data for demo
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
        { id: '4', timestamp: new Date(now.getTime() - 10800000).toISOString(), result: 'pass', duration: 201, issues: 0 },
        { id: '5', timestamp: new Date(now.getTime() - 14400000).toISOString(), result: 'pass', duration: 178, issues: 2 },
      ],
      activeIssues: 2,
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchPulse)

// AreaChart data - transform history into chart format
const chartData = computed(() => {
  if (!pulseData.value)
    return []
  return pulseData.value.history.map(h => ({
    day: new Date(h.timestamp).toLocaleDateString('en-US', { weekday: 'short' }),
    score: h.score,
  }))
})

// AreaChart categories
const chartCategories = {
  score: { name: 'Health Score', color: '#16a34a' },
}

// X-axis formatter
const chartXFormatter = (i: number): string => {
  return chartData.value[i]?.day || ''
}

// Score color
const scoreColor = computed(() => {
  if (!pulseData.value)
    return 'text-gray-600'
  if (pulseData.value.currentScore >= 90)
    return 'text-green-600'
  if (pulseData.value.currentScore >= 70)
    return 'text-yellow-600'
  return 'text-red-600'
})

// Format duration
function formatDuration(ms: number): string {
  if (ms < 1000)
    return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

// Format relative time
function formatRelativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)

  if (minutes < 1)
    return 'just now'
  if (minutes < 60)
    return `${minutes}m ago`
  if (hours < 24)
    return `${hours}h ago`
  return new Date(timestamp).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Project Pulse
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Health score timeline and validation history
        </p>
      </div>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        @click="fetchPulse"
      >
        Refresh
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-center">
        <div class="text-4xl mb-4">
          [~]
        </div>
        <p class="text-gray-500">
          Loading pulse data...
        </p>
      </div>
    </div>

    <!-- Pulse Content -->
    <template v-else-if="pulseData">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Health Score -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Health Score
            </h3>
            <span :class="scoreColor">
              {{ pulseData.currentScore >= 90 ? '[+]' : pulseData.currentScore >= 70 ? '[!]' : '[-]' }}
            </span>
          </div>
          <div
            class="text-5xl font-bold"
            :class="scoreColor"
          >
            {{ pulseData.currentScore }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            out of 100
          </p>
        </div>

        <!-- Active Issues -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Active Issues
            </h3>
            <span :class="pulseData.activeIssues > 0 ? 'text-yellow-600' : 'text-green-600'">
              {{ pulseData.activeIssues > 0 ? '[!]' : '[+]' }}
            </span>
          </div>
          <div class="text-5xl font-bold text-gray-900 dark:text-white">
            {{ pulseData.activeIssues }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            need attention
          </p>
        </div>

        <!-- Recent Validations -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Validations Today
            </h3>
            <span class="text-blue-600">[i]</span>
          </div>
          <div class="text-5xl font-bold text-gray-900 dark:text-white">
            {{ pulseData.recentValidations.length }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {{ pulseData.recentValidations.filter(v => v.result === 'pass').length }} passed
          </p>
        </div>
      </div>

      <!-- Health Score Timeline -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Health Score Timeline
        </h2>
        <div class="h-64">
          <AreaChart
            :data="chartData"
            :categories="chartCategories"
            :height="220"
            :x-formatter="chartXFormatter"
            :hide-legend="true"
            :y-grid-line="true"
            y-label="Score"
          />
        </div>
        <div class="flex justify-center gap-6 mt-4 text-sm">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-green-500" />
            <span class="text-gray-500 dark:text-gray-400">Valid</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-red-500" />
            <span class="text-gray-500 dark:text-gray-400">Issues</span>
          </div>
        </div>
      </div>

      <!-- Recent Validations List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Validations
          </h2>
        </div>
        <ul class="divide-y divide-gray-200 dark:divide-gray-700">
          <li
            v-for="validation in pulseData.recentValidations"
            :key="validation.id"
            class="px-6 py-4 flex items-center justify-between"
          >
            <div class="flex items-center gap-4">
              <span
                :class="validation.result === 'pass' ? 'text-green-600' : 'text-red-600'"
                class="text-xl"
              >
                {{ validation.result === 'pass' ? '[+]' : '[-]' }}
              </span>
              <div>
                <p class="font-medium text-gray-900 dark:text-white">
                  Validation {{ validation.result === 'pass' ? 'Passed' : 'Failed' }}
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  {{ formatRelativeTime(validation.timestamp) }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-6 text-sm">
              <div class="text-gray-500 dark:text-gray-400">
                <span class="font-medium text-gray-900 dark:text-white">
                  {{ formatDuration(validation.duration) }}
                </span>
                duration
              </div>
              <div
                v-if="validation.issues > 0"
                class="text-yellow-600"
              >
                {{ validation.issues }} issues
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!-- Health History Table -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            7-Day History
          </h2>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Score
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Errors
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Warnings
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="record in pulseData.history"
                :key="record.timestamp"
              >
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ new Date(record.timestamp).toLocaleDateString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="font-bold"
                    :class="record.score >= 90 ? 'text-green-600' : record.score >= 70 ? 'text-yellow-600' : 'text-red-600'"
                  >
                    {{ record.score }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="record.valid
                      ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                      : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'"
                    class="px-2 py-1 text-xs rounded-full"
                  >
                    {{ record.valid ? 'Valid' : 'Invalid' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ record.errors }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ record.warnings }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

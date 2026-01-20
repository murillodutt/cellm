<script setup lang="ts">
// CELLM Oracle - Pattern Analytics Page
// Using NuxtCharts Premium for visualizations

// Chart legend position - cast to any for nuxt-charts compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legendRight = 'right' as any

interface PatternUsage {
  id: string
  name: string
  category: string
  hits: number
  lastUsed: string
}

interface PatternAnalytics {
  patterns: PatternUsage[]
  totalPatterns: number
  totalHits: number
  preventionRate: number
  coverageByType: Record<string, number>
}

const analytics = ref<PatternAnalytics | null>(null)
const loading = ref(true)
const selectedCategory = ref('all')

// Fetch pattern analytics
async function fetchAnalytics(): Promise<void> {
  loading.value = true

  try {
    const response = await $fetch<PatternAnalytics>('/api/patterns')
    analytics.value = response
  }
  catch {
    // Use mock data for demo
    analytics.value = {
      patterns: [
        { id: 'TS-001', name: 'Explicit Return Types', category: 'typescript', hits: 156, lastUsed: new Date().toISOString() },
        { id: 'TS-002', name: 'Avoid any Type', category: 'typescript', hits: 142, lastUsed: new Date().toISOString() },
        { id: 'VU-001', name: 'Script Setup', category: 'vue', hits: 98, lastUsed: new Date().toISOString() },
        { id: 'VU-002', name: 'Typed Refs', category: 'vue', hits: 87, lastUsed: new Date().toISOString() },
        { id: 'NX-001', name: 'Use $fetch', category: 'nuxt', hits: 76, lastUsed: new Date().toISOString() },
        { id: 'NX-002', name: 'Auto Imports', category: 'nuxt', hits: 65, lastUsed: new Date().toISOString() },
        { id: 'PN-001', name: 'Pinia Stores', category: 'pinia', hits: 45, lastUsed: new Date().toISOString() },
        { id: 'UI-001', name: 'Nuxt UI Components', category: 'ui', hits: 34, lastUsed: new Date().toISOString() },
      ],
      totalPatterns: 52,
      totalHits: 703,
      preventionRate: 87,
      coverageByType: {
        typescript: 35,
        vue: 28,
        nuxt: 20,
        pinia: 10,
        other: 7,
      },
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchAnalytics)

// Categories
const categories = computed(() => {
  if (!analytics.value)
    return []
  const cats = new Set(analytics.value.patterns.map(p => p.category))
  return ['all', ...Array.from(cats)]
})

// Filtered patterns
const filteredPatterns = computed(() => {
  if (!analytics.value)
    return []
  if (selectedCategory.value === 'all')
    return analytics.value.patterns
  return analytics.value.patterns.filter(p => p.category === selectedCategory.value)
})

// BarChart - Most Used Patterns
const barData = computed(() => {
  return filteredPatterns.value.slice(0, 8).map(p => ({
    id: p.id,
    hits: p.hits,
  }))
})

const barCategories = {
  hits: { name: 'Pattern Hits', color: '#16a34a' },
}

const barXFormatter = (i: number): string => {
  return barData.value[i]?.id || ''
}

// DonutChart - Coverage by Type (instead of Pie)
const donutData = computed(() => {
  if (!analytics.value)
    return []
  return Object.values(analytics.value.coverageByType)
})

const donutCategories = computed(() => {
  if (!analytics.value)
    return {}
  const colors = ['#16a34a', '#2563eb', '#9333ea', '#f59e0b', '#6b7280'] as const
  const keys = Object.keys(analytics.value.coverageByType)
  return keys.reduce((acc, key, index) => {
    acc[key] = { name: key, color: colors[index % colors.length] ?? '#6b7280' }
    return acc
  }, {} as Record<string, { name: string, color: string }>)
})

// AreaChart - Prevention Rate Trend (Line chart with fill)
const areaData = computed(() => {
  const currentRate = analytics.value?.preventionRate || 87
  return [
    { week: 'Week 1', rate: 72 },
    { week: 'Week 2', rate: 78 },
    { week: 'Week 3', rate: 83 },
    { week: 'Week 4', rate: currentRate },
  ]
})

const areaCategories = {
  rate: { name: 'Prevention Rate %', color: '#16a34a' },
}

const areaXFormatter = (i: number): string => {
  return areaData.value[i]?.week || ''
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Pattern Analytics
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Track pattern usage and anti-pattern prevention
        </p>
      </div>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        @click="fetchAnalytics"
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
          Loading analytics...
        </p>
      </div>
    </div>

    <!-- Analytics Content -->
    <template v-else-if="analytics">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Patterns
            </h3>
            <span class="text-blue-600">[i]</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ analytics.totalPatterns }}
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total Hits
            </h3>
            <span class="text-green-600">[+]</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ analytics.totalHits }}
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Prevention Rate
            </h3>
            <span class="text-green-600">[+]</span>
          </div>
          <div class="text-3xl font-bold text-green-600">
            {{ analytics.preventionRate }}%
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Categories
            </h3>
            <span class="text-purple-600">[~]</span>
          </div>
          <div class="text-3xl font-bold text-gray-900 dark:text-white">
            {{ Object.keys(analytics.coverageByType).length }}
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Most Used Patterns Bar Chart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Most Used Patterns
          </h3>
          <div class="h-64">
            <BarChart
              :data="barData"
              :categories="barCategories"
              :height="220"
              :y-axis="['hits']"
              :x-formatter="barXFormatter"
              :hide-legend="true"
              :y-grid-line="true"
              :radius="4"
            />
          </div>
        </div>

        <!-- Coverage by Type DonutChart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Coverage by Type
          </h3>
          <div class="h-64 flex items-center justify-center">
            <DonutChart
              :data="donutData"
              :categories="donutCategories"
              :height="220"
              :radius="70"
              :arc-width="20"
              :legend-position="legendRight"
            />
          </div>
        </div>

        <!-- Prevention Rate Trend AreaChart -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Prevention Rate Trend
          </h3>
          <div class="h-64">
            <AreaChart
              :data="areaData"
              :categories="areaCategories"
              :height="220"
              :x-formatter="areaXFormatter"
              :hide-legend="true"
              :y-grid-line="true"
              y-label="%"
            />
          </div>
        </div>
      </div>

      <!-- Pattern List -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            Pattern Usage
          </h2>
          <select
            v-model="selectedCategory"
            class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-sm"
          >
            <option
              v-for="cat in categories"
              :key="cat"
              :value="cat"
            >
              {{ cat === 'all' ? 'All Categories' : cat }}
            </option>
          </select>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Pattern ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Hits
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="pattern in filteredPatterns"
                :key="pattern.id"
              >
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm text-green-600">
                  {{ pattern.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ pattern.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {{ pattern.category }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                  {{ pattern.hits }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400 text-sm">
                  {{ new Date(pattern.lastUsed).toLocaleDateString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

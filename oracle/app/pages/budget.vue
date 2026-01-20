<script setup lang="ts">
// CELLM Oracle - Budget Tracker Page
// Using NuxtCharts Premium for visualizations

// Chart legend position - cast to any for nuxt-charts compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const legendBottom = 'bottom' as any

interface BudgetLayer {
  name: string
  tokens: number
  percentage: number
  color: string
}

interface BudgetData {
  layers: BudgetLayer[]
  total: number
  limit: number
  percentage: number
}

const budgetData = ref<BudgetData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch budget data
async function fetchBudget(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<BudgetData>('/api/budget')
    budgetData.value = response
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch budget'
    // Use mock data for demo
    budgetData.value = {
      layers: [
        { name: 'Core', tokens: 781, percentage: 36, color: '#16a34a' },
        { name: 'Domain', tokens: 220, percentage: 10, color: '#2563eb' },
        { name: 'Patterns', tokens: 1272, percentage: 58, color: '#9333ea' },
        { name: 'Project', tokens: 180, percentage: 8, color: '#f59e0b' },
        { name: 'Session', tokens: 50, percentage: 2, color: '#06b6d4' },
      ],
      total: 2053,
      limit: 2200,
      percentage: 93,
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchBudget)

// DonutChart data - array of token values
const donutData = computed(() =>
  budgetData.value?.layers.map(l => l.tokens) || [],
)

// DonutChart categories
const donutCategories = computed(() => {
  if (!budgetData.value)
    return {}
  return budgetData.value.layers.reduce((acc, layer) => {
    acc[layer.name] = { name: layer.name, color: layer.color }
    return acc
  }, {} as Record<string, { name: string, color: string }>)
})

// BarChart data - transform layers into chart format
const barData = computed(() => {
  if (!budgetData.value)
    return []
  return budgetData.value.layers.map(layer => ({
    name: layer.name,
    tokens: layer.tokens,
  }))
})

// BarChart categories
const barCategories = {
  tokens: { name: 'Tokens', color: '#16a34a' },
}

// X-axis formatter for bar chart
const barXFormatter = (i: number): string => {
  return barData.value[i]?.name || ''
}

// Status color
const statusColor = computed(() => {
  if (!budgetData.value)
    return 'text-gray-600'
  if (budgetData.value.percentage > 95)
    return 'text-red-600'
  if (budgetData.value.percentage > 90)
    return 'text-yellow-600'
  return 'text-green-600'
})

const statusIcon = computed(() => {
  if (!budgetData.value)
    return '[...]'
  if (budgetData.value.percentage > 95)
    return '[-]'
  if (budgetData.value.percentage > 90)
    return '[!]'
  return '[+]'
})
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Budget Tracker
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Monitor context token usage across layers
        </p>
      </div>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        @click="fetchBudget"
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
          Loading budget data...
        </p>
      </div>
    </div>

    <!-- Budget Overview -->
    <div
      v-else-if="budgetData"
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
    >
      <!-- Total Budget Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Budget
          </h3>
          <span
            :class="statusColor"
            class="text-xl"
          >
            {{ statusIcon }}
          </span>
        </div>
        <div class="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          {{ budgetData.percentage }}%
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {{ budgetData.total }} / {{ budgetData.limit }} tokens
        </p>
        <!-- Progress Bar -->
        <div class="mt-4 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :class="budgetData.percentage > 95
              ? 'bg-red-500'
              : budgetData.percentage > 90
                ? 'bg-yellow-500'
                : 'bg-green-500'"
            :style="{ width: `${budgetData.percentage}%` }"
          />
        </div>
        <p class="text-xs text-gray-400 mt-2">
          {{ budgetData.limit - budgetData.total }} tokens available
        </p>
      </div>

      <!-- Donut Chart - Budget Distribution -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Budget Distribution
        </h3>
        <div class="h-64 flex items-center justify-center">
          <DonutChart
            :data="donutData"
            :categories="donutCategories"
            :height="220"
            :radius="80"
            :arc-width="24"
            :legend-position="legendBottom"
          />
        </div>
      </div>

      <!-- Bar Chart - Tokens by Layer -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Tokens by Layer
        </h3>
        <div class="h-64">
          <BarChart
            :data="barData"
            :categories="barCategories"
            :height="220"
            :y-axis="['tokens']"
            :x-formatter="barXFormatter"
            :hide-legend="true"
            :y-grid-line="true"
            :radius="4"
          />
        </div>
      </div>
    </div>

    <!-- Layer Details Table -->
    <div
      v-if="budgetData"
      class="bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Layer Details
        </h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Layer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Tokens
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                % of Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Usage
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="layer in budgetData.layers"
              :key="layer.name"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span
                    class="w-3 h-3 rounded-full"
                    :style="{ backgroundColor: layer.color }"
                  />
                  <span class="font-medium text-gray-900 dark:text-white">
                    {{ layer.name }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-white">
                {{ layer.tokens }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                {{ layer.percentage }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    class="h-full"
                    :style="{ width: `${layer.percentage}%`, backgroundColor: layer.color }"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Budget Recommendations -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Recommendations
      </h2>
      <ul class="space-y-3">
        <li class="flex items-start gap-3">
          <span class="text-green-600">[+]</span>
          <span class="text-gray-700 dark:text-gray-300">
            Move rarely-used patterns to on-demand loading to reduce core budget
          </span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-blue-600">[i]</span>
          <span class="text-gray-700 dark:text-gray-300">
            Consider splitting large pattern files into smaller, focused files
          </span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-yellow-600">[!]</span>
          <span class="text-gray-700 dark:text-gray-300">
            Budget is above 90% - monitor closely and optimize if it exceeds 95%
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

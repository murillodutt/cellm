<script setup lang="ts">
// CELLM Oracle - Budget Tracker (Premium Industrial Theme)
import type { TaskBoardItem } from '~/types/design-system'

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

async function fetchBudget(): Promise<void> {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<BudgetData>('/api/budget')
    budgetData.value = response
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch budget'
    budgetData.value = {
      layers: [
        { name: 'Core', tokens: 781, percentage: 36, color: '#10b981' },
        { name: 'Domain', tokens: 220, percentage: 10, color: '#3b82f6' },
        { name: 'Patterns', tokens: 1272, percentage: 58, color: '#a855f7' },
        { name: 'Project', tokens: 180, percentage: 8, color: '#ff6b35' },
        { name: 'Session', tokens: 50, percentage: 2, color: '#06d6a0' },
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

const donutData = computed(() => budgetData.value?.layers.map(l => l.tokens) || [])

const donutCategories = computed(() => {
  if (!budgetData.value) return {}
  return budgetData.value.layers.reduce((acc, layer) => {
    acc[layer.name] = { name: layer.name, color: layer.color }
    return acc
  }, {} as Record<string, { name: string, color: string }>)
})

const barData = computed(() => {
  if (!budgetData.value) return []
  return budgetData.value.layers.map(layer => ({
    name: layer.name,
    tokens: layer.tokens,
  }))
})

const barCategories = { tokens: { name: 'Tokens', color: '#ff6b35' } }
const barXFormatter = (i: number): string => barData.value[i]?.name || ''

const budgetStatus = computed(() => {
  if (!budgetData.value) return 'neutral'
  if (budgetData.value.percentage > 95) return 'error'
  if (budgetData.value.percentage > 90) return 'warning'
  return 'success'
})

const recommendations: TaskBoardItem[] = [
  { id: '1', label: 'Move rarely-used patterns to on-demand loading', status: 'pending' },
  { id: '2', label: 'Split large pattern files into smaller focused files', status: 'pending' },
  { id: '3', label: 'Enable path triggers for domain-specific patterns', status: 'pending' },
]
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="page-title">
          Budget Tracker
        </h1>
        <p class="page-subtitle">
          Monitor context token usage across layers
        </p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        color="primary"
        size="lg"
        :loading="loading"
        class="btn-glow"
        @click="fetchBudget"
      >
        Refresh
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading && !budgetData" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="relative inline-block">
          <UIcon name="i-lucide-loader" class="size-12 text-[var(--cellm-orange)] animate-spin" />
          <div class="absolute inset-0 blur-xl bg-[var(--cellm-orange)] opacity-30 animate-pulse" />
        </div>
        <p class="text-[var(--cellm-slate)] mt-4 font-medium">Loading budget data...</p>
      </div>
    </div>

    <template v-else-if="budgetData">
      <!-- Main Metrics Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Total Budget Gauge -->
        <BlueprintCard variant="glow" padding="lg" class="flex flex-col items-center justify-center">
          <GaugeMetric
            label="Total Budget"
            :value="budgetData.percentage"
            :max="100"
            unit="%"
            :status="budgetStatus"
            size="lg"
          />
          <div class="mt-6 text-center">
            <p class="text-lg font-mono font-bold text-[var(--cellm-charcoal)] dark:text-white tabular-nums">
              {{ budgetData.total.toLocaleString() }} / {{ budgetData.limit.toLocaleString() }}
            </p>
            <p class="text-sm text-[var(--cellm-muted-text)] mt-1">
              <span class="text-[var(--cellm-green)] font-semibold">{{ (budgetData.limit - budgetData.total).toLocaleString() }}</span> tokens available
            </p>
          </div>
        </BlueprintCard>

        <!-- Donut Chart -->
        <BlueprintCard title="Distribution" icon="i-lucide-pie-chart" variant="default">
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
        </BlueprintCard>

        <!-- Bar Chart -->
        <BlueprintCard title="By Layer" icon="i-lucide-bar-chart-3" variant="default">
          <div class="h-64">
            <BarChart
              :data="barData"
              :categories="barCategories"
              :height="220"
              :y-axis="['tokens']"
              :x-formatter="barXFormatter"
              :hide-legend="true"
              :y-grid-line="true"
              :radius="6"
            />
          </div>
        </BlueprintCard>
      </div>

      <!-- Layer Details Table -->
      <BlueprintCard title="Layer Details" icon="i-lucide-layers" variant="default">
        <div class="overflow-x-auto -mx-4 px-4">
          <table class="table-industrial">
            <thead>
              <tr>
                <th>Layer</th>
                <th>Tokens</th>
                <th>% of Limit</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="layer in budgetData.layers" :key="layer.name" class="group">
                <td>
                  <div class="flex items-center gap-3">
                    <div
                      class="w-4 h-4 rounded-md shrink-0 shadow-sm"
                      :style="{ backgroundColor: layer.color, boxShadow: `0 0 10px ${layer.color}40` }"
                    />
                    <span class="font-semibold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-orange)] transition-colors">
                      {{ layer.name }}
                    </span>
                  </div>
                </td>
                <td class="font-mono font-bold tabular-nums text-[var(--cellm-charcoal)] dark:text-white">
                  {{ layer.tokens.toLocaleString() }}
                </td>
                <td class="font-mono tabular-nums text-[var(--cellm-slate)]">{{ layer.percentage }}%</td>
                <td>
                  <div class="w-40 h-3 bg-[var(--cellm-muted)] rounded-full overflow-hidden">
                    <div
                      class="h-full rounded-full transition-all duration-500"
                      :style="{
                        width: `${layer.percentage}%`,
                        backgroundColor: layer.color,
                        boxShadow: `0 0 8px ${layer.color}60`
                      }"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BlueprintCard>

      <!-- Summary Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BlueprintCard variant="flat" padding="sm" class="text-center">
          <div class="metric-value-sm text-[var(--cellm-orange)]">{{ budgetData.layers.length }}</div>
          <div class="metric-label">Active Layers</div>
        </BlueprintCard>
        <BlueprintCard variant="flat" padding="sm" class="text-center">
          <div class="metric-value-sm text-[var(--cellm-green)]">{{ Math.max(...budgetData.layers.map(l => l.tokens)).toLocaleString() }}</div>
          <div class="metric-label">Largest Layer</div>
        </BlueprintCard>
        <BlueprintCard variant="flat" padding="sm" class="text-center">
          <div class="metric-value-sm text-[var(--cellm-purple)]">{{ Math.round(budgetData.total / budgetData.layers.length).toLocaleString() }}</div>
          <div class="metric-label">Avg per Layer</div>
        </BlueprintCard>
        <BlueprintCard variant="flat" padding="sm" class="text-center">
          <div class="metric-value-sm text-[var(--cellm-cyan)]">{{ (100 - budgetData.percentage) }}%</div>
          <div class="metric-label">Headroom</div>
        </BlueprintCard>
      </div>

      <!-- Recommendations -->
      <BlueprintCard title="Optimization Recommendations" icon="i-lucide-lightbulb" variant="default">
        <TaskBoard :items="recommendations" />
      </BlueprintCard>
    </template>
  </div>
</template>

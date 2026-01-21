<script setup lang="ts">
// CELLM Oracle - Pattern Analytics (Premium Industrial Theme)

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

async function fetchAnalytics(): Promise<void> {
  loading.value = true

  try {
    const response = await $fetch<PatternAnalytics>('/api/patterns')
    analytics.value = response
  }
  catch {
    analytics.value = {
      patterns: [
        { id: 'TS-001', name: 'Explicit Return Types', category: 'typescript', hits: 156, lastUsed: new Date().toISOString() },
        { id: 'TS-002', name: 'Avoid any Type', category: 'typescript', hits: 142, lastUsed: new Date().toISOString() },
        { id: 'VU-001', name: 'Script Setup', category: 'vue', hits: 98, lastUsed: new Date().toISOString() },
        { id: 'VU-002', name: 'Typed Refs', category: 'vue', hits: 87, lastUsed: new Date().toISOString() },
        { id: 'NX-001', name: 'Use $fetch', category: 'nuxt', hits: 76, lastUsed: new Date().toISOString() },
        { id: 'NX-002', name: 'Auto Imports', category: 'nuxt', hits: 65, lastUsed: new Date().toISOString() },
      ],
      totalPatterns: 52,
      totalHits: 703,
      preventionRate: 87,
      coverageByType: { typescript: 35, vue: 28, nuxt: 20, pinia: 10, other: 7 },
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchAnalytics)

const categories = computed(() => {
  if (!analytics.value) return []
  const cats = new Set(analytics.value.patterns.map(p => p.category))
  return ['all', ...Array.from(cats)]
})

const filteredPatterns = computed(() => {
  if (!analytics.value) return []
  if (selectedCategory.value === 'all') return analytics.value.patterns
  return analytics.value.patterns.filter(p => p.category === selectedCategory.value)
})

const barData = computed(() => {
  return filteredPatterns.value.slice(0, 6).map(p => ({ id: p.id, hits: p.hits }))
})
const barCategories = { hits: { name: 'Hits', color: '#10b981' } }
const barXFormatter = (i: number): string => barData.value[i]?.id || ''

const donutData = computed(() => {
  if (!analytics.value) return []
  return Object.values(analytics.value.coverageByType)
})

const donutCategories = computed(() => {
  if (!analytics.value) return {}
  const colors = ['#10b981', '#3b82f6', '#a855f7', '#ff6b35', '#06d6a0'] as const
  return Object.keys(analytics.value.coverageByType).reduce((acc, key, i) => {
    acc[key] = { name: key, color: colors[i % colors.length] ?? '#6b7280' }
    return acc
  }, {} as Record<string, { name: string, color: string }>)
})

const areaData = computed(() => {
  const rate = analytics.value?.preventionRate || 87
  return [
    { week: 'W1', rate: 72 },
    { week: 'W2', rate: 78 },
    { week: 'W3', rate: 83 },
    { week: 'W4', rate: rate },
  ]
})
const areaCategories = { rate: { name: 'Rate', color: '#10b981' } }
const areaXFormatter = (i: number): string => areaData.value[i]?.week || ''

const categoryColors: Record<string, string> = {
  typescript: '#3b82f6',
  vue: '#10b981',
  nuxt: '#a855f7',
  pinia: '#ff6b35',
  other: '#6b7280',
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="page-title">
          Pattern Analytics
        </h1>
        <p class="page-subtitle">
          Track pattern usage and anti-pattern prevention
        </p>
      </div>
      <UButton icon="i-lucide-refresh-cw" color="primary" size="lg" :loading="loading" class="btn-glow" @click="fetchAnalytics">
        Refresh
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading && !analytics" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="relative inline-block">
          <UIcon name="i-lucide-loader" class="size-12 text-[var(--cellm-orange)] animate-spin" />
          <div class="absolute inset-0 blur-xl bg-[var(--cellm-orange)] opacity-30 animate-pulse" />
        </div>
        <p class="text-[var(--cellm-slate)] mt-4 font-medium">Loading analytics...</p>
      </div>
    </div>

    <template v-else-if="analytics">
      <!-- Stats Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <BlueprintCard variant="glow" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-orange)]" style="text-shadow: 0 0 20px var(--cellm-orange-glow);">
            {{ analytics.totalPatterns }}
          </div>
          <p class="metric-label">Total Patterns</p>
        </BlueprintCard>

        <BlueprintCard variant="default" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-purple)]" style="text-shadow: 0 0 20px var(--cellm-purple-glow);">
            {{ analytics.totalHits.toLocaleString() }}
          </div>
          <p class="metric-label">Total Hits</p>
        </BlueprintCard>

        <BlueprintCard variant="glow" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-green)]" style="text-shadow: 0 0 20px var(--cellm-green-glow);">
            {{ analytics.preventionRate }}%
          </div>
          <p class="metric-label">Prevention Rate</p>
        </BlueprintCard>

        <BlueprintCard variant="default" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-cyan)]" style="text-shadow: 0 0 20px var(--cellm-cyan-glow);">
            {{ Object.keys(analytics.coverageByType).length }}
          </div>
          <p class="metric-label">Categories</p>
        </BlueprintCard>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BlueprintCard title="Most Used" icon="i-lucide-trending-up" variant="default">
          <div class="h-56">
            <BarChart
              :data="barData"
              :categories="barCategories"
              :height="200"
              :y-axis="['hits']"
              :x-formatter="barXFormatter"
              :hide-legend="true"
              :y-grid-line="true"
              :radius="6"
            />
          </div>
        </BlueprintCard>

        <BlueprintCard title="Coverage" icon="i-lucide-pie-chart" variant="default">
          <div class="h-56 flex items-center justify-center">
            <DonutChart
              :data="donutData"
              :categories="donutCategories"
              :height="200"
              :radius="70"
              :arc-width="20"
              :legend-position="legendRight"
            />
          </div>
        </BlueprintCard>

        <BlueprintCard title="Trend" icon="i-lucide-activity" variant="default">
          <div class="h-56">
            <AreaChart
              :data="areaData"
              :categories="areaCategories"
              :height="200"
              :x-formatter="areaXFormatter"
              :hide-legend="true"
              :y-grid-line="true"
              y-label="%"
            />
          </div>
        </BlueprintCard>
      </div>

      <!-- Pattern Table -->
      <BlueprintCard title="Pattern Usage" icon="i-lucide-list" variant="default">
        <template #default>
          <!-- Category Filters -->
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="cat in categories"
              :key="cat"
              class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
              :class="selectedCategory === cat
                ? 'bg-[var(--cellm-orange)] text-white shadow-lg'
                : 'bg-[var(--cellm-muted)] text-[var(--cellm-slate)] hover:bg-[var(--cellm-border-color)]'"
              :style="selectedCategory === cat ? { boxShadow: '0 0 15px var(--cellm-orange-glow)' } : {}"
              @click="selectedCategory = cat"
            >
              {{ cat === 'all' ? 'All' : cat }}
            </button>
          </div>

          <div class="overflow-x-auto -mx-4 px-4">
            <table class="table-industrial">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Hits</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pattern in filteredPatterns" :key="pattern.id" class="group">
                  <td class="font-mono font-bold text-[var(--cellm-green)]">{{ pattern.id }}</td>
                  <td class="font-semibold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-orange)] transition-colors">
                    {{ pattern.name }}
                  </td>
                  <td>
                    <span
                      class="px-3 py-1 text-xs font-semibold rounded-full"
                      :style="{
                        backgroundColor: `${categoryColors[pattern.category] || '#6b7280'}20`,
                        color: categoryColors[pattern.category] || '#6b7280'
                      }"
                    >
                      {{ pattern.category }}
                    </span>
                  </td>
                  <td class="font-mono font-bold tabular-nums text-[var(--cellm-charcoal)] dark:text-white">
                    {{ pattern.hits }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </BlueprintCard>
    </template>
  </div>
</template>

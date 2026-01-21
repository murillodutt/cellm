<script setup lang="ts">
// CELLM Oracle - Prescriptive Actions (Premium Industrial Theme)

interface Action {
  id: string
  title: string
  description: string
  category: 'optimization' | 'fix' | 'improvement' | 'maintenance'
  priority: 'high' | 'medium' | 'low'
  impact: string
  command?: string
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
}

interface ActionsData {
  actions: Action[]
  totalPending: number
  totalCompleted: number
}

const actionsData = ref<ActionsData | null>(null)
const loading = ref(true)
const selectedFilter = ref('all')

async function fetchActions() {
  loading.value = true

  try {
    const response = await $fetch<ActionsData>('/api/actions')
    actionsData.value = response
  }
  catch {
    actionsData.value = {
      actions: [
        {
          id: '1',
          title: 'Reduce Core Budget',
          description: 'Core budget is at 93%. Move rarely-used patterns to on-demand loading.',
          category: 'optimization',
          priority: 'high',
          impact: 'Reduce budget by ~200 tokens',
          command: 'cellm optimize budget',
          status: 'pending',
        },
        {
          id: '2',
          title: 'Update Pattern Versions',
          description: '3 patterns have outdated version tags that need synchronization.',
          category: 'maintenance',
          priority: 'medium',
          impact: 'Maintain consistency',
          status: 'pending',
        },
        {
          id: '3',
          title: 'Split Large Pattern File',
          description: 'typescript.md exceeds 500 token limit. Split into focused files.',
          category: 'fix',
          priority: 'high',
          impact: 'Improve loading performance',
          command: 'cellm split .claude/patterns/typescript.md',
          status: 'pending',
        },
        {
          id: '4',
          title: 'Add Missing Index Entry',
          description: 'context-preservation.md is not listed in the index file.',
          category: 'fix',
          priority: 'medium',
          impact: 'Ensure proper context loading',
          status: 'in_progress',
        },
      ],
      totalPending: 3,
      totalCompleted: 12,
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchActions)

const filterOptions = ['all', 'pending', 'in_progress', 'completed']

const filteredActions = computed(() => {
  if (!actionsData.value) return []
  if (selectedFilter.value === 'all') return actionsData.value.actions
  return actionsData.value.actions.filter(a => a.status === selectedFilter.value)
})

const categoryConfig = {
  optimization: { icon: 'i-lucide-gauge', color: '#3b82f6', bg: 'from-blue-500/20 to-blue-500/5' },
  fix: { icon: 'i-lucide-wrench', color: '#ef4444', bg: 'from-red-500/20 to-red-500/5' },
  improvement: { icon: 'i-lucide-sparkles', color: '#10b981', bg: 'from-emerald-500/20 to-emerald-500/5' },
  maintenance: { icon: 'i-lucide-settings', color: '#6b7280', bg: 'from-gray-500/20 to-gray-500/5' },
} as const

const priorityConfig = {
  high: { label: 'High', color: '#ef4444', bg: 'bg-red-500/10' },
  medium: { label: 'Medium', color: '#ff6b35', bg: 'bg-[var(--cellm-orange)]/10' },
  low: { label: 'Low', color: '#10b981', bg: 'bg-[var(--cellm-green)]/10' },
} as const

const statusConfig = {
  pending: { label: 'Pending', color: '#6b7280', bg: 'bg-gray-500/10' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'bg-blue-500/10' },
  completed: { label: 'Completed', color: '#10b981', bg: 'bg-[var(--cellm-green)]/10' },
  dismissed: { label: 'Dismissed', color: '#9ca3af', bg: 'bg-gray-400/10' },
} as const

function executeAction(action: Action) {
  if (action.command) {
    navigator.clipboard.writeText(action.command)
  }
}

function updateStatus(action: Action, status: Action['status']) {
  action.status = status
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="page-title">
          Prescriptive Actions
        </h1>
        <p class="page-subtitle">
          Suggested improvements and quick fixes
        </p>
      </div>
      <UButton icon="i-lucide-refresh-cw" color="primary" size="lg" :loading="loading" class="btn-glow" @click="fetchActions">
        Refresh
      </UButton>
    </div>

    <!-- Loading -->
    <div v-if="loading && !actionsData" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="relative inline-block">
          <UIcon name="i-lucide-loader" class="size-12 text-[var(--cellm-orange)] animate-spin" />
          <div class="absolute inset-0 blur-xl bg-[var(--cellm-orange)] opacity-30 animate-pulse" />
        </div>
        <p class="text-[var(--cellm-slate)] mt-4 font-medium">Loading actions...</p>
      </div>
    </div>

    <template v-else-if="actionsData">
      <!-- Stats Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BlueprintCard variant="glow" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-orange)] tabular-nums" style="text-shadow: 0 0 20px var(--cellm-orange-glow);">
            {{ actionsData.totalPending }}
          </div>
          <p class="metric-label">Pending</p>
        </BlueprintCard>

        <BlueprintCard variant="default" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-green)] tabular-nums" style="text-shadow: 0 0 20px var(--cellm-green-glow);">
            {{ actionsData.totalCompleted }}
          </div>
          <p class="metric-label">Completed</p>
        </BlueprintCard>

        <BlueprintCard variant="default" padding="lg" class="text-center">
          <div class="metric-value text-[var(--cellm-red)] tabular-nums" style="text-shadow: 0 0 20px var(--cellm-red-glow);">
            {{ actionsData.actions.filter(a => a.priority === 'high' && a.status === 'pending').length }}
          </div>
          <p class="metric-label">High Priority</p>
        </BlueprintCard>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in filterOptions"
          :key="filter"
          class="px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
          :class="selectedFilter === filter
            ? 'bg-[var(--cellm-orange)] text-white shadow-lg'
            : 'bg-[var(--cellm-muted)] text-[var(--cellm-slate)] hover:bg-[var(--cellm-border-color)]'"
          :style="selectedFilter === filter ? { boxShadow: '0 0 15px var(--cellm-orange-glow)' } : {}"
          @click="selectedFilter = filter"
        >
          {{ filter === 'all' ? 'All' : filter.replace('_', ' ') }}
        </button>
      </div>

      <!-- Actions List -->
      <div class="space-y-4">
        <div
          v-for="action in filteredActions"
          :key="action.id"
          class="oracle-card p-6 hover-lift group"
        >
          <div class="flex flex-col lg:flex-row lg:items-start gap-5">
            <!-- Icon + Content -->
            <div class="flex items-start gap-4 flex-1">
              <div
                class="p-3 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-110"
                :class="`bg-gradient-to-br ${categoryConfig[action.category].bg}`"
              >
                <UIcon
                  :name="categoryConfig[action.category].icon"
                  class="size-6"
                  :style="{ color: categoryConfig[action.category].color }"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-3">
                  <h3 class="font-bold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-orange)] transition-colors">
                    {{ action.title }}
                  </h3>
                  <span
                    class="px-3 py-1 text-xs font-semibold rounded-full"
                    :class="priorityConfig[action.priority].bg"
                    :style="{ color: priorityConfig[action.priority].color }"
                  >
                    {{ priorityConfig[action.priority].label }}
                  </span>
                  <span
                    class="px-3 py-1 text-xs font-semibold rounded-full"
                    :class="statusConfig[action.status].bg"
                    :style="{ color: statusConfig[action.status].color }"
                  >
                    {{ statusConfig[action.status].label }}
                  </span>
                </div>

                <p class="text-sm text-[var(--cellm-slate)] mb-4">{{ action.description }}</p>

                <div class="flex flex-wrap gap-6 text-xs text-[var(--cellm-muted-text)]">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-target" class="size-4" />
                    Impact: <span class="font-semibold text-[var(--cellm-charcoal)] dark:text-white">{{ action.impact }}</span>
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-folder" class="size-4" />
                    Category: <span class="font-semibold text-[var(--cellm-charcoal)] dark:text-white">{{ action.category }}</span>
                  </span>
                </div>

                <div
                  v-if="action.command"
                  class="mt-4 p-4 bg-[var(--cellm-muted)] rounded-lg font-mono text-sm overflow-x-auto border border-[var(--cellm-border-color)]"
                >
                  <code class="text-[var(--cellm-purple)]">{{ action.command }}</code>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 lg:flex-col lg:items-end shrink-0">
              <UButton
                v-if="action.status === 'pending'"
                size="md"
                color="primary"
                class="btn-glow"
                @click="updateStatus(action, 'in_progress')"
              >
                <UIcon name="i-lucide-play" class="size-4 mr-1" />
                Start
              </UButton>
              <UButton
                v-if="action.status === 'in_progress'"
                size="md"
                color="primary"
                class="btn-glow"
                @click="updateStatus(action, 'completed')"
              >
                <UIcon name="i-lucide-check" class="size-4 mr-1" />
                Complete
              </UButton>
              <UButton
                v-if="action.command && action.status !== 'completed'"
                size="md"
                variant="outline"
                color="neutral"
                @click="executeAction(action)"
              >
                <UIcon name="i-lucide-copy" class="size-4 mr-1" />
                Copy
              </UButton>
              <UButton
                v-if="action.status === 'pending'"
                size="md"
                variant="ghost"
                color="neutral"
                @click="updateStatus(action, 'dismissed')"
              >
                Dismiss
              </UButton>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <BlueprintCard v-if="filteredActions.length === 0" variant="glow" class="text-center py-12">
          <div class="relative inline-block mb-4">
            <UIcon name="i-lucide-check-circle" class="size-16 text-[var(--cellm-green)]" />
            <div class="absolute inset-0 blur-2xl bg-[var(--cellm-green)] opacity-30" />
          </div>
          <h3 class="text-xl font-bold text-[var(--cellm-charcoal)] dark:text-white">No actions found</h3>
          <p class="text-[var(--cellm-slate)] mt-2">
            {{ selectedFilter === 'all' ? 'Your project is in great shape!' : `No ${selectedFilter.replace('_', ' ')} actions.` }}
          </p>
        </BlueprintCard>
      </div>
    </template>
  </div>
</template>

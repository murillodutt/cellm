<script setup lang="ts">
// CELLM Oracle - Prescriptive Actions Page

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

// Fetch actions
async function fetchActions() {
  loading.value = true

  try {
    const response = await $fetch<ActionsData>('/api/actions')
    actionsData.value = response
  }
  catch {
    // Use mock data for demo
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
        {
          id: '5',
          title: 'Enable Path Triggers',
          description: 'Vue patterns could be loaded on-demand for .vue files only.',
          category: 'improvement',
          priority: 'low',
          impact: 'Optimize context for non-Vue files',
          status: 'pending',
        },
        {
          id: '6',
          title: 'Run Full Validation',
          description: 'No validation has been run today. Regular validation ensures consistency.',
          category: 'maintenance',
          priority: 'low',
          impact: 'Maintain project health',
          command: 'cellm validate',
          status: 'pending',
        },
      ],
      totalPending: 5,
      totalCompleted: 12,
    }
  }
  finally {
    loading.value = false
  }
}

onMounted(fetchActions)

// Filter options
const filterOptions = ['all', 'pending', 'in_progress', 'completed']

// Filtered actions
const filteredActions = computed(() => {
  if (!actionsData.value)
    return []
  if (selectedFilter.value === 'all')
    return actionsData.value.actions
  return actionsData.value.actions.filter(a => a.status === selectedFilter.value)
})

// Priority colors
const priorityColors: Record<string, string> = {
  high: 'text-red-600 bg-red-100 dark:bg-red-900/20',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20',
  low: 'text-green-600 bg-green-100 dark:bg-green-900/20',
}

// Category icons
const categoryIcons: Record<string, string> = {
  optimization: '[~]',
  fix: '[-]',
  improvement: '[+]',
  maintenance: '[i]',
}

const categoryColors: Record<string, string> = {
  optimization: 'text-blue-600',
  fix: 'text-red-600',
  improvement: 'text-green-600',
  maintenance: 'text-gray-600',
}

// Status colors
const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
  completed: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300',
  dismissed: 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
}

// Action handlers
function executeAction(action: Action) {
  if (action.command) {
    // Copy command to clipboard
    navigator.clipboard.writeText(action.command)
    alert(`Command copied to clipboard: ${action.command}`)
  }
}

function updateStatus(action: Action, status: Action['status']) {
  action.status = status
  // In real implementation, this would call an API
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Prescriptive Actions
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          Suggested improvements and quick fixes
        </p>
      </div>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        @click="fetchActions"
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
          Loading actions...
        </p>
      </div>
    </div>

    <!-- Actions Content -->
    <template v-else-if="actionsData">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Actions
            </h3>
            <span class="text-yellow-600">[!]</span>
          </div>
          <div class="text-4xl font-bold text-gray-900 dark:text-white">
            {{ actionsData.totalPending }}
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              Completed
            </h3>
            <span class="text-green-600">[+]</span>
          </div>
          <div class="text-4xl font-bold text-green-600">
            {{ actionsData.totalCompleted }}
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
              High Priority
            </h3>
            <span class="text-red-600">[-]</span>
          </div>
          <div class="text-4xl font-bold text-red-600">
            {{ actionsData.actions.filter(a => a.priority === 'high' && a.status === 'pending').length }}
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="flex gap-2">
        <button
          v-for="filter in filterOptions"
          :key="filter"
          class="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          :class="selectedFilter === filter
            ? 'bg-green-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
          @click="selectedFilter = filter"
        >
          {{ filter === 'all' ? 'All' : filter.replace('_', ' ').charAt(0).toUpperCase() + filter.replace('_', ' ').slice(1) }}
        </button>
      </div>

      <!-- Actions List -->
      <div class="space-y-4">
        <div
          v-for="action in filteredActions"
          :key="action.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-start gap-4">
              <span
                class="text-2xl"
                :class="categoryColors[action.category]"
              >
                {{ categoryIcons[action.category] }}
              </span>
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white">
                    {{ action.title }}
                  </h3>
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="priorityColors[action.priority]"
                  >
                    {{ action.priority }}
                  </span>
                  <span
                    class="px-2 py-0.5 text-xs font-medium rounded-full"
                    :class="statusColors[action.status]"
                  >
                    {{ action.status.replace('_', ' ') }}
                  </span>
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-3">
                  {{ action.description }}
                </p>
                <div class="flex items-center gap-4 text-sm">
                  <span class="text-gray-500 dark:text-gray-400">
                    Impact: <span class="text-gray-900 dark:text-white">{{ action.impact }}</span>
                  </span>
                  <span class="text-gray-500 dark:text-gray-400">
                    Category: <span class="text-gray-900 dark:text-white">{{ action.category }}</span>
                  </span>
                </div>
                <div
                  v-if="action.command"
                  class="mt-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md font-mono text-sm"
                >
                  <code>{{ action.command }}</code>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2">
              <button
                v-if="action.status === 'pending'"
                class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                @click="updateStatus(action, 'in_progress')"
              >
                Start
              </button>
              <button
                v-if="action.status === 'in_progress'"
                class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                @click="updateStatus(action, 'completed')"
              >
                Complete
              </button>
              <button
                v-if="action.command && action.status !== 'completed'"
                class="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                @click="executeAction(action)"
              >
                Copy Command
              </button>
              <button
                v-if="action.status === 'pending'"
                class="px-3 py-1.5 text-gray-500 text-sm hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                @click="updateStatus(action, 'dismissed')"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredActions.length === 0"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center"
        >
          <div class="text-4xl mb-4 text-green-600">
            [+]
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No actions found
          </h3>
          <p class="text-gray-500 dark:text-gray-400">
            {{ selectedFilter === 'all'
              ? 'Your project is in great shape!'
              : `No ${selectedFilter.replace('_', ' ')} actions at the moment.` }}
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

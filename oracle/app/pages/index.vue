<script setup lang="ts">
// CELLM Oracle - Dashboard (Premium Industrial Theme)
import type { ProjectStatus } from '~/types'
import type { TaskBoardItem } from '~/types/design-system'

const status = ref<ProjectStatus | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function fetchStatus() {
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<ProjectStatus>('/api/status')
    status.value = response
  }
  catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch status'
  }
  finally {
    loading.value = false
  }
}

let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  fetchStatus()
  refreshInterval = setInterval(fetchStatus, 30000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})

// Convert errors/warnings to task board items
const issueItems = computed<TaskBoardItem[]>(() => {
  if (!status.value) return []

  const items: TaskBoardItem[] = []

  status.value.errors.forEach((err, i) => {
    items.push({
      id: `error-${i}`,
      label: err,
      status: 'failed',
    })
  })

  status.value.warnings.forEach((warn, i) => {
    items.push({
      id: `warning-${i}`,
      label: warn,
      status: 'pending',
    })
  })

  return items
})

// Budget status
const budgetStatus = computed(() => {
  if (!status.value) return 'neutral'
  if (status.value.budget.percentage > 95) return 'error'
  if (status.value.budget.percentage > 90) return 'warning'
  return 'success'
})

// Health status
const healthStatus = computed(() => {
  if (!status.value) return 'neutral'
  return status.value.valid ? 'success' : 'error'
})
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="page-title">
          Dashboard
        </h1>
        <p class="page-subtitle">
          CELLM project overview and health status
        </p>
      </div>
      <UButton
        icon="i-lucide-refresh-cw"
        color="primary"
        size="lg"
        :loading="loading"
        class="btn-glow"
        @click="fetchStatus"
      >
        Refresh
      </UButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !status" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="relative inline-block">
          <UIcon name="i-lucide-loader" class="size-12 text-[var(--cellm-orange)] animate-spin" />
          <div class="absolute inset-0 blur-xl bg-[var(--cellm-orange)] opacity-30 animate-pulse" />
        </div>
        <p class="text-[var(--cellm-slate)] mt-4 font-medium">Loading status...</p>
      </div>
    </div>

    <!-- Error State -->
    <BlueprintCard v-else-if="error && !status" variant="flat">
      <div class="flex items-start gap-4 p-2">
        <div class="p-3 rounded-xl bg-[var(--cellm-red)]/10">
          <UIcon name="i-lucide-alert-circle" class="size-6 text-[var(--cellm-red)]" />
        </div>
        <div>
          <h3 class="font-bold text-[var(--cellm-charcoal)] dark:text-white">Error Loading Status</h3>
          <p class="text-sm mt-1 text-[var(--cellm-slate)]">{{ error }}</p>
        </div>
      </div>
    </BlueprintCard>

    <!-- Main Content -->
    <template v-else-if="status">
      <!-- Primary Metrics Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Health Score -->
        <BlueprintCard variant="glow" padding="lg" class="flex flex-col items-center">
          <GaugeMetric
            label="Health"
            :value="status.valid ? 100 : 0"
            :max="100"
            unit="%"
            size="lg"
            :status="healthStatus"
          />
        </BlueprintCard>

        <!-- Version -->
        <BlueprintCard variant="default" padding="lg" class="flex flex-col items-center justify-center">
          <div class="text-center">
            <div class="metric-value text-[var(--cellm-purple)]" style="text-shadow: 0 0 20px var(--cellm-purple-glow);">
              {{ status.version }}
            </div>
            <span class="metric-label">
              Version
            </span>
          </div>
        </BlueprintCard>

        <!-- Budget -->
        <BlueprintCard variant="glow" padding="lg" class="flex flex-col items-center">
          <GaugeMetric
            label="Budget"
            :value="status.budget.percentage"
            :max="100"
            unit="%"
            size="lg"
            :status="budgetStatus"
          />
        </BlueprintCard>

        <!-- Profile -->
        <BlueprintCard variant="default" padding="lg" class="flex flex-col items-center justify-center">
          <div class="text-center">
            <div class="metric-value text-[var(--cellm-cyan)]" style="text-shadow: 0 0 20px var(--cellm-cyan-glow);">
              {{ status.profile }}
            </div>
            <span class="metric-label">
              Profile
            </span>
          </div>
        </BlueprintCard>
      </div>

      <!-- Quick Navigation Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink
          to="/budget"
          class="oracle-card group p-5 hover-lift"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-gradient-to-br from-[var(--cellm-orange)]/20 to-[var(--cellm-orange)]/5 group-hover:from-[var(--cellm-orange)]/30 group-hover:to-[var(--cellm-orange)]/10 transition-colors">
              <UIcon name="i-lucide-wallet" class="size-6 text-[var(--cellm-orange)]" />
            </div>
            <div>
              <h3 class="font-bold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-orange)] transition-colors">Budget</h3>
              <p class="text-xs text-[var(--cellm-muted-text)]">Token usage</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-2xl font-mono font-bold text-[var(--cellm-charcoal)] dark:text-white tabular-nums">
              {{ status.budget.percentage }}%
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-5 text-[var(--cellm-muted-text)] group-hover:text-[var(--cellm-orange)] group-hover:translate-x-1 transition-all" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/patterns"
          class="oracle-card group p-5 hover-lift"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-gradient-to-br from-[var(--cellm-green)]/20 to-[var(--cellm-green)]/5 group-hover:from-[var(--cellm-green)]/30 group-hover:to-[var(--cellm-green)]/10 transition-colors">
              <UIcon name="i-lucide-code" class="size-6 text-[var(--cellm-green)]" />
            </div>
            <div>
              <h3 class="font-bold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-green)] transition-colors">Patterns</h3>
              <p class="text-xs text-[var(--cellm-muted-text)]">Analytics</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-2xl font-mono font-bold text-[var(--cellm-charcoal)] dark:text-white">
              Active
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-5 text-[var(--cellm-muted-text)] group-hover:text-[var(--cellm-green)] group-hover:translate-x-1 transition-all" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/pulse"
          class="oracle-card group p-5 hover-lift"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-gradient-to-br from-[var(--cellm-purple)]/20 to-[var(--cellm-purple)]/5 group-hover:from-[var(--cellm-purple)]/30 group-hover:to-[var(--cellm-purple)]/10 transition-colors">
              <UIcon name="i-lucide-heart-pulse" class="size-6 text-[var(--cellm-purple)]" />
            </div>
            <div>
              <h3 class="font-bold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-purple)] transition-colors">Pulse</h3>
              <p class="text-xs text-[var(--cellm-muted-text)]">Health timeline</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-2xl font-mono font-bold text-[var(--cellm-green)]">
              {{ status.valid ? 'OK' : 'ERR' }}
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-5 text-[var(--cellm-muted-text)] group-hover:text-[var(--cellm-purple)] group-hover:translate-x-1 transition-all" />
          </div>
        </NuxtLink>

        <NuxtLink
          to="/actions"
          class="oracle-card group p-5 hover-lift"
        >
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-gradient-to-br from-[var(--cellm-cyan)]/20 to-[var(--cellm-cyan)]/5 group-hover:from-[var(--cellm-cyan)]/30 group-hover:to-[var(--cellm-cyan)]/10 transition-colors">
              <UIcon name="i-lucide-zap" class="size-6 text-[var(--cellm-cyan)]" />
            </div>
            <div>
              <h3 class="font-bold text-[var(--cellm-charcoal)] dark:text-white group-hover:text-[var(--cellm-cyan)] transition-colors">Actions</h3>
              <p class="text-xs text-[var(--cellm-muted-text)]">Quick fixes</p>
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between">
            <span class="text-2xl font-mono font-bold text-[var(--cellm-charcoal)] dark:text-white">
              Run
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-5 text-[var(--cellm-muted-text)] group-hover:text-[var(--cellm-cyan)] group-hover:translate-x-1 transition-all" />
          </div>
        </NuxtLink>
      </div>

      <!-- Issues Section -->
      <BlueprintCard
        v-if="issueItems.length > 0"
        title="Issues"
        icon="i-lucide-alert-triangle"
        variant="default"
      >
        <TaskBoard :items="issueItems" />
      </BlueprintCard>

      <!-- All Clear State -->
      <BlueprintCard v-else variant="glow" class="text-center py-10">
        <div class="relative inline-block mb-4">
          <UIcon name="i-lucide-check-circle" class="size-16 text-[var(--cellm-green)]" />
          <div class="absolute inset-0 blur-2xl bg-[var(--cellm-green)] opacity-30" />
        </div>
        <h3 class="text-xl font-bold text-[var(--cellm-charcoal)] dark:text-white">All Systems Operational</h3>
        <p class="text-[var(--cellm-slate)] mt-2">No errors or warnings detected</p>
      </BlueprintCard>

      <!-- Last Validation Footer -->
      <div class="text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--cellm-muted)]/50 text-sm text-[var(--cellm-muted-text)]">
          <UIcon name="i-lucide-clock" class="size-4" />
          Last validated: {{ new Date(status.lastValidation).toLocaleString() }}
        </span>
      </div>
    </template>
  </div>
</template>

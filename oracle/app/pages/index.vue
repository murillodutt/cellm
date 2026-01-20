<script setup lang="ts">
// CELLM Oracle - Dashboard Home
import type { ProjectStatus } from '~/types'

const status = ref<ProjectStatus | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Fetch project status
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

// Refresh on mount
onMounted(fetchStatus)

// Auto-refresh every 30 seconds
const refreshInterval = setInterval(fetchStatus, 30000)
onUnmounted(() => clearInterval(refreshInterval))
</script>

<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p class="text-gray-500 dark:text-gray-400">
          CELLM project overview and health status
        </p>
      </div>
      <button
        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        @click="fetchStatus"
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
          Loading status...
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6"
    >
      <div class="flex items-start gap-3">
        <span class="text-red-600 text-xl">[-]</span>
        <div>
          <h3 class="font-semibold text-red-800 dark:text-red-200">
            Error Loading Status
          </h3>
          <p class="text-red-600 dark:text-red-300 mt-1">
            {{ error }}
          </p>
        </div>
      </div>
    </div>

    <!-- Status Grid -->
    <div
      v-else-if="status"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      <!-- Health Status Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Health Status
          </h3>
          <span
            :class="status.valid
              ? 'text-green-600'
              : 'text-red-600'"
            class="text-xl"
          >
            {{ status.valid ? '[+]' : '[-]' }}
          </span>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ status.valid ? 'Healthy' : 'Issues Found' }}
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ status.errors.length }} errors, {{ status.warnings.length }} warnings
        </p>
      </div>

      <!-- Version Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            CELLM Version
          </h3>
          <span class="text-blue-600 text-xl">[i]</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ status.version }}
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Profile: {{ status.profile }}
        </p>
      </div>

      <!-- Budget Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Token Budget
          </h3>
          <span
            :class="status.budget.percentage > 90
              ? 'text-red-600'
              : status.budget.percentage > 70
                ? 'text-yellow-600'
                : 'text-green-600'"
            class="text-xl"
          >
            {{ status.budget.percentage > 90 ? '[!]' : '[+]' }}
          </span>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ status.budget.percentage }}%
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ status.budget.used }} / {{ status.budget.total }} tokens
        </p>
        <!-- Budget Progress Bar -->
        <div class="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-300"
            :class="status.budget.percentage > 90
              ? 'bg-red-500'
              : status.budget.percentage > 70
                ? 'bg-yellow-500'
                : 'bg-green-500'"
            :style="{ width: `${status.budget.percentage}%` }"
          />
        </div>
      </div>

      <!-- Last Validation Card -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Last Validation
          </h3>
          <span class="text-gray-600 text-xl">[...]</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ new Date(status.lastValidation).toLocaleTimeString() }}
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {{ new Date(status.lastValidation).toLocaleDateString() }}
        </p>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        to="/budget"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center gap-3"
      >
        <span class="text-2xl text-green-600">[+]</span>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Budget Tracker
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Monitor token usage
          </p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/patterns"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center gap-3"
      >
        <span class="text-2xl text-blue-600">[i]</span>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Pattern Analytics
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            View pattern usage
          </p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/pulse"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center gap-3"
      >
        <span class="text-2xl text-purple-600">[~]</span>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Project Pulse
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Health timeline
          </p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/actions"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition-shadow flex items-center gap-3"
      >
        <span class="text-2xl text-yellow-600">[!]</span>
        <div>
          <h3 class="font-semibold text-gray-900 dark:text-white">
            Prescriptive Actions
          </h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Suggested fixes
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Issues List -->
    <div
      v-if="status && (status.errors.length > 0 || status.warnings.length > 0)"
      class="bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
          Issues
        </h2>
      </div>
      <ul class="divide-y divide-gray-200 dark:divide-gray-700">
        <li
          v-for="err in status.errors"
          :key="err"
          class="px-6 py-4 flex items-start gap-3"
        >
          <span class="text-red-600">[-]</span>
          <span class="text-gray-900 dark:text-white">{{ err }}</span>
        </li>
        <li
          v-for="warning in status.warnings"
          :key="warning"
          class="px-6 py-4 flex items-start gap-3"
        >
          <span class="text-yellow-600">[!]</span>
          <span class="text-gray-900 dark:text-white">{{ warning }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

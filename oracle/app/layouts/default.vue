<script setup lang="ts">
// CELLM Oracle - Default Layout
const route = useRoute()
const config = useRuntimeConfig()

const navigation = [
  { name: 'Dashboard', href: '/', icon: 'i-heroicons-home' },
  { name: 'Budget', href: '/budget', icon: 'i-heroicons-chart-pie' },
  { name: 'Patterns', href: '/patterns', icon: 'i-heroicons-code-bracket' },
  { name: 'Pulse', href: '/pulse', icon: 'i-heroicons-heart' },
  { name: 'Actions', href: '/actions', icon: 'i-heroicons-bolt' },
]

const isActive = (href: string): boolean => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo -->
          <div class="flex items-center gap-3">
            <span class="text-2xl font-bold text-green-600">[+]</span>
            <span class="text-xl font-semibold text-gray-900 dark:text-white">
              CELLM Oracle
            </span>
            <span class="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
              v{{ config.public.version }}
            </span>
          </div>

          <!-- Navigation -->
          <nav class="hidden md:flex items-center gap-1">
            <NuxtLink
              v-for="item in navigation"
              :key="item.href"
              :to="item.href"
              class="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              :class="isActive(item.href)
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'"
            >
              {{ item.name }}
            </NuxtLink>
          </nav>

          <!-- Status Indicator -->
          <div class="flex items-center gap-2">
            <span class="text-green-500">[UP]</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              MCP Active
            </span>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>CELLM Oracle - Spec-Driven Development System</span>
          <span>v{{ config.public.version }}</span>
        </div>
      </div>
    </footer>
  </div>
</template>

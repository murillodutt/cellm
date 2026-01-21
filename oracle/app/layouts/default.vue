<script setup lang="ts">
// CELLM Oracle - Default Layout (Premium Industrial Theme)
import type { NavigationItem, ConveyorStage, StatusIndicator } from '~/types/design-system'

const config = useRuntimeConfig()

const navigation: NavigationItem[] = [
  { name: 'Dashboard', to: '/', icon: 'i-lucide-layout-dashboard', stage: 'vision' },
  { name: 'Budget', to: '/budget', icon: 'i-lucide-wallet', stage: 'tasks' },
  { name: 'Patterns', to: '/patterns', icon: 'i-lucide-code', stage: 'code' },
  { name: 'Pulse', to: '/pulse', icon: 'i-lucide-heart-pulse', stage: 'review' },
  { name: 'Actions', to: '/actions', icon: 'i-lucide-zap', stage: 'production' },
]

const mobileMenuOpen = ref(false)
const connectionStatus = ref<StatusIndicator>('online')

// Determine current stage based on route
const route = useRoute()
const currentStage = computed<ConveyorStage>(() => {
  const item = navigation.find(n => n.to === route.path)
  return item?.stage || 'vision'
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[var(--cellm-canvas)]">
    <!-- Factory Header -->
    <FactoryHeader :status="connectionStatus">
      <template #mobile-toggle>
        <UButton
          icon="i-lucide-menu"
          variant="ghost"
          color="neutral"
          size="lg"
          class="lg:hidden"
          @click="mobileMenuOpen = true"
        />
      </template>
    </FactoryHeader>

    <!-- Conveyor Navigation -->
    <ConveyorNav
      :items="navigation"
      :current-stage="currentStage"
    />

    <!-- Mobile Drawer -->
    <MobileDrawer
      :items="navigation"
      :open="mobileMenuOpen"
      @update:open="mobileMenuOpen = $event"
    />

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[var(--cellm-elevated)] border-t border-[var(--cellm-border-color)] mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-3 text-sm">
          <span class="flex items-center gap-2 text-[var(--cellm-muted-text)]">
            <div class="p-1.5 rounded-md bg-[var(--cellm-orange)]/10">
              <UIcon name="i-lucide-settings" class="size-4 text-[var(--cellm-orange)]" />
            </div>
            <span class="font-mono">CELLM Oracle</span>
            <span class="px-2 py-0.5 rounded-md bg-[var(--cellm-muted)] text-xs font-semibold">
              v{{ config.public.version }}
            </span>
          </span>
          <span class="text-[var(--cellm-slate)] font-medium">
            Spec-Driven Development
          </span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import type { StatusIndicator } from '~/types/design-system'

interface Props {
  status?: StatusIndicator
}

const props = withDefaults(defineProps<Props>(), {
  status: 'online',
})

const colorMode = useColorMode()

const statusConfig = computed(() => {
  switch (props.status) {
    case 'online':
      return { label: 'Online', class: 'status-online', badge: 'status-badge-success' }
    case 'offline':
      return { label: 'Offline', class: 'status-offline', badge: 'status-badge-error' }
    case 'warning':
      return { label: 'Warning', class: 'status-warning', badge: 'status-badge-warning' }
    default:
      return { label: 'Unknown', class: '', badge: 'status-badge-info' }
  }
})

function toggleColorMode() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <header class="bg-surface border-b border-[var(--cellm-border-color)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo + Branding -->
        <div class="flex items-center gap-4">
          <!-- Logo Mark -->
          <div class="relative">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--cellm-orange)] to-[var(--cellm-orange-dark)] flex items-center justify-center shadow-lg">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v4m0 14v4M4.22 4.22l2.83 2.83m9.9 9.9l2.83 2.83M1 12h4m14 0h4M4.22 19.78l2.83-2.83m9.9-9.9l2.83-2.83" />
              </svg>
            </div>
            <!-- Glow effect -->
            <div class="absolute inset-0 w-10 h-10 rounded-xl bg-[var(--cellm-orange)] blur-lg opacity-30" />
          </div>

          <!-- Text -->
          <div>
            <h1 class="text-lg font-bold tracking-tight text-[var(--cellm-charcoal)]">
              CELLM
              <span class="gradient-text">Oracle</span>
            </h1>
            <p class="text-xs font-medium text-[var(--cellm-muted-text)] tracking-wide">
              Spec-Driven Development
            </p>
          </div>
        </div>

        <!-- Right Section -->
        <div class="flex items-center gap-3">
          <!-- Status Badge -->
          <div class="hidden sm:flex items-center">
            <div :class="['status-badge', statusConfig.badge]">
              <span :class="['status-dot', statusConfig.class]" />
              <span>{{ statusConfig.label }}</span>
            </div>
          </div>

          <!-- Color Mode Toggle -->
          <button
            class="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[var(--cellm-muted)] transition-colors focus-ring"
            @click="toggleColorMode"
          >
            <UIcon
              :name="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
              class="size-5 text-[var(--cellm-slate)]"
            />
          </button>

          <!-- Mobile Menu Button -->
          <slot name="mobile-toggle" />
        </div>
      </div>
    </div>

    <!-- Accent Line -->
    <div class="h-[3px] bg-gradient-to-r from-[var(--cellm-orange)] via-[var(--cellm-purple)] to-[var(--cellm-cyan)]" />
  </header>
</template>

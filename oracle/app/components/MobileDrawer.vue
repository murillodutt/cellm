<script setup lang="ts">
import type { NavigationItem } from '~/types/design-system'

interface Props {
  items: NavigationItem[]
  open: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const route = useRoute()

function isActive(item: NavigationItem): boolean {
  return route.path === item.to
}

function handleNavigate() {
  emit('update:open', false)
}
</script>

<template>
  <USlideover
    :open="open"
    side="left"
    @update:open="emit('update:open', $event)"
  >
    <template #content>
      <div class="flex flex-col h-full bg-elevated">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-industrial">
          <div class="flex items-center gap-3">
            <div class="flex items-center justify-center w-8 h-8 rounded-lg bg-surface">
              <UIcon name="i-lucide-settings" class="size-5 text-orange" />
            </div>
            <span class="font-semibold">CELLM Oracle</span>
          </div>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="neutral"
            size="sm"
            @click="emit('update:open', false)"
          />
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4">
          <div class="space-y-1">
            <NuxtLink
              v-for="item in items"
              :key="item.to"
              :to="item.to"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              :class="{
                'bg-orange/10 text-orange': isActive(item),
                'text-slate hover:bg-surface hover:text-charcoal dark:hover:text-white': !isActive(item),
              }"
              @click="handleNavigate"
            >
              <UIcon :name="item.icon" class="size-5" />
              {{ item.name }}
            </NuxtLink>
          </div>
        </nav>

        <!-- Footer -->
        <div class="p-4 border-t border-industrial">
          <p class="text-xs text-muted text-center">
            CELLM Oracle v1.1
          </p>
        </div>
      </div>
    </template>
  </USlideover>
</template>

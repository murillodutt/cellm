<script setup lang="ts">
import type { TaskBoardItem } from '~/types/design-system'

interface Props {
  items: TaskBoardItem[]
  title?: string
}

defineProps<Props>()

function getStatusIcon(status: TaskBoardItem['status']): string {
  switch (status) {
    case 'completed': return 'i-lucide-check'
    case 'failed': return 'i-lucide-x'
    case 'in_progress': return 'i-lucide-loader'
    default: return ''
  }
}
</script>

<template>
  <div>
    <h4 v-if="title" class="text-sm font-semibold uppercase tracking-wide text-[var(--cellm-slate)] mb-3">
      {{ title }}
    </h4>
    <div class="task-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="task-item"
      >
        <div
          class="task-checkbox"
          :class="{
            'task-checkbox-completed': item.status === 'completed',
            'task-checkbox-failed': item.status === 'failed',
            'task-checkbox-progress': item.status === 'in_progress',
            'task-checkbox-pending': item.status === 'pending',
          }"
        >
          <UIcon
            v-if="item.status !== 'pending'"
            :name="getStatusIcon(item.status)"
            class="size-3"
          />
        </div>
        <div class="task-content">
          <p
            class="task-label"
            :class="{
              'task-label-completed': item.status === 'completed',
            }"
          >
            {{ item.label }}
          </p>
          <p v-if="item.description" class="task-description">
            {{ item.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

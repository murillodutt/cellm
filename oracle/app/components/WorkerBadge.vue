<script setup lang="ts">
import type { WorkerRole } from '~/types/design-system'
import { WORKER_LABELS } from '~/types/design-system'

interface Props {
  role: WorkerRole
  label?: string
}

const props = defineProps<Props>()

const displayLabel = computed(() => props.label || WORKER_LABELS[props.role])

const icon = computed(() => {
  switch (props.role) {
    case 'architect': return 'i-lucide-compass'
    case 'manager': return 'i-lucide-clipboard-list'
    case 'implementer': return 'i-lucide-hammer'
    case 'reviewer': return 'i-lucide-search'
  }
})
</script>

<template>
  <span class="worker-badge" :class="role">
    <UIcon :name="icon" class="size-3.5" />
    {{ displayLabel }}
  </span>
</template>

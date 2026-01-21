<script setup lang="ts">
import type { ConveyorStage, NavigationItem } from '~/types/design-system'

interface Props {
  items: NavigationItem[]
  currentStage?: ConveyorStage
}

const props = withDefaults(defineProps<Props>(), {
  currentStage: 'vision',
})

const route = useRoute()

const stages: { id: ConveyorStage; label: string; icon: string }[] = [
  { id: 'vision', label: 'Vision', icon: 'i-lucide-eye' },
  { id: 'tasks', label: 'Tasks', icon: 'i-lucide-list-checks' },
  { id: 'code', label: 'Code', icon: 'i-lucide-code-2' },
  { id: 'review', label: 'Review', icon: 'i-lucide-search' },
  { id: 'production', label: 'Production', icon: 'i-lucide-rocket' },
]

function getStageStatus(stageId: ConveyorStage): 'completed' | 'current' | 'pending' {
  const stageIds = stages.map(s => s.id)
  const currentIndex = stageIds.indexOf(props.currentStage)
  const stageIndex = stageIds.indexOf(stageId)

  if (stageIndex < currentIndex) return 'completed'
  if (stageIndex === currentIndex) return 'current'
  return 'pending'
}

function isActive(item: NavigationItem): boolean {
  return route.path === item.to
}
</script>

<template>
  <nav class="bg-surface border-b border-[var(--cellm-border-color)]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Conveyor Progress - Desktop -->
      <div class="py-5 hidden lg:block">
        <div class="conveyor-container">
          <div class="conveyor-track">
            <template v-for="(stage, index) in stages" :key="stage.id">
              <!-- Stage Node -->
              <div class="conveyor-stage">
                <div
                  class="conveyor-node"
                  :class="{
                    'conveyor-node-active': getStageStatus(stage.id) === 'completed',
                    'conveyor-node-current': getStageStatus(stage.id) === 'current',
                    'conveyor-node-pending': getStageStatus(stage.id) === 'pending',
                  }"
                >
                  <UIcon
                    v-if="getStageStatus(stage.id) === 'completed'"
                    name="i-lucide-check"
                    class="size-5"
                  />
                  <UIcon
                    v-else
                    :name="stage.icon"
                    class="size-5"
                  />
                </div>
                <span
                  class="conveyor-label"
                  :class="{
                    'conveyor-label-active': getStageStatus(stage.id) === 'completed',
                    'conveyor-label-current': getStageStatus(stage.id) === 'current',
                  }"
                >
                  {{ stage.label }}
                </span>
              </div>

              <!-- Connector -->
              <div
                v-if="index < stages.length - 1"
                class="conveyor-connector"
                :class="{
                  'conveyor-connector-active': getStageStatus(stages[index + 1]!.id) !== 'pending',
                }"
              >
                <div
                  v-if="getStageStatus(stage.id) === 'current'"
                  class="conveyor-connector-progress"
                />
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="py-2">
        <div class="nav-tabs">
          <NuxtLink
            v-for="item in items"
            :key="item.to"
            :to="item.to"
            class="nav-tab"
            :class="{ 'nav-tab-active': isActive(item) }"
          >
            <UIcon :name="item.icon" class="nav-tab-icon" />
            <span>{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: number
  max?: number
  unit?: string
  status?: 'success' | 'warning' | 'error' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  status: 'neutral',
  size: 'md',
  showPercentage: false,
  animated: true,
})

const percentage = computed(() => Math.min(100, Math.round((props.value / props.max) * 100)))

const displayValue = computed(() => {
  if (props.unit === '%') {
    return `${percentage.value}`
  }
  return props.value.toLocaleString()
})

const statusConfig = computed(() => {
  switch (props.status) {
    case 'success':
      return {
        color: 'var(--cellm-green)',
        glow: 'var(--cellm-green-glow)',
        text: 'text-[var(--cellm-green)]',
        gradient: 'from-emerald-400 to-green-500',
      }
    case 'warning':
      return {
        color: 'var(--cellm-orange)',
        glow: 'var(--cellm-orange-glow)',
        text: 'text-[var(--cellm-orange)]',
        gradient: 'from-orange-400 to-amber-500',
      }
    case 'error':
      return {
        color: 'var(--cellm-red)',
        glow: 'var(--cellm-red-glow)',
        text: 'text-[var(--cellm-red)]',
        gradient: 'from-red-400 to-rose-500',
      }
    default:
      return {
        color: 'var(--cellm-purple)',
        glow: 'var(--cellm-purple-glow)',
        text: 'text-[var(--cellm-purple)]',
        gradient: 'from-violet-400 to-purple-500',
      }
  }
})

const sizeConfig = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        container: 'w-24',
        svg: 'w-20 h-20',
        value: 'text-2xl',
        unit: 'text-xs',
        label: 'text-xs',
        stroke: 6,
        radius: 36,
      }
    case 'lg':
      return {
        container: 'w-40',
        svg: 'w-36 h-36',
        value: 'text-5xl',
        unit: 'text-base',
        label: 'text-sm',
        stroke: 10,
        radius: 44,
      }
    default:
      return {
        container: 'w-32',
        svg: 'w-28 h-28',
        value: 'text-4xl',
        unit: 'text-sm',
        label: 'text-xs',
        stroke: 8,
        radius: 40,
      }
  }
})

const circumference = computed(() => 2 * Math.PI * sizeConfig.value.radius)
const strokeDashoffset = computed(() => circumference.value - (percentage.value / 100) * circumference.value)

const glowFilter = computed(() => `drop-shadow(0 0 8px ${statusConfig.value.glow}) drop-shadow(0 0 16px ${statusConfig.value.glow})`)
</script>

<template>
  <div class="gauge-metric" :class="sizeConfig.container">
    <!-- Glow backdrop -->
    <div
      class="absolute inset-0 rounded-full opacity-20 blur-xl transition-opacity duration-500"
      :class="[`bg-gradient-to-br ${statusConfig.gradient}`]"
      :style="{ transform: 'scale(0.8)' }"
    />

    <!-- SVG Container -->
    <div class="relative" :class="sizeConfig.svg">
      <svg
        class="w-full h-full -rotate-90"
        viewBox="0 0 100 100"
      >
        <!-- Definitions for gradients -->
        <defs>
          <linearGradient :id="`gauge-gradient-${label}`" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :style="{ stopColor: statusConfig.color, stopOpacity: 1 }" />
            <stop offset="100%" :style="{ stopColor: statusConfig.color, stopOpacity: 0.6 }" />
          </linearGradient>
        </defs>

        <!-- Background ring -->
        <circle
          cx="50"
          cy="50"
          :r="sizeConfig.radius"
          fill="none"
          :stroke-width="sizeConfig.stroke"
          class="stroke-[var(--cellm-border-color)] opacity-50"
        />

        <!-- Subtle tick marks -->
        <g class="opacity-30">
          <line
            v-for="i in 12"
            :key="i"
            x1="50"
            y1="8"
            x2="50"
            y2="12"
            :transform="`rotate(${i * 30} 50 50)`"
            stroke="currentColor"
            stroke-width="1"
            class="text-[var(--cellm-muted-text)]"
          />
        </g>

        <!-- Progress ring with glow -->
        <circle
          cx="50"
          cy="50"
          :r="sizeConfig.radius"
          fill="none"
          :stroke-width="sizeConfig.stroke"
          stroke-linecap="round"
          :stroke="`url(#gauge-gradient-${label})`"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          :style="{ filter: glowFilter }"
          :class="{ 'transition-all duration-700 ease-out': animated }"
        />

        <!-- End cap glow dot -->
        <circle
          v-if="percentage > 0"
          :cx="50 + sizeConfig.radius * Math.cos(((percentage / 100) * 2 * Math.PI) - Math.PI / 2)"
          :cy="50 + sizeConfig.radius * Math.sin(((percentage / 100) * 2 * Math.PI) - Math.PI / 2)"
          r="4"
          :fill="statusConfig.color"
          :style="{ filter: `drop-shadow(0 0 6px ${statusConfig.color})` }"
          :class="{ 'transition-all duration-700 ease-out': animated }"
        />
      </svg>

      <!-- Center content -->
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <div class="flex items-baseline gap-0.5">
          <span
            class="font-mono font-bold tabular-nums tracking-tight"
            :class="[sizeConfig.value, statusConfig.text]"
            :style="{ textShadow: `0 0 20px ${statusConfig.glow}` }"
          >
            {{ displayValue }}
          </span>
          <span
            v-if="unit"
            class="font-medium text-[var(--cellm-muted-text)]"
            :class="sizeConfig.unit"
          >
            {{ unit }}
          </span>
        </div>

        <!-- Percentage indicator -->
        <div
          v-if="showPercentage && unit !== '%'"
          class="text-xs text-[var(--cellm-muted-text)] tabular-nums"
        >
          {{ percentage }}%
        </div>
      </div>
    </div>

    <!-- Label -->
    <span
      class="mt-3 font-semibold uppercase tracking-wider text-center text-[var(--cellm-slate)]"
      :class="sizeConfig.label"
    >
      {{ label }}
    </span>
  </div>
</template>

<style scoped>
.gauge-metric {
  @apply relative flex flex-col items-center;
}

/* Pulse animation for the glow */
@keyframes gauge-pulse {
  0%, 100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.35;
  }
}

.gauge-metric > div:first-child {
  animation: gauge-pulse 3s ease-in-out infinite;
}
</style>

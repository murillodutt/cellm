<script setup lang="ts">
interface Props {
  title?: string
  icon?: string
  variant?: 'default' | 'glow' | 'flat'
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
})

const paddingClasses = {
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
}

const cardClasses = computed(() => {
  const classes = ['relative overflow-hidden rounded-[var(--radius-lg)] transition-all duration-200']

  switch (props.variant) {
    case 'glow':
      classes.push('oracle-card', 'hover-lift')
      break
    case 'flat':
      classes.push('bg-[var(--cellm-muted)] border border-[var(--cellm-border-color)]')
      break
    default:
      classes.push('oracle-card')
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="cardClasses">
    <!-- Accent stripe for glow variant -->
    <div
      v-if="variant === 'glow'"
      class="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--cellm-orange)] to-[var(--cellm-purple)]"
    />

    <!-- Header -->
    <div
      v-if="title || icon"
      class="oracle-card-header"
      :class="{ 'pt-5': variant === 'glow' }"
    >
      <div v-if="icon" class="oracle-card-icon">
        <UIcon :name="icon" class="size-5 text-[var(--cellm-orange)]" />
      </div>
      <h3 class="oracle-card-title">{{ title }}</h3>
    </div>

    <!-- Content -->
    <div
      class="oracle-card-body"
      :class="[
        paddingClasses[padding],
        { 'pt-0': title || icon }
      ]"
    >
      <slot />
    </div>
  </div>
</template>

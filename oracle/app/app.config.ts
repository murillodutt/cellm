// CELLM Oracle - App Configuration
// Design system colors and Nuxt UI configuration

export default defineAppConfig({
  ui: {
    // Color scheme using CELLM brand colors
    colors: {
      primary: 'orange',
      secondary: 'emerald',
      neutral: 'stone',
      success: 'emerald',
      warning: 'amber',
      error: 'red',
      info: 'sky',
    },

    // Button defaults
    button: {
      defaultVariants: {
        color: 'primary',
      },
    },

    // Card defaults
    card: {
      defaultVariants: {
        variant: 'outline',
      },
    },

    // Badge defaults
    badge: {
      defaultVariants: {
        variant: 'subtle',
      },
    },
  },

  // App metadata
  meta: {
    name: 'CELLM Oracle',
    description: 'Spec-Driven Development Dashboard',
    version: '1.1.0',
  },
})

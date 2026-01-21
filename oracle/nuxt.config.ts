// CELLM Oracle - Nuxt 4 Configuration
// Dashboard and MCP Integration for CELLM

// @ts-expect-error - defineNuxtConfig is auto-imported by Nuxt
export default defineNuxtConfig({
  // Nuxt 4 compatibility
  future: {
    compatibilityVersion: 4,
  },

  // Modules
  modules: [
    '@nuxt/ui',
    '@nuxtjs/mcp-toolkit',
    '@nuxt/devtools',
    'nuxt-charts',
  ],

  // CSS
  css: [
    '~/assets/css/main.css',
  ],

  // MCP Toolkit Configuration
  mcp: {
    // Enable MCP server in development
    enabled: true,
    // DevTools integration
    devtools: true,
  },

  // UI Configuration
  ui: {
    // Use Tailwind CSS
    global: true,
  },

  // App Configuration
  app: {
    head: {
      title: 'CELLM Oracle',
      meta: [
        { name: 'description', content: 'CELLM Oracle - Visual Dashboard and MCP Integration' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      ],
    },
  },

  // Runtime Configuration
  runtimeConfig: {
    // Private keys (server-side)
    // Points to project root where CLAUDE.md and .claude/ are located
    celllmCorePath: process.env.CELLM_CORE_PATH || '..',
    // Public keys (client-side)
    public: {
      appName: 'CELLM Oracle',
      version: '1.1.0',
    },
  },

  // Server Configuration
  nitro: {
    // Enable CORS for MCP requests
    routeRules: {
      '/api/**': { cors: true },
    },
  },

  // TypeScript Configuration
  typescript: {
    strict: true,
    typeCheck: true,
  },

  // DevTools Configuration
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

  // Compatibility
  compatibilityDate: '2026-01-20',
})

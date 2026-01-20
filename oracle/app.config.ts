// CELLM Oracle - App Configuration

export default defineAppConfig({
  // App name
  name: 'CELLM Oracle',

  // UI theme configuration
  ui: {
    primary: 'green',
    gray: 'neutral',
    notifications: {
      position: 'top-right',
    },
  },

  // CELLM specific configuration
  cellm: {
    // Default budget limit
    budgetLimit: 2200,

    // Token estimation factor
    tokenFactor: 4, // characters per token

    // Refresh intervals (ms)
    statusRefreshInterval: 30000,
    analyticsRefreshInterval: 60000,

    // Status thresholds
    budgetWarningThreshold: 90,
    budgetCriticalThreshold: 95,

    // Health score thresholds
    healthGoodThreshold: 90,
    healthWarningThreshold: 70,
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', 'tests', 'src/commands/**'],
      thresholds: {
        // Focus on utils which are unit-testable
        // Commands are integration tests and harder to cover
        // schema.ts has functions that depend on external files
        lines: 55,
        functions: 60,
        branches: 50,
        statements: 55,
      },
    },
  },
})

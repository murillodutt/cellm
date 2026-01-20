import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { analyticsCommand } from '../../src/commands/analytics.js'

describe('analytics command', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('command structure', () => {
    it('should have correct name', () => {
      expect(analyticsCommand.name()).toBe('analytics')
    })

    it('should have description', () => {
      expect(analyticsCommand.description()).toBeTruthy()
    })

    it('should have session subcommand', () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')
      expect(sessionCmd).toBeDefined()
    })

    it('should have history subcommand', () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')
      expect(historyCmd).toBeDefined()
    })

    it('should have report subcommand', () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')
      expect(reportCmd).toBeDefined()
    })
  })

  describe('session subcommand', () => {
    it('should have -d/--dir option', () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')
      const dirOption = sessionCmd?.options.find((o) => o.short === '-d' || o.long === '--dir')
      expect(dirOption).toBeDefined()
    })

    it('should default dir to current directory', () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')
      const dirOption = sessionCmd?.options.find((o) => o.long === '--dir')
      expect(dirOption?.defaultValue).toBe('.')
    })
  })

  describe('history subcommand', () => {
    it('should have -d/--dir option', () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')
      const dirOption = historyCmd?.options.find((o) => o.short === '-d' || o.long === '--dir')
      expect(dirOption).toBeDefined()
    })

    it('should have --days option', () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')
      const daysOption = historyCmd?.options.find((o) => o.long === '--days')
      expect(daysOption).toBeDefined()
    })

    it('should default days to 7', () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')
      const daysOption = historyCmd?.options.find((o) => o.long === '--days')
      expect(daysOption?.defaultValue).toBe('7')
    })
  })

  describe('report subcommand', () => {
    it('should have -d/--dir option', () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')
      const dirOption = reportCmd?.options.find((o) => o.short === '-d' || o.long === '--dir')
      expect(dirOption).toBeDefined()
    })

    it('should have --days option', () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')
      const daysOption = reportCmd?.options.find((o) => o.long === '--days')
      expect(daysOption).toBeDefined()
    })

    it('should have -o/--output option', () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')
      const outputOption = reportCmd?.options.find((o) => o.short === '-o' || o.long === '--output')
      expect(outputOption).toBeDefined()
    })
  })

  describe('session execution', () => {
    it('should execute without errors', async () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')

      // Execute the command action directly
      await sessionCmd?.parseAsync(['node', 'test', '--dir', '.'])

      // Should have output something
      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should show session metrics header', async () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')

      await sessionCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Session Metrics')
    })

    it('should show pattern hits', async () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')

      await sessionCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Pattern Hits')
    })

    it('should show anti-pattern prevents', async () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')

      await sessionCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Anti-Pattern Prevents')
    })

    it('should show token usage', async () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')

      await sessionCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Token Usage')
    })

    it('should show prevention rate', async () => {
      const sessionCmd = analyticsCommand.commands.find((c) => c.name() === 'session')

      await sessionCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Prevention Rate')
    })
  })

  describe('history execution', () => {
    it('should execute without errors', async () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')

      await historyCmd?.parseAsync(['node', 'test'])

      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should show history header', async () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')

      await historyCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Analytics History')
    })

    it('should show average prevention rate', async () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')

      await historyCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Average Prevention Rate')
    })

    it('should show top patterns', async () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')

      await historyCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Top Patterns')
    })

    it('should accept custom days parameter', async () => {
      const historyCmd = analyticsCommand.commands.find((c) => c.name() === 'history')

      await historyCmd?.parseAsync(['node', 'test', '--days', '14'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Last 14 Days')
    })
  })

  describe('report execution', () => {
    it('should execute without errors', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      expect(consoleLogSpy).toHaveBeenCalled()
    })

    it('should show report header', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('Report')
    })

    it('should generate markdown format', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('# CELLM Analytics Report')
    })

    it('should include summary section', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('## Summary')
    })

    it('should include daily breakdown', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('## Daily Breakdown')
    })

    it('should include prevention rate trend', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('## Prevention Rate Trend')
    })

    it('should include ASCII chart', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      // ASCII bar chart contains = characters
      expect(output).toContain('[=')
    })

    it('should include KPI reference', async () => {
      const reportCmd = analyticsCommand.commands.find((c) => c.name() === 'report')

      await reportCmd?.parseAsync(['node', 'test'])

      const output = consoleLogSpy.mock.calls.map((c) => c.join(' ')).join('\n')
      expect(output).toContain('## KPI Reference')
    })
  })
})

import { Command } from 'commander'
import pc from 'picocolors'
import { join } from 'node:path'
import { directoryExists } from '../utils/fs.js'
import { createProgressBar } from '../utils/token.js'
import {
  analyzeContext,
  traceRuleLoading,
  suggestModel,
  getModelDescription,
  getCommandsForModel,
  type ContextAnalysis,
  type ModelTier,
} from '../utils/context.js'

/**
 * Format status color
 */
function statusColor(status: ContextAnalysis['status']): (s: string) => string {
  switch (status) {
    case 'ok':
      return pc.green
    case 'warning':
      return pc.yellow
    case 'critical':
      return pc.red
    case 'exceeded':
      return pc.bgRed
  }
}

/**
 * Create the debug command with subcommands
 */
export const debugCommand = new Command('debug')
  .description('Debug CELLM context loading and configuration')

/**
 * Debug context subcommand
 */
debugCommand
  .command('context')
  .description('Show all loaded context files')
  .option('-d, --dir <path>', 'Directory to analyze', '.')
  .option('-v, --verbose', 'Show detailed file information')
  .action(async (options) => {
    const startTime = performance.now()
    const targetDir = options.dir === '.' ? process.cwd() : options.dir
    const claudeDir = join(targetDir, '.claude')

    if (!directoryExists(claudeDir)) {
      console.log(pc.red('[-] .claude/ directory not found'))
      console.log(pc.dim('    Run "cellm init" to create CELLM structure'))
      process.exit(1)
    }

    const analysis = analyzeContext(targetDir)

    console.log(pc.blue('\nCELLM Context Analysis'))
    console.log(pc.dim('─'.repeat(60)))

    console.log(pc.dim(`\nLoaded Context (${analysis.files.length} files, ${analysis.totalTokens} tokens):\n`))

    // Always Load section
    if (analysis.byTrigger.always.length > 0) {
      console.log(pc.cyan('ALWAYS LOAD:'))
      for (const file of analysis.byTrigger.always) {
        const tokenStr = pc.dim(`(${file.tokens} tokens)`)
        console.log(pc.green(`  [+] ${file.relativePath.padEnd(40)} ${tokenStr}`))
        if (options.verbose && file.frontmatter) {
          console.log(pc.dim(`      id: ${file.frontmatter.id || 'none'}`))
        }
      }
      console.log()
    }

    // By Path section
    if (analysis.byTrigger.path.length > 0) {
      console.log(pc.cyan('BY PATH:'))
      const grouped = new Map<string, typeof analysis.byTrigger.path>()
      for (const file of analysis.byTrigger.path) {
        const pattern = file.triggerPattern || 'project'
        if (!grouped.has(pattern)) grouped.set(pattern, [])
        grouped.get(pattern)!.push(file)
      }

      for (const [pattern, files] of grouped) {
        if (pattern !== 'project') {
          console.log(pc.dim(`  Pattern: ${pattern}`))
        }
        for (const file of files) {
          const tokenStr = pc.dim(`(${file.tokens} tokens)`)
          console.log(pc.green(`  [+] ${file.relativePath.padEnd(40)} ${tokenStr}`))
        }
      }
      console.log()
    }

    // By Command section
    if (analysis.byTrigger.command.length > 0) {
      console.log(pc.cyan('BY COMMAND:'))
      const grouped = new Map<string, typeof analysis.byTrigger.command>()
      for (const file of analysis.byTrigger.command) {
        const cmd = file.triggerPattern || 'unknown'
        if (!grouped.has(cmd)) grouped.set(cmd, [])
        grouped.get(cmd)!.push(file)
      }

      for (const [cmd, files] of grouped) {
        console.log(pc.dim(`  Command: /${cmd}`))
        for (const file of files) {
          const tokenStr = pc.dim(`(${file.tokens} tokens)`)
          console.log(pc.green(`  [+] ${file.relativePath.padEnd(40)} ${tokenStr}`))
        }
      }
      console.log()
    }

    // Summary
    const elapsed = Math.round(performance.now() - startTime)
    console.log(pc.dim('─'.repeat(60)))
    console.log(pc.dim(`Total: ${analysis.files.length} files, ${analysis.totalTokens}/${analysis.totalBudget} tokens`))
    console.log(pc.dim(`Time: ${elapsed}ms`))
  })

/**
 * Debug why subcommand
 */
debugCommand
  .command('why <rule>')
  .description('Explain why a specific rule/file was loaded')
  .option('-d, --dir <path>', 'Directory to analyze', '.')
  .action(async (rule, options) => {
    const targetDir = options.dir === '.' ? process.cwd() : options.dir
    const claudeDir = join(targetDir, '.claude')

    if (!directoryExists(claudeDir)) {
      console.log(pc.red('[-] .claude/ directory not found'))
      process.exit(1)
    }

    const trace = traceRuleLoading(targetDir, rule)

    console.log(pc.blue('\nCELLM Rule Trace'))
    console.log(pc.dim('─'.repeat(60)))

    if (!trace.found) {
      console.log(pc.red(`\n[-] ${rule} not found`))
      console.log(pc.dim(`\n    ${trace.reason}`))
      process.exit(1)
    }

    console.log(pc.green(`\n${trace.file!.relativePath} was loaded because:\n`))

    // Trigger info
    console.log(`  Trigger: ${pc.cyan(trace.trigger!.toUpperCase())}`)
    if (trace.pattern) {
      console.log(`  Pattern: ${pc.cyan(trace.pattern)}`)
    }

    // Reason
    console.log(pc.dim(`\n  ${trace.reason}`))

    // Load chain
    console.log(pc.blue('\n  Load chain:'))
    for (let i = 0; i < trace.chain.length; i++) {
      const prefix = i === 0 ? '  1.' : `  ${i + 1}.`
      console.log(`${prefix} ${trace.chain[i]}`)
    }

    // File info
    if (trace.file) {
      console.log(pc.dim('\n  File info:'))
      console.log(pc.dim(`    Tokens: ${trace.file.tokens}`))
      console.log(pc.dim(`    Layer: ${trace.file.layer}`))
      if (trace.file.budget) {
        console.log(pc.dim(`    Budget: ~${trace.file.budget}`))
      }
    }

    console.log()
  })

/**
 * Debug budget subcommand
 */
debugCommand
  .command('budget')
  .description('Visualize context budget usage by layer')
  .option('-d, --dir <path>', 'Directory to analyze', '.')
  .action(async (options) => {
    const targetDir = options.dir === '.' ? process.cwd() : options.dir
    const claudeDir = join(targetDir, '.claude')

    if (!directoryExists(claudeDir)) {
      console.log(pc.red('[-] .claude/ directory not found'))
      process.exit(1)
    }

    const analysis = analyzeContext(targetDir)

    // Build ASCII table
    const boxWidth = 70

    console.log()
    console.log('+' + '-'.repeat(boxWidth - 2) + '+')
    console.log('|' + pc.bold('                    CELLM CONTEXT BUDGET').padEnd(boxWidth - 2 + 9) + '|')
    console.log('+' + '-'.repeat(boxWidth - 2) + '+')

    // Header row
    const headerRow = '| ' +
      'Layer'.padEnd(12) + '| ' +
      'Tokens'.padEnd(8) + '| ' +
      '% Used'.padEnd(8) + '| ' +
      'Visual'.padEnd(35) + '|'
    console.log(headerRow)
    console.log('+' + '-'.repeat(12) + '+' + '-'.repeat(9) + '+' + '-'.repeat(9) + '+' + '-'.repeat(36) + '+')

    // Layer rows
    for (const layer of analysis.byLayer) {
      if (layer.tokens === 0) continue

      const pct = Math.round(layer.percentage * 100)
      const bar = createProgressBar(layer.percentage, 30)

      const row = '| ' +
        layer.label.padEnd(11) + '| ' +
        String(layer.tokens).padStart(6) + ' | ' +
        (pct + '%').padStart(5) + '  | ' +
        bar.padEnd(33) + '  |'

      // Color based on percentage
      if (layer.percentage >= 0.9) {
        console.log(pc.red(row))
      } else if (layer.percentage >= 0.7) {
        console.log(pc.yellow(row))
      } else {
        console.log(row)
      }
    }

    // Separator
    console.log('+' + '-'.repeat(12) + '+' + '-'.repeat(9) + '+' + '-'.repeat(9) + '+' + '-'.repeat(36) + '+')

    // Total row
    const totalPct = Math.round(analysis.percentage * 100)
    const totalBar = createProgressBar(analysis.percentage, 30)
    const totalRow = '| ' +
      'TOTAL'.padEnd(11) + '| ' +
      String(analysis.totalTokens).padStart(6) + ' | ' +
      (totalPct + '%').padStart(5) + '  | ' +
      totalBar.padEnd(33) + '  |'

    const colorFn = statusColor(analysis.status)
    console.log(colorFn(totalRow))

    // Available row
    const available = analysis.totalBudget - analysis.totalTokens
    const availablePct = Math.round((1 - analysis.percentage) * 100)
    const availableRow = '| ' +
      'AVAILABLE'.padEnd(11) + '| ' +
      String(Math.max(0, available)).padStart(6) + ' | ' +
      (availablePct + '%').padStart(5) + '  | ' +
      `Budget: ${analysis.totalBudget} tokens`.padEnd(33) + '  |'
    console.log(pc.dim(availableRow))

    console.log('+' + '-'.repeat(boxWidth - 2) + '+')

    // Warning message
    if (analysis.status === 'warning') {
      console.log(pc.yellow(`\n[!] WARNING: Budget usage at ${totalPct}%. Consider optimizing context.`))
    } else if (analysis.status === 'critical') {
      console.log(pc.red(`\n[!] CRITICAL: Budget usage at ${totalPct}%. Optimization required.`))
    } else if (analysis.status === 'exceeded') {
      console.log(pc.bgRed(`\n[-] EXCEEDED: Budget overflow by ${-available} tokens. Remove context files.`))
    }

    console.log()
  })

/**
 * Debug model subcommand - show model selection matrix
 */
debugCommand
  .command('model')
  .description('Show model selection matrix and suggest model for command')
  .argument('[command]', 'Command to get suggestion for')
  .action(async (command?: string) => {
    console.log(pc.blue('\nCELLM Model Selection Matrix'))
    console.log(pc.dim('─'.repeat(60)))

    if (command) {
      // Show suggestion for specific command
      const suggested = suggestModel(command)
      const description = getModelDescription(suggested)

      console.log()
      console.log(`  Command: ${pc.cyan('/' + command.replace(/^\//, ''))}`)
      console.log(`  Suggested Model: ${pc.green(suggested.toUpperCase())}`)
      console.log(pc.dim(`  ${description}`))
      console.log()
    } else {
      // Show full matrix
      const tiers: ModelTier[] = ['haiku', 'sonnet', 'opus']

      for (const tier of tiers) {
        const commands = getCommandsForModel(tier)
        const description = getModelDescription(tier)

        console.log()
        console.log(pc.cyan(`  ${tier.toUpperCase()}`))
        console.log(pc.dim(`  ${description}`))
        console.log(`  Commands: ${commands.join(', ')}`)
      }

      console.log()
      console.log(pc.dim('─'.repeat(60)))
      console.log(pc.dim('  Default model (if command not listed): sonnet'))
      console.log(pc.dim('  Override: cellm run /command --model <model>'))
      console.log()
    }
  })

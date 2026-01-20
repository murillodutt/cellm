#!/usr/bin/env node

import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { validateCommand } from './commands/validate.js'
import { doctorCommand } from './commands/doctor.js'
import { syncCommand } from './commands/sync.js'
import { debugCommand } from './commands/debug.js'
import { analyticsCommand } from './commands/analytics.js'
import { compileCommand } from './commands/compile.js'
import { upgradeCommand } from './commands/upgrade.js'
import { feedbackCommand } from './commands/feedback.js'

const program = new Command()

program
  .name('cellm')
  .description('CELLM CLI - Spec-Driven Development System for AI Agents')
  .version('1.0.0')

// Register commands
program.addCommand(initCommand)
program.addCommand(validateCommand)
program.addCommand(doctorCommand)
program.addCommand(syncCommand)
program.addCommand(debugCommand)
program.addCommand(analyticsCommand)
program.addCommand(compileCommand)
program.addCommand(upgradeCommand)
program.addCommand(feedbackCommand)

program.parse()

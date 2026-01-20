import { Command } from 'commander'
import pc from 'picocolors'
import { join } from 'node:path'
import {
  directoryExists,
  ensureDir,
  copyDir,
  copyFile,
  getCellmCorePath,
  writeFile,
  fileExists,
} from '../utils/fs.js'

/**
 * Available profiles for initialization
 */
const PROFILES = {
  'nuxt-fullstack': {
    description: 'Nuxt 4 full-stack with Drizzle, Nuxt UI, Pinia',
    rules: ['core', 'domain/frontend', 'domain/backend'],
    patterns: ['typescript', 'vue', 'nuxt', 'drizzle', 'pinia'],
    skills: ['nuxt', 'vue', 'drizzle', 'pinia', 'nuxt-ui'],
  },
  'nuxt-saas': {
    description: 'Nuxt 4 SaaS with Stripe integration',
    rules: ['core', 'domain/frontend', 'domain/backend'],
    patterns: ['typescript', 'vue', 'nuxt', 'drizzle', 'stripe'],
    skills: ['nuxt', 'vue', 'drizzle', 'stripe', 'nuxt-ui'],
  },
  'vue-spa': {
    description: 'Vue 3 SPA with Pinia',
    rules: ['core', 'domain/frontend'],
    patterns: ['typescript', 'vue', 'pinia'],
    skills: ['vue', 'pinia', 'tailwind'],
  },
  minimal: {
    description: 'Minimal setup with core rules only',
    rules: ['core'],
    patterns: ['typescript'],
    skills: [],
  },
} as const

type ProfileName = keyof typeof PROFILES

/**
 * Create the init command
 */
export const initCommand = new Command('init')
  .description('Initialize CELLM structure in current directory')
  .option('-p, --profile <name>', 'Profile to use (nuxt-fullstack, nuxt-saas, vue-spa, minimal)', 'nuxt-fullstack')
  .option('-f, --force', 'Overwrite existing .claude directory')
  .option('--dry-run', 'Show what would be done without making changes')
  .action(async (options) => {
    const startTime = performance.now()
    const targetDir = process.cwd()
    const claudeDir = join(targetDir, '.claude')

    console.log(pc.blue('\nCELLM Init'))
    console.log(pc.dim('─'.repeat(50)))

    // Validate profile
    const profile = options.profile as ProfileName
    if (!PROFILES[profile]) {
      console.error(pc.red(`[-] Invalid profile: ${profile}`))
      console.log(pc.dim(`Available profiles: ${Object.keys(PROFILES).join(', ')}`))
      process.exit(1)
    }

    console.log(pc.dim(`Profile: ${profile}`))
    console.log(pc.dim(`Description: ${PROFILES[profile].description}`))

    // Check for existing .claude directory
    if (directoryExists(claudeDir) && !options.force) {
      console.error(pc.red('\n[-] .claude directory already exists'))
      console.log(pc.dim('Use --force to overwrite'))
      process.exit(1)
    }

    if (options.dryRun) {
      console.log(pc.yellow('\n[i] Dry run mode - no changes will be made\n'))
    }

    // Get cellm-core path
    const cellmCorePath = getCellmCorePath()
    if (!directoryExists(cellmCorePath)) {
      console.error(pc.red('[-] cellm-core not found'))
      console.log(pc.dim(`Expected at: ${cellmCorePath}`))
      process.exit(1)
    }

    const profileConfig = PROFILES[profile]

    // Create directory structure
    console.log(pc.blue('\nCreating structure...'))

    const directories = [
      '.claude',
      '.claude/rules',
      '.claude/patterns',
      '.claude/skills',
      '.claude/project',
      '.claude/session',
    ]

    for (const dir of directories) {
      const fullPath = join(targetDir, dir)
      if (!options.dryRun) {
        ensureDir(fullPath)
      }
      console.log(pc.green(`  [+] ${dir}/`))
    }

    // Copy rules
    console.log(pc.blue('\nCopying rules...'))
    for (const ruleDir of profileConfig.rules) {
      const srcPath = join(cellmCorePath, 'rules', ruleDir)
      const destPath = join(claudeDir, 'rules', ruleDir)

      if (directoryExists(srcPath)) {
        if (!options.dryRun) {
          copyDir(srcPath, destPath)
        }
        console.log(pc.green(`  [+] rules/${ruleDir}/`))
      } else {
        console.log(pc.yellow(`  [!] rules/${ruleDir}/ not found, skipping`))
      }
    }

    // Copy patterns
    console.log(pc.blue('\nCopying patterns...'))
    for (const patternDir of profileConfig.patterns) {
      const srcFile = join(cellmCorePath, 'patterns', 'core', `${patternDir}.md`)
      const srcDir = join(cellmCorePath, 'patterns', patternDir)

      if (fileExists(srcFile)) {
        const destFile = join(claudeDir, 'patterns', `${patternDir}.md`)
        if (!options.dryRun) {
          copyFile(srcFile, destFile)
        }
        console.log(pc.green(`  [+] patterns/${patternDir}.md`))
      } else if (directoryExists(srcDir)) {
        const destDir = join(claudeDir, 'patterns', patternDir)
        if (!options.dryRun) {
          copyDir(srcDir, destDir)
        }
        console.log(pc.green(`  [+] patterns/${patternDir}/`))
      }
    }

    // Copy anti-patterns (always included)
    const antiPatternsPath = join(cellmCorePath, 'patterns', 'anti')
    if (directoryExists(antiPatternsPath)) {
      const destAnti = join(claudeDir, 'patterns', 'anti')
      if (!options.dryRun) {
        copyDir(antiPatternsPath, destAnti)
      }
      console.log(pc.green('  [+] patterns/anti/'))
    }

    // Copy skills
    if (profileConfig.skills.length > 0) {
      console.log(pc.blue('\nCopying skills...'))
      for (const skill of profileConfig.skills) {
        const srcFile = join(cellmCorePath, 'skills', `${skill}.md`)
        if (fileExists(srcFile)) {
          const destFile = join(claudeDir, 'skills', `${skill}.md`)
          if (!options.dryRun) {
            copyFile(srcFile, destFile)
          }
          console.log(pc.green(`  [+] skills/${skill}.md`))
        }
      }
    }

    // Copy INDEX.md
    const indexSrc = join(cellmCorePath, 'INDEX.md')
    if (fileExists(indexSrc)) {
      if (!options.dryRun) {
        copyFile(indexSrc, join(claudeDir, 'index.md'))
      }
      console.log(pc.green('\n  [+] index.md'))
    }

    // Create CLAUDE.md from template
    console.log(pc.blue('\nCreating CLAUDE.md...'))
    const projectName = targetDir.split('/').pop() || 'my-project'
    const claudeMdContent = generateClaudeMd(projectName, profile)
    if (!options.dryRun) {
      writeFile(join(targetDir, 'CLAUDE.md'), claudeMdContent)
    }
    console.log(pc.green('  [+] CLAUDE.md'))

    // Create session template
    const sessionTemplateSrc = join(cellmCorePath, 'templates', 'session', 'current.md')
    if (fileExists(sessionTemplateSrc)) {
      if (!options.dryRun) {
        copyFile(sessionTemplateSrc, join(claudeDir, 'session', 'current.md'))
      }
      console.log(pc.green('  [+] session/current.md'))
    }

    const elapsed = Math.round(performance.now() - startTime)

    console.log(pc.dim('\n' + '─'.repeat(50)))
    console.log(pc.green(`[+] CELLM initialized successfully`))
    console.log(pc.dim(`    Profile: ${profile}`))
    console.log(pc.dim(`    Time: ${elapsed}ms`))

    if (!options.dryRun) {
      console.log(pc.blue('\nNext steps:'))
      console.log(pc.dim('  1. Review CLAUDE.md and customize for your project'))
      console.log(pc.dim('  2. Run "cellm validate" to verify structure'))
      console.log(pc.dim('  3. Run "cellm doctor" to check configuration'))
    }
  })

/**
 * Generate CLAUDE.md content
 */
function generateClaudeMd(projectName: string, profile: ProfileName): string {
  return `# ${projectName}

<project>
name: ${projectName}
cellm: v0.11.0
profile: ${profile}
</project>

<context>
local: .claude/
index: .claude/index.md
</context>

<loading>
1. Read .claude/index.md
2. Load rules/core/* (always)
3. Load patterns/anti/* (always)
4. Load project/product/* (always)
5. Path-triggered: rules/domain/*, patterns/core/*
6. Command-triggered: workflows/*, agents/*
7. Session: session/current.md
</loading>

<precedence>
session > project > patterns > domain > core > reference
</precedence>

<commands>
/plan-product, /shape-spec, /write-spec, /create-tasks,
/implement, /verify, /status, /reuse-check, /spec, /metrics
</commands>

---

## Project-Specific Instructions

<!-- Add your project-specific instructions here -->

## Tech Stack

- Profile: ${profile}
- CELLM: v0.11.0

---

**Last Updated:** ${new Date().toISOString().split('T')[0]}
`
}

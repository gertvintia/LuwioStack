#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'
import {
  installedModules,
  resolveModulesToAdd,
  scaffold,
  toWorkspaceDeps,
  usesWorkspaceProtocol,
} from './scaffold'

const HERE = dirname(fileURLToPath(import.meta.url))
const TEMPLATES_DIR = resolve(HERE, '../templates')

// Optional @luwio modules a generated app can pull in (core ones are always included).
// The same catalog powers `luwio create` (bootstrap) and `luwio add`.
const OPTIONAL_MODULES = [
  'config',
  'storage',
  'country',
  'datetime',
  'money',
  'phone',
  'theme',
  'google-maps',
  'google-analytics',
]

const HELP = `luwio — scaffold a Luwio app

Usage:
  luwio create <directory> [options]   Scaffold a new app
  luwio <directory>                    Shorthand for create
  luwio add [modules...] [options]     Add @luwio modules to the app in the current directory

Options:
  -t, --template <name>   Template to scaffold (default: app)
  -m, --modules <list>    @luwio modules to add (comma-separated); skips the prompt
  -w, --workspace         Use workspace:* for @luwio deps (test inside this monorepo)
  -y, --yes               Accept defaults; don't prompt
  -h, --help              Show this help
  -v, --version           Show the version

Optional modules: ${OPTIONAL_MODULES.join(', ')}

Examples:
  luwio create my-app --modules config,storage
  luwio add phone theme
`

async function version(): Promise<string> {
  try {
    const pkg = JSON.parse(await readFile(resolve(HERE, '../package.json'), 'utf8'))
    return String(pkg.version ?? '0.0.0')
  } catch {
    return '0.0.0'
  }
}

async function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    return (await rl.question(question)).trim()
  } finally {
    rl.close()
  }
}

/** Split a comma- (or space-) separated list into trimmed, non-empty tokens. */
function splitList(list: string): string[] {
  return list
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Keep only known optional modules, warning about any unknown names. */
function filterKnown(tokens: string[]): string[] {
  const unknown = tokens.filter((m) => !OPTIONAL_MODULES.includes(m))
  if (unknown.length > 0) {
    process.stderr.write(`Ignoring unknown modules: ${unknown.join(', ')}\n`)
  }
  return tokens.filter((m) => OPTIONAL_MODULES.includes(m))
}

/** Add `@luwio/<module>` deps and (optionally) switch @luwio deps to workspace:* in package.json. */
async function patchPackageJson(
  destDir: string,
  modules: string[],
  workspace: boolean,
): Promise<void> {
  const pkgPath = join(destDir, 'package.json')
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  pkg.dependencies ??= {}
  for (const m of modules) pkg.dependencies[`@luwio/${m}`] = 'latest'
  pkg.dependencies = Object.fromEntries(
    Object.entries(pkg.dependencies).sort(([a], [b]) => a.localeCompare(b)),
  )
  let out = `${JSON.stringify(pkg, null, 2)}\n`
  if (workspace) out = toWorkspaceDeps(out)
  await writeFile(pkgPath, out)
}

interface Flags {
  template: string
  workspace: boolean
  yes: boolean
  /** Raw module tokens from --modules (undefined when the flag was not passed). */
  modules?: string[]
  positionals: string[]
}

function parseArgv(argv: string[]): Flags {
  const positionals: string[] = []
  let template = 'app'
  let workspace = false
  let yes = false
  let modules: string[] | undefined

  const addModules = (raw: string) => {
    modules = [...(modules ?? []), ...splitList(raw)]
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '-t' || arg === '--template') template = argv[++i] ?? template
    else if (arg?.startsWith('--template=')) template = arg.slice('--template='.length)
    else if (arg === '-m' || arg === '--modules') addModules(argv[++i] ?? '')
    else if (arg?.startsWith('--modules=')) addModules(arg.slice('--modules='.length))
    else if (arg === '-w' || arg === '--workspace') workspace = true
    else if (arg === '-y' || arg === '--yes') yes = true
    else if (arg && !arg.startsWith('-')) positionals.push(arg)
  }

  return { template, workspace, yes, modules, positionals }
}

/** `luwio add [modules...]` — add optional modules to the app in the current directory. */
async function addCommand(
  requested: string[],
  requestedProvided: boolean,
  workspaceFlag: boolean,
  interactive: boolean,
): Promise<void> {
  const pkgPath = join(process.cwd(), 'package.json')
  if (!existsSync(pkgPath)) {
    process.stderr.write(
      'No package.json in the current directory. Run `luwio add` from your app, or scaffold one with `luwio create`.\n',
    )
    process.exitCode = 1
    return
  }

  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
  const installed = installedModules(pkg)
  const available = OPTIONAL_MODULES.filter((m) => !installed.has(m))

  if (!requestedProvided) {
    if (!interactive) {
      process.stderr.write('Specify modules to add, e.g. `luwio add config storage`.\n')
      process.exitCode = 1
      return
    }
    if (available.length === 0) {
      process.stdout.write('All optional @luwio modules are already installed — nothing to add.\n')
      return
    }
    process.stdout.write(`\nAvailable @luwio modules: ${available.join(', ')}\n`)
    requested = splitList(await ask('Add which? (comma-separated, blank to cancel) '))
  }

  const { add, already, unknown } = resolveModulesToAdd(requested, OPTIONAL_MODULES, installed)
  if (unknown.length > 0) process.stderr.write(`Ignoring unknown modules: ${unknown.join(', ')}\n`)
  if (already.length > 0) {
    process.stderr.write(`Already installed: ${already.map((m) => `@luwio/${m}`).join(', ')}\n`)
  }
  if (add.length === 0) {
    process.stdout.write('Nothing to add.\n')
    return
  }

  // Match how the app already references @luwio deps (workspace:* inside the monorepo).
  const workspace = workspaceFlag || usesWorkspaceProtocol(pkg)
  await patchPackageJson(process.cwd(), add, workspace)

  const install = workspace ? 'pnpm install   # links workspace:* deps' : 'pnpm install'
  process.stdout.write(
    `\n✓ Added ${add.map((m) => `@luwio/${m}`).join(', ')} to package.json\n\nNext step:\n  ${install}\n\n`,
  )
}

/** `luwio create <dir>` — scaffold a new app. */
async function createCommand(target: string | undefined, flags: Flags): Promise<void> {
  const interactive = Boolean(process.stdin.isTTY) && !flags.yes

  if (!target) {
    if (!interactive) {
      process.stderr.write('A target directory is required (e.g. `luwio create my-app`).\n')
      process.exitCode = 1
      return
    }
    target = (await ask('Project directory: (my-luwio-app) ')) || 'my-luwio-app'
  }

  // Ask which extra modules to include (unless given via --modules or non-interactive).
  let modules: string[]
  if (flags.modules !== undefined) {
    modules = filterKnown(flags.modules)
  } else if (interactive) {
    process.stdout.write(`\nOptional @luwio modules: ${OPTIONAL_MODULES.join(', ')}\n`)
    modules = filterKnown(splitList(await ask('Add which? (comma-separated, blank for none) ')))
  } else {
    modules = []
  }

  const destDir = resolve(process.cwd(), target)
  const appName = target.replace(/^.*[/\\]/, '') || 'my-luwio-app'

  const templateDir = join(TEMPLATES_DIR, flags.template)
  if (!existsSync(templateDir)) {
    process.stderr.write(
      `Unknown template "${flags.template}". Available: ${(await readdir(TEMPLATES_DIR)).join(', ')}\n`,
    )
    process.exitCode = 1
    return
  }
  if (existsSync(destDir) && (await readdir(destDir)).length > 0) {
    process.stderr.write(`Target "${target}" already exists and is not empty.\n`)
    process.exitCode = 1
    return
  }

  await mkdir(destDir, { recursive: true })
  const count = await scaffold(templateDir, destDir, appName)
  await patchPackageJson(destDir, modules, flags.workspace)

  const added = modules.length > 0 ? ` + ${modules.map((m) => `@luwio/${m}`).join(', ')}` : ''
  const install = flags.workspace
    ? 'pnpm install   # from inside this monorepo (workspace:* deps)'
    : 'pnpm install'
  process.stdout.write(
    `\n✓ Scaffolded ${count} files into ${target}/ (${appName})${added}\n\nNext steps:\n  cd ${target}\n  ${install}\n  pnpm dev\n\n`,
  )
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2)
  if (argv.includes('-h') || argv.includes('--help')) {
    process.stdout.write(HELP)
    return
  }
  if (argv.includes('-v') || argv.includes('--version')) {
    process.stdout.write(`${await version()}\n`)
    return
  }

  const flags = parseArgv(argv)
  const [first, ...rest] = flags.positionals
  const interactive = Boolean(process.stdin.isTTY) && !flags.yes

  if (first === 'add') {
    // Modules may come as positionals (`add phone theme`) and/or via --modules.
    const requested = [...rest, ...(flags.modules ?? [])]
    const requestedProvided = rest.length > 0 || flags.modules !== undefined
    await addCommand(requested, requestedProvided, flags.workspace, interactive)
    return
  }

  // `luwio create <dir>` / `luwio new <dir>` / `luwio <dir>`
  const target = first === 'create' || first === 'new' ? rest[0] : first
  await createCommand(target, flags)
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})

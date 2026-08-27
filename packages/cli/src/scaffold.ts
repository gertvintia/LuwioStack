import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const TMPL_SUFFIX = '.tmpl'
const LUWIO_PREFIX = '@luwio/'

/** A package.json's dependency maps (only the fields we read). */
export interface PackageDeps {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

/**
 * Rewrite `@luwio/*` dependency versions from `"latest"` to `"workspace:*"` in a package.json string
 * — so a generated app resolves against this monorepo (for smoke-testing before publishing).
 */
export function toWorkspaceDeps(packageJson: string): string {
  return packageJson.replace(/("@luwio\/[^"]+":\s*)"latest"/g, '$1"workspace:*"')
}

/** Short names (without the `@luwio/` prefix) of every @luwio module already in package.json. */
export function installedModules(pkg: PackageDeps): Set<string> {
  const names = new Set<string>()
  for (const deps of [pkg.dependencies, pkg.devDependencies]) {
    for (const name of Object.keys(deps ?? {})) {
      if (name.startsWith(LUWIO_PREFIX)) names.add(name.slice(LUWIO_PREFIX.length))
    }
  }
  return names
}

/** True if any @luwio dependency already uses the `workspace:*` protocol. */
export function usesWorkspaceProtocol(pkg: PackageDeps): boolean {
  for (const deps of [pkg.dependencies, pkg.devDependencies]) {
    for (const [name, version] of Object.entries(deps ?? {})) {
      if (name.startsWith(LUWIO_PREFIX) && version.startsWith('workspace:')) return true
    }
  }
  return false
}

/** The outcome of matching requested module names against the catalog and what's installed. */
export interface ModuleResolution {
  /** Known catalog modules not yet installed — the ones we'll add. */
  add: string[]
  /** Requested modules that are already present. */
  already: string[]
  /** Requested names not in the catalog. */
  unknown: string[]
}

/**
 * Split requested module names into those to add, those already installed, and unknown ones.
 * Deduplicates while preserving first-seen order; already-installed takes priority over the catalog.
 */
export function resolveModulesToAdd(
  requested: string[],
  catalog: readonly string[],
  installed: Set<string>,
): ModuleResolution {
  const add: string[] = []
  const already: string[] = []
  const unknown: string[] = []
  const seen = new Set<string>()
  for (const name of requested) {
    if (seen.has(name)) continue
    seen.add(name)
    if (installed.has(name)) already.push(name)
    else if (catalog.includes(name)) add.push(name)
    else unknown.push(name)
  }
  return { add, already, unknown }
}

/**
 * Copy a template directory into `destDir`, stripping the `.tmpl` suffix from each file and replacing
 * the `__APP_NAME__` placeholder with `appName`. Returns the number of files written.
 */
export async function scaffold(srcDir: string, destDir: string, appName: string): Promise<number> {
  let count = 0
  for (const entry of await readdir(srcDir, { withFileTypes: true })) {
    const src = join(srcDir, entry.name)
    const outName = entry.name.endsWith(TMPL_SUFFIX)
      ? entry.name.slice(0, -TMPL_SUFFIX.length)
      : entry.name
    const dest = join(destDir, outName)
    if (entry.isDirectory()) {
      await mkdir(dest, { recursive: true })
      count += await scaffold(src, dest, appName)
    } else {
      const content = await readFile(src, 'utf8')
      await mkdir(dirname(dest), { recursive: true })
      await writeFile(dest, content.replaceAll('__APP_NAME__', appName))
      count++
    }
  }
  return count
}

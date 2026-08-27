import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  installedModules,
  resolveModulesToAdd,
  scaffold,
  toWorkspaceDeps,
  usesWorkspaceProtocol,
} from './scaffold'

const appTemplate = resolve(dirname(fileURLToPath(import.meta.url)), '../templates/app')

/** Collect every file path (relative) under a directory. */
async function files(dir: string, base = dir): Promise<string[]> {
  const out: string[] = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...(await files(full, base)))
    else out.push(full.slice(base.length + 1))
  }
  return out
}

describe('scaffold', () => {
  it('copies the app template, strips .tmpl, and fills __APP_NAME__', async () => {
    const dest = await mkdtemp(join(tmpdir(), 'luwio-cli-'))
    try {
      const count = await scaffold(appTemplate, dest, 'acme')
      expect(count).toBeGreaterThan(10)

      // .tmpl stripped everywhere; vertical-slice layout (feature owns its route)
      const written = await files(dest)
      expect(written.some((f) => f.endsWith('.tmpl'))).toBe(false)
      expect(written).toContain(join('src', 'features', 'home', 'home.route.tsx'))
      expect(written).toContain(join('src', 'features', 'home', 'messages.ts'))

      // placeholder replaced
      const pkg = JSON.parse(await readFile(join(dest, 'package.json'), 'utf8'))
      expect(pkg.name).toBe('acme')
      const shell = await readFile(join(dest, 'src', 'app', 'Shell.tsx'), 'utf8')
      expect(shell).toContain('acme')
      expect(shell).not.toContain('__APP_NAME__')

      await expect(stat(join(dest, 'vite.config.ts'))).resolves.toBeDefined()
    } finally {
      await rm(dest, { recursive: true, force: true })
    }
  })
})

describe('toWorkspaceDeps', () => {
  it('rewrites @luwio latest deps to workspace:* and leaves others alone', () => {
    const input = JSON.stringify(
      {
        dependencies: {
          '@luwio/router': 'latest',
          '@luwio/locale': 'latest',
          '@tanstack/react-router': '^1.170.30',
          react: '^19.2.0',
        },
      },
      null,
      2,
    )
    const out = toWorkspaceDeps(input)
    expect(out).toContain('"@luwio/router": "workspace:*"')
    expect(out).toContain('"@luwio/locale": "workspace:*"')
    expect(out).toContain('"@tanstack/react-router": "^1.170.30"')
    expect(out).toContain('"react": "^19.2.0"')
    expect(out).not.toContain('"latest"')
  })
})

describe('installedModules', () => {
  it('collects @luwio module short-names across dependencies and devDependencies', () => {
    const mods = installedModules({
      dependencies: { '@luwio/locale': 'latest', '@luwio/config': 'latest', react: '^19.2.0' },
      devDependencies: { '@luwio/cli': 'workspace:*', vite: '^8.2.1' },
    })
    expect([...mods].sort()).toEqual(['cli', 'config', 'locale'])
  })

  it('returns an empty set when there are no @luwio deps', () => {
    expect(installedModules({ dependencies: { react: '^19.2.0' } }).size).toBe(0)
    expect(installedModules({}).size).toBe(0)
  })
})

describe('usesWorkspaceProtocol', () => {
  it('detects the workspace:* protocol on @luwio deps', () => {
    expect(usesWorkspaceProtocol({ dependencies: { '@luwio/locale': 'workspace:*' } })).toBe(true)
    expect(usesWorkspaceProtocol({ dependencies: { '@luwio/locale': 'latest' } })).toBe(false)
    // A workspace:* on a non-@luwio dep doesn't count.
    expect(usesWorkspaceProtocol({ dependencies: { other: 'workspace:*' } })).toBe(false)
  })
})

describe('resolveModulesToAdd', () => {
  const catalog = ['config', 'storage', 'phone', 'theme']

  it('splits requests into add / already / unknown', () => {
    const result = resolveModulesToAdd(
      ['phone', 'config', 'bogus'],
      catalog,
      new Set(['config', 'locale']),
    )
    expect(result.add).toEqual(['phone'])
    expect(result.already).toEqual(['config'])
    expect(result.unknown).toEqual(['bogus'])
  })

  it('deduplicates while preserving first-seen order', () => {
    const result = resolveModulesToAdd(['theme', 'phone', 'theme'], catalog, new Set())
    expect(result.add).toEqual(['theme', 'phone'])
  })
})

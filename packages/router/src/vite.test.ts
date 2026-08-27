import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer, type Plugin } from 'vite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { luwioRouter } from './vite'

// The plugin hooks are declared as methods; call them directly (they don't use Rollup's `this`).
// biome-ignore lint/suspicious/noExplicitAny: invoking Vite hooks outside a real Rollup context
const call = (hook: unknown, ...args: unknown[]): any =>
  (hook as (...a: unknown[]) => unknown)(...args)

let root = ''

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'luwio-router-'))
  mkdirSync(join(root, 'src/routes/nested'), { recursive: true })
  writeFileSync(join(root, 'src/routes/about.route.tsx'), '')
  writeFileSync(join(root, 'src/routes/nested/blog.route.ts'), '')
  writeFileSync(join(root, 'src/routes/About.tsx'), '') // not a route file
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

function setup(plugin: Plugin) {
  call(plugin.configResolved, { root })
}

describe('luwioRouter (vite plugin)', () => {
  it('resolves and loads the default virtual module with one import per route file', () => {
    const plugin = luwioRouter()
    setup(plugin)

    const resolved = call(plugin.resolveId, 'virtual:@luwio/router/routes')
    expect(resolved).toBe('\0virtual:@luwio/router/routes')

    const code = call(plugin.load, resolved) as string
    expect(code).toContain('import * as m0 from "/src/routes/about.route.tsx"')
    expect(code).toContain('/src/routes/nested/blog.route.ts')
    expect(code).not.toContain('About.tsx') // non-route module is ignored
    expect(code).toContain('registerModules([m0, m1])')
    expect((code.match(/import \* as/g) ?? []).length).toBe(2)
  })

  it('ignores unrelated ids', () => {
    const plugin = luwioRouter()
    setup(plugin)
    expect(call(plugin.resolveId, 'some-other-module')).toBeUndefined()
    expect(call(plugin.load, 'some-other-module')).toBeUndefined()
  })

  it('honours custom routesDir, suffix and virtualId', () => {
    mkdirSync(join(root, 'app/pages'), { recursive: true })
    writeFileSync(join(root, 'app/pages/home.page.tsx'), '')

    const plugin = luwioRouter({
      routesDir: 'app/pages',
      suffix: '.page',
      virtualId: 'virtual:routes',
    })
    setup(plugin)

    expect(call(plugin.resolveId, 'virtual:routes')).toBe('\0virtual:routes')
    const code = call(plugin.load, '\0virtual:routes') as string
    expect(code).toContain('/app/pages/home.page.tsx')
  })

  it('emits a module that registers nothing when the routes dir is missing', () => {
    const plugin = luwioRouter({ routesDir: 'does/not/exist' })
    setup(plugin)
    const code = call(plugin.load, '\0virtual:@luwio/router/routes') as string
    expect(code).toContain('registerModules([])')
    expect(code).not.toContain('import * as')
  })

  // Drives the real Vite resolver end-to-end: the emitted specifiers must resolve, the route files'
  // exports must reach registerModules — with '@luwio/router' aliased to a stub that records ids.
  it('resolves route files and passes their exports to registerModules through real Vite', async () => {
    writeFileSync(
      join(root, 'src/routes/about.route.tsx'),
      "export const route = { id: 'about' }\n",
    )
    writeFileSync(join(root, 'src/routes/nested/blog.route.ts'), "export default { id: 'blog' }\n")
    writeFileSync(
      join(root, 'stub-router.ts'),
      'globalThis.__ids = []\n' +
        'export function registerModules(modules) {\n' +
        '  for (const m of modules) for (const v of Object.values(m)) if (v?.id) globalThis.__ids.push(v.id)\n' +
        '}\n',
    )
    // biome-ignore lint/suspicious/noExplicitAny: test marker on globalThis
    ;(globalThis as any).__ids = []

    const server = await createServer({
      root,
      configFile: false,
      logLevel: 'silent',
      server: { middlewareMode: true, hmr: false },
      resolve: { alias: { '@luwio/router': join(root, 'stub-router.ts') } },
      plugins: [luwioRouter()],
    })
    try {
      await server.ssrLoadModule('virtual:@luwio/router/routes')
    } finally {
      await server.close()
    }

    // biome-ignore lint/suspicious/noExplicitAny: test marker on globalThis
    expect(((globalThis as any).__ids as string[]).sort()).toEqual(['about', 'blog'])
  })
})

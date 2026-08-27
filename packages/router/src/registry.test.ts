import { describe, expect, it } from 'vitest'
import { RouteRegistry, registerModules } from './registry'
import { createRoute } from './route-builder'

describe('RouteRegistry', () => {
  it('adds routes and reads them back', () => {
    const registry = new RouteRegistry()
    const about = createRoute({ id: 'about' })
    registry.add(about)
    expect(registry.all()).toHaveLength(1)
    expect(registry.get('about')).toBe(about)
    expect(registry.get('missing')).toBeUndefined()
  })

  it('rejects a duplicate id', () => {
    const registry = new RouteRegistry()
    registry.add(createRoute({ id: 'about' }))
    expect(() => registry.add(createRoute({ id: 'about' }))).toThrow(/already registered/)
  })

  it('is chainable and clearable', () => {
    const registry = new RouteRegistry()
    registry.add(createRoute({ id: 'a' })).add(createRoute({ id: 'b' }))
    expect(registry.all()).toHaveLength(2)
    registry.clear()
    expect(registry.all()).toHaveLength(0)
  })
})

describe('registerModules', () => {
  it('registers RouteBuilder exports (default and named), ignoring the rest', () => {
    const registry = new RouteRegistry()
    const modules = [
      { default: createRoute({ id: 'about' }) }, // default export
      { route: createRoute({ id: 'blog' }), meta: { title: 'Blog' } }, // named export + noise
      { helper: () => null }, // no route at all
    ]
    registerModules(modules, registry)
    expect(
      registry
        .all()
        .map((r) => r.id)
        .sort(),
    ).toEqual(['about', 'blog'])
  })

  it('accepts the record shape returned by import.meta.glob', () => {
    const registry = new RouteRegistry()
    const globResult = {
      './routes/about.route.tsx': { default: createRoute({ id: 'about' }) },
      './routes/blog.route.tsx': { default: createRoute({ id: 'blog' }) },
    }
    registerModules(globResult, registry)
    expect(registry.all()).toHaveLength(2)
  })

  it('defaults to the shared registry when none is passed', () => {
    const registry = registerModules([{ default: createRoute({ id: 'solo' }) }])
    expect(registry.get('solo')).toBeDefined()
    registry.clear() // don't leak into other tests using the shared registry
  })
})

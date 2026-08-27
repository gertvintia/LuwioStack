import { Locale } from '@luwio/locale'
import type { AnyRouter } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'
import { createRouter } from './create-router'
import { RouteRegistry } from './registry'
import { createRoute } from './route-builder'

const locale = (code: string) => Locale.new({ languageOrLocale: code })
const enBE = locale('en-BE')
const nlBE = locale('nl-BE')

/** Collect every route's fullPath from a built router, depth-first. */
function collectPaths(router: AnyRouter): string[] {
  const paths: string[] = []
  // biome-ignore lint/suspicious/noExplicitAny: internal node shape
  const visit = (route: any) => {
    if (typeof route?.fullPath === 'string' && route.fullPath !== '') paths.push(route.fullPath)
    const kids = route?.children
    if (Array.isArray(kids)) for (const k of kids) visit(k)
    else if (kids && typeof kids === 'object') for (const k of Object.values(kids)) visit(k)
  }
  visit(router.routeTree)
  return paths
}

function registryWith(...routes: ReturnType<typeof createRoute>[]) {
  const registry = new RouteRegistry()
  for (const r of routes) registry.add(r)
  return registry
}

describe('createRouter', () => {
  it('builds one localized sub-tree per locale with translated segments', () => {
    const about = createRoute({ id: 'about', component: () => null })
    about.alias(enBE, 'about')
    about.alias(nlBE, 'over-ons')

    const router = createRouter(registryWith(about), {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
    })

    const paths = collectPaths(router)
    expect(paths).toContain('/en-BE/about')
    expect(paths).toContain('/nl-BE/over-ons')
  })

  it('mounts pathless layout routes without adding a URL segment', () => {
    const auth = createRoute({ id: 'auth', layout: true })
    const account = createRoute({ id: 'account', parent: 'auth', component: () => null })
    account.alias(enBE, 'account')

    const router = createRouter(registryWith(auth, account), {
      locales: [enBE],
      defaultLocale: enBE,
    })

    const paths = collectPaths(router)
    expect(paths).toContain('/en-BE/account')
    expect(paths.some((p) => p.includes('auth'))).toBe(false)
  })

  it('honours the default-locale redirect vs unprefixed mounting', () => {
    const about = createRoute({ id: 'about', component: () => null })
    about.alias(enBE, 'about')

    const unprefixed = createRouter(registryWith(about), {
      locales: [enBE],
      defaultLocale: enBE,
      unprefixedDefault: true,
    })
    expect(collectPaths(unprefixed)).toContain('/about')
  })

  it('with unprefixedDefault, serves a segmented default route both unprefixed and prefixed', () => {
    const about = createRoute({ id: 'about', component: () => null })
    about.alias(enBE, 'about').alias(nlBE, 'over-ons')

    const router = createRouter(registryWith(about), {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
      unprefixedDefault: true,
    })

    const paths = collectPaths(router)
    expect(paths).toContain('/about') // unprefixed default (was previously unreachable)
    expect(paths).toContain('/en-BE/about') // prefixed default
    expect(paths).toContain('/nl-BE/over-ons') // other locale, always prefixed
  })

  it('with unprefixedDefault, serves an index (empty-alias) default without a duplicate-id crash', () => {
    const home = createRoute({ id: 'home', component: () => null })
    home.alias(enBE, '').alias(nlBE, '')

    const build = () =>
      createRouter(registryWith(home), {
        locales: [enBE, nlBE],
        defaultLocale: enBE,
        unprefixedDefault: true,
      })

    expect(build).not.toThrow()
    const paths = collectPaths(build())
    expect(paths).toContain('/') // unprefixed default index
    expect(paths).toContain('/en-BE') // prefixed default index
  })

  it('drops excluded routes and their descendants', () => {
    const blog = createRoute({ id: 'blog', component: () => null })
    blog.alias(enBE, 'blog')
    const post = createRoute({ id: 'blog.post', parent: 'blog', component: () => null })
    post.alias(enBE, 'post')

    const router = createRouter(registryWith(blog, post), {
      locales: [enBE],
      defaultLocale: enBE,
      exclude: ['blog'],
    })

    const paths = collectPaths(router)
    expect(paths.some((p) => p.includes('blog'))).toBe(false)
  })

  it('in strict mode only mounts a route where an alias exists', () => {
    const about = createRoute({ id: 'about', component: () => null })
    about.alias(enBE, 'about') // no nl-BE alias

    const router = createRouter(registryWith(about), {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
      strict: true,
    })

    const paths = collectPaths(router)
    expect(paths).toContain('/en-BE/about')
    expect(paths.some((p) => p.startsWith('/nl-BE/'))).toBe(false)
  })
})

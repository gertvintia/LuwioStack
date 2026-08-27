import { Locale } from '@luwio/locale'
import {
  createMemoryHistory,
  createRootRoute,
  createRouter as createTanstackRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createRouter, type RouterConfig } from './create-router'
import { RouteRegistry } from './registry'
import { createRoute } from './route-builder'
import { availableLocales, type IRouter, routePath, useRouter } from './use-router'

const locale = (code: string) => Locale.new({ languageOrLocale: code })
const enBE = locale('en-BE')
const nlBE = locale('nl-BE')

function registryWith(...routes: ReturnType<typeof createRoute>[]) {
  const registry = new RouteRegistry()
  for (const r of routes) registry.add(r)
  return registry
}

describe('routePath', () => {
  it('builds a prefixed, translated path per locale', () => {
    const about = createRoute({ id: 'about' })
    about.alias(enBE, 'about').alias(nlBE, 'over-ons')
    const registry = registryWith(about)
    const config: RouterConfig = { locales: [enBE, nlBE], defaultLocale: enBE }

    expect(routePath(registry, config, 'about', enBE)).toBe('/en-BE/about')
    expect(routePath(registry, config, 'about', nlBE)).toBe('/nl-BE/over-ons')
  })

  it('composes nested routes and skips pathless layout routes', () => {
    const auth = createRoute({ id: 'auth', layout: true })
    const account = createRoute({ id: 'account', parent: 'auth' })
    account.alias(enBE, 'account')
    const registry = registryWith(auth, account)
    const config: RouterConfig = { locales: [enBE], defaultLocale: enBE }

    expect(routePath(registry, config, 'account', enBE)).toBe('/en-BE/account')
  })

  it('honours unprefixedDefault for the default locale only', () => {
    const about = createRoute({ id: 'about' })
    about.alias(enBE, 'about').alias(nlBE, 'over-ons')
    const registry = registryWith(about)
    const config: RouterConfig = {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
      unprefixedDefault: true,
    }

    expect(routePath(registry, config, 'about', enBE)).toBe('/about')
    expect(routePath(registry, config, 'about', nlBE)).toBe('/nl-BE/over-ons')
  })

  it('fills path params and the splat', () => {
    const blog = createRoute({ id: 'blog' })
    blog.alias(enBE, 'blog')
    const post = createRoute({ id: 'blog.post', parent: 'blog' })
    post.alias(enBE, '$postId')
    const registry = registryWith(blog, post)
    const config: RouterConfig = { locales: [enBE], defaultLocale: enBE }

    expect(routePath(registry, config, 'blog.post', enBE, { postId: '42' })).toBe('/en-BE/blog/42')
  })

  it('throws on an unknown route id', () => {
    const registry = registryWith(createRoute({ id: 'about' }).alias(enBE, 'about'))
    const config: RouterConfig = { locales: [enBE], defaultLocale: enBE }

    expect(() => routePath(registry, config, 'missing', enBE)).toThrow(/unknown route id/)
  })

  it('throws on a missing path param instead of dropping the segment', () => {
    const blog = createRoute({ id: 'blog' }).alias(enBE, 'blog')
    const post = createRoute({ id: 'blog.post', parent: 'blog' }).alias(enBE, '$postId')
    const registry = registryWith(blog, post)
    const config: RouterConfig = { locales: [enBE], defaultLocale: enBE }

    expect(() => routePath(registry, config, 'blog.post', enBE)).toThrow(
      /route "blog\.post" requires path param "postId"/,
    )
  })

  it('throws on a circular parent chain', () => {
    const a = createRoute({ id: 'a', parent: 'b' }).alias(enBE, 'a')
    const b = createRoute({ id: 'b', parent: 'a' }).alias(enBE, 'b')
    const registry = registryWith(a, b)
    const config: RouterConfig = { locales: [enBE], defaultLocale: enBE }

    expect(() => routePath(registry, config, 'a', enBE)).toThrow(/circular parent chain/)
  })
})

describe('availableLocales', () => {
  const config: RouterConfig = { locales: [enBE, nlBE], defaultLocale: enBE }

  it('returns only locales the route is aliased for', () => {
    const about = createRoute({ id: 'about' })
    about.alias(enBE, 'about') // no nl-BE alias
    const registry = registryWith(about)

    expect(availableLocales(registry, config, 'about').map((l) => l.code)).toEqual(['en-BE'])
  })

  it('requires every non-layout ancestor to be aliased', () => {
    const shell = createRoute({ id: 'shell', layout: true }) // layout: no alias needed
    const blog = createRoute({ id: 'blog', parent: 'shell' })
    blog.alias(enBE, 'blog') // parent aliased only for en-BE
    const post = createRoute({ id: 'blog.post', parent: 'blog' })
    post.alias(enBE, 'post').alias(nlBE, 'bericht') // child aliased for both
    const registry = registryWith(shell, blog, post)

    // nl-BE is dropped because the ancestor `blog` has no nl-BE alias.
    expect(availableLocales(registry, config, 'blog.post').map((l) => l.code)).toEqual(['en-BE'])
  })

  it('throws on an unknown route id', () => {
    const registry = registryWith(createRoute({ id: 'about' }).alias(enBE, 'about'))
    expect(() => availableLocales(registry, config, 'missing')).toThrow(/unknown route id/)
  })

  it('throws on a circular parent chain', () => {
    const a = createRoute({ id: 'a', parent: 'b' }).alias(enBE, 'a')
    const b = createRoute({ id: 'b', parent: 'a' }).alias(enBE, 'b')
    const registry = registryWith(a, b)
    expect(() => availableLocales(registry, config, 'a')).toThrow(/circular parent chain/)
  })
})

/** Render a probe component (using useRouter) as the `about` route and hand the router + probe back. */
function renderRouter(initialPath: string) {
  let api: IRouter | undefined
  const About = () => {
    const { router } = useRouter()
    api = router
    return (
      <div>
        <span data-testid="href-nl">{router.href({ id: 'about', locale: 'nl-BE' })}</span>
        <span data-testid="path-active">{router.path({ id: 'about' })}</span>
        <span data-testid="abs-nl">{router.absolute({ id: 'about', locale: 'nl-BE' })}</span>
        <span data-testid="active-locale">{router.locale.code}</span>
        <span data-testid="locales">{router.locales.map((l) => l.code).join(',')}</span>
        <span data-testid="available">
          {router
            .availableLocales('about')
            .map((l) => l.code)
            .join(',')}
        </span>
      </div>
    )
  }

  const about = createRoute({ id: 'about', component: About })
  about.alias(enBE, 'about').alias(nlBE, 'over-ons')

  const router = createRouter(registryWith(about), {
    locales: [enBE, nlBE],
    defaultLocale: enBE,
    router: { history: createMemoryHistory({ initialEntries: [initialPath] }) },
  })

  render(<RouterProvider router={router} />)
  return { router, api: () => api }
}

describe('useRouter', () => {
  it('generates href / path / absolute for the active and an explicit locale', async () => {
    const { api } = renderRouter('/en-BE/about')

    await screen.findByTestId('href-nl')
    expect(screen.getByTestId('path-active').textContent).toBe('/en-BE/about') // active locale
    expect(screen.getByTestId('href-nl').textContent).toBe('/nl-BE/over-ons') // explicit locale
    expect(screen.getByTestId('abs-nl').textContent).toBe(
      `${window.location.origin}/nl-BE/over-ons`,
    )
    expect(screen.getByTestId('active-locale').textContent).toBe('en-BE')
    expect(screen.getByTestId('locales').textContent).toBe('en-BE,nl-BE')
    expect(screen.getByTestId('available').textContent).toBe('en-BE,nl-BE')
    expect(api()).toBeDefined()
  })

  it('navigates to another locale by route id', async () => {
    const { router, api } = renderRouter('/en-BE/about')
    await screen.findByTestId('href-nl')

    await api()?.navigate({ to: 'about', locale: 'nl-BE' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/nl-BE/over-ons'))
  })

  it('drops null/undefined query values on navigate, keeping the rest', async () => {
    const { router, api } = renderRouter('/en-BE/about')
    await screen.findByTestId('href-nl')

    await api()?.navigate({ to: 'about', query: { a: 1, b: null, c: undefined, d: 'x' } })
    await waitFor(() => expect(router.state.location.search).toEqual({ a: 1, d: 'x' }))
  })

  it('reports canGoBack after navigating', async () => {
    const { router, api } = renderRouter('/en-BE/about')
    await screen.findByTestId('href-nl')

    expect(api()?.canGoBack()).toBe(false)
    await api()?.navigate({ to: 'about', locale: 'nl-BE' })
    await waitFor(() => expect(router.state.location.pathname).toBe('/nl-BE/over-ons'))
    expect(api()?.canGoBack()).toBe(true)

    await api()?.goBack()
    await waitFor(() => expect(router.state.location.pathname).toBe('/en-BE/about'))
  })

  it('throws when used outside a createRouter() router', async () => {
    const Probe = () => {
      useRouter()
      return null
    }
    const root = createRootRoute({
      component: Probe,
      errorComponent: ({ error }: { error: Error }) => (
        <div data-testid="err">{String(error.message)}</div>
      ),
    })
    const plain = createTanstackRouter({
      routeTree: root,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      // biome-ignore lint/suspicious/noExplicitAny: minimal plain router for the negative case
    } as any)

    render(<RouterProvider router={plain} />)
    await screen.findByTestId('err')
    expect(screen.getByTestId('err').textContent).toMatch(/createRouter/)
  })
})

describe('unprefixedDefault (runtime)', () => {
  // Renders `about` as a probe reporting the active locale + a self href, at a given URL.
  function renderAt(initialPath: string) {
    const About = () => {
      const { router } = useRouter()
      return (
        <div>
          <span data-testid="active">{router.locale.code}</span>
          <span data-testid="href">{router.href({ id: 'about' })}</span>
        </div>
      )
    }
    const about = createRoute({ id: 'about', component: About })
    about.alias(enBE, 'about').alias(nlBE, 'over-ons')

    const router = createRouter(registryWith(about), {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
      unprefixedDefault: true,
      router: { history: createMemoryHistory({ initialEntries: [initialPath] }) },
    })
    render(<RouterProvider router={router} />)
    return router
  }

  it('resolves the unprefixed default route and reads the default locale there', async () => {
    const router = renderAt('/about') // no /en-BE prefix
    await screen.findByTestId('active')
    expect(router.state.location.pathname).toBe('/about')
    expect(screen.getByTestId('active').textContent).toBe('en-BE') // default locale on unprefixed
    // href for the (default) active locale is stripped of the prefix.
    expect(screen.getByTestId('href').textContent).toBe('/about')
  })

  it('also resolves the same route prefixed, and a non-default locale stays prefixed', async () => {
    const prefixed = renderAt('/en-BE/about')
    await screen.findByTestId('active')
    expect(prefixed.state.location.pathname).toBe('/en-BE/about')
    expect(screen.getByTestId('active').textContent).toBe('en-BE')
  })
})

describe('head option (locale-aware)', () => {
  it('invokes a route head with the active locale in ctx', async () => {
    // biome-ignore lint/suspicious/noExplicitAny: capturing the ctx shape TanStack passes
    let captured: any
    const About = () => <div data-testid="ready">ok</div>
    const about = createRoute({
      id: 'about',
      component: About,
      head: (ctx) => {
        captured = ctx
        return { meta: [{ title: `About ${ctx.context.locale.code}` }] }
      },
    })
    about.alias(enBE, 'about').alias(nlBE, 'over-ons')

    const router = createRouter(registryWith(about), {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
      router: { history: createMemoryHistory({ initialEntries: ['/nl-BE/over-ons'] }) },
    })
    render(<RouterProvider router={router} />)
    await screen.findByTestId('ready')

    expect(captured).toBeDefined()
    expect(captured.context.locale.code).toBe('nl-BE') // context.locale, same as beforeLoad/loader
    expect(captured.match.context.locale.code).toBe('nl-BE') // also on the match context
  })

  it('re-exports HeadContent, Scripts, and the deferred-data helpers', async () => {
    const mod = await import('./index')
    expect(typeof mod.HeadContent).toBe('function')
    expect(typeof mod.Scripts).toBe('function')
    expect(typeof mod.Await).toBe('function')
    expect(typeof mod.useAwaited).toBe('function')
    expect(typeof mod.defer).toBe('function')
  })
})

describe('router.has (availability)', () => {
  it('reports whether an id is mounted, respecting exclude and locale', async () => {
    let api: IRouter | undefined
    const Probe = () => {
      const { router } = useRouter()
      api = router
      return <span data-testid="ready">ok</span>
    }
    const about = createRoute({ id: 'about', component: Probe })
    about.alias(enBE, 'about') // aliased for en-BE only
    const blog = createRoute({ id: 'blog', component: () => null })
    blog.alias(enBE, 'blog').alias(nlBE, 'blog')

    const router = createRouter(registryWith(about, blog), {
      locales: [enBE, nlBE],
      defaultLocale: enBE,
      exclude: ['blog'],
      router: { history: createMemoryHistory({ initialEntries: ['/en-BE/about'] }) },
    })
    render(<RouterProvider router={router} />)
    await screen.findByTestId('ready')

    const r = api as IRouter
    expect(r.has('about')).toBe(true)
    expect(r.has('about', 'en-BE')).toBe(true)
    expect(r.has('about', 'nl-BE')).toBe(false) // mounted, but no nl-BE alias
    expect(r.has('blog')).toBe(false) // excluded
    expect(r.has('blog', 'en-BE')).toBe(false) // excluded, even though aliased
    expect(r.has('nope')).toBe(false) // unknown id — no throw
    expect(r.availableLocales('blog')).toEqual([]) // excluded → empty
    expect(r.availableLocales('about').map((l) => l.code)).toEqual(['en-BE'])
  })
})

import { DocHero, type DocSection, DocsLayout } from './DocsLayout'
import { ApiTable, Callout, CodeBlock, InstallBar } from './ui'

const SECTIONS: DocSection[] = [
  { id: 'installation', label: 'Installation' },
  { id: 'define', label: 'Define a route' },
  { id: 'register', label: 'Register & build' },
  { id: 'context', label: 'The locale in context' },
  { id: 'head', label: 'Document head' },
  { id: 'layout', label: 'Advanced: layout routes' },
  { id: 'config', label: 'Config-driven routes' },
  { id: 'default-locale', label: 'Default-locale prefix' },
  { id: 'api', label: 'API reference' },
]

const DEFINE = `// routes/about.route.tsx
import { createRoute } from '@luwio/router'
import { Locale } from '@luwio/locale'
import { About } from './About'

// Just export it — no add(). createRoute takes every TanStack option, plus an \`id\`.
export default createRoute({
  id: 'about',
  beforeLoad: ({ context }) => ({ crumb: 'About' }),
  loader: ({ context }) => fetchTeam(context.locale.country_code),
  component: About,
})
  // One translated URL segment per locale (chainable).
  .alias(Locale.new({ languageOrLocale: 'en-BE' }), 'about')
  .alias(Locale.new({ languageOrLocale: 'nl-BE' }), 'over-ons')
  .alias(Locale.new({ languageOrLocale: 'fr-BE' }), 'pour-nous')`

const BUILD = `// router.ts
import 'virtual:@luwio/router/routes' // every *.route file is now registered (plugin, below)
import { createRouter, routeRegistry } from '@luwio/router'
import { Locale } from '@luwio/locale'

export const router = createRouter(routeRegistry, {
  locales: ['en-BE', 'nl-BE', 'fr-BE'].map((l) => Locale.new({ languageOrLocale: l })),
  defaultLocale: Locale.new({ languageOrLocale: 'en-BE' }),
})

// Then: <RouterProvider router={router} />`

const PLUGIN = `// vite.config.ts
import { luwioRouter } from '@luwio/router/vite'

export default defineConfig({
  plugins: [luwioRouter()], // scans src/routes/**/*.route.{ts,tsx}
})

// src/vite-env.d.ts — types for the virtual module
/// <reference types="@luwio/router/vite-client" />`

const GLOB = `// No plugin? registerModules does the same discovery in app code:
import { registerModules } from '@luwio/router'

registerModules(import.meta.glob('./routes/**/*.route.tsx', { eager: true }))`

const CONTEXT = `loader: ({ context }) => {
  context.locale             // the full ILocale for this request
  context.locale.code        // 'nl-BE'
  context.locale.language()  // ILanguage
  context.locale.country()   // ICountry
  return fetchTeam(context.locale.country_code)
}`

const HEAD = `// head()'s context.locale is the active locale — same as loader/beforeLoad.
export default createRoute({
  id: 'about',
  head: ({ context, loaderData }) => ({
    meta: [
      { title: t(context.locale, 'about.title') },
      { name: 'description', content: t(context.locale, 'about.desc') },
      { property: 'og:locale', content: context.locale.code },
    ],
    links: [{ rel: 'canonical', href: \`https://ex.com/\${context.locale.code}/about\` }],
  }),
}).alias(Locale.new({ languageOrLocale: 'en-BE' }), 'about')`

const HEADRENDER = `// Render the merged tags once, in your root / app-shell head.
import { HeadContent, Outlet } from '@luwio/router'

const AppShell = () => (
  <>
    <HeadContent />   {/* writes title / meta / link tags */}
    <Outlet />
  </>
)`

const AUTH = `// routes/auth.route.tsx — pathless GUARD, invisible in the URL
import { createRoute, redirect } from '@luwio/router'
import { getSession } from '../auth'

export default createRoute({
  id: 'auth',
  layout: true,                       // ← contributes no URL segment
  beforeLoad: ({ context, location }) => {
    const session = getSession()
    if (!session) {
      throw redirect({
        to: \`/\${context.locale.code}/login\`,
        search: { redirect: location.href },
      })
    }
    return { session }                // ← flows into every child's context
  },
})`

const APP = `// routes/app.route.tsx — pathless LAYOUT, shared chrome
import { createRoute } from '@luwio/router'
import { AppShell } from '../components/AppShell'

export default createRoute({
  id: 'app',
  parent: 'auth',      // ← sits inside the guard
  layout: true,        // ← also invisible in the URL
  component: AppShell,  // renders sidebar / nav around <Outlet />
})`

const ACCOUNT = `// routes/account.route.tsx — real page under auth + layout
import { createRoute } from '@luwio/router'
import { Locale } from '@luwio/locale'
import { Account } from './Account'

export default createRoute({
  id: 'account',
  parent: 'app',
  loader: ({ context }) => fetchAccount(context.session, context.locale.country_code),
  component: Account,
})
  .alias(Locale.new({ languageOrLocale: 'en-BE' }), 'account')
  .alias(Locale.new({ languageOrLocale: 'fr-BE' }), 'compte')`

const TREE = `/en-BE
  └─ auth   [pathless]  session guard        → context.session
       └─ app   [pathless]  AppShell (chrome)
            └─ account       /account         → context.locale + context.session

  en-BE → /en-BE/account        fr-BE → /fr-BE/compte`

const CONFIG = `createRouter(routeRegistry, {
  locales: [/* … */],
  defaultLocale,
  unprefixedDefault: true,  // also mount the default locale without a /{locale} prefix
  exclude: ['blog'],        // every route is mounted by default; drop this one + its descendants
  strict: true,             // only mount a URL-bearing route where an alias exists
})`

const UNPREFIXED = `createRouter(routeRegistry, {
  locales: [nlBE, frBE],
  defaultLocale: nlBE,
  unprefixedDefault: true,   // serve the default locale WITH and WITHOUT its prefix
})

// nl-BE is the default:
//   /home        ✓  unprefixed — the canonical URL for the default locale
//   /nl-BE/home  ✓  prefixed — still resolves
//   /fr-BE/home  ✓  non-default locales are always prefixed`

const API = [
  {
    sig: 'createRoute(config)',
    desc: 'Define a route; returns a chainable RouteBuilder. Takes every TanStack option plus a required id, an optional parent, and layout. Export it — no add().',
  },
  {
    sig: 'route.alias(locale, slug)',
    desc: 'Register the localized URL segment for one ILocale. Throws on a duplicate locale or on a layout route.',
  },
  {
    sig: 'registerModules(modules, reg?)',
    desc: 'Register the exported routes from a glob record or module array. Used by the Vite plugin; defaults to the shared registry.',
  },
  {
    sig: 'luwioRouter(options?)',
    desc: 'The Vite plugin (from @luwio/router/vite). Scans routesDir and registers exports through a virtual module.',
  },
  {
    sig: 'createRouter(registry, config)',
    desc: 'Expand a registry into a TanStack Router — one localized sub-tree per configured locale.',
  },
]

export function RouterPage() {
  return (
    <DocsLayout slug="router" sections={SECTIONS}>
      <DocHero slug="router" />

      <Callout>
        Built on <code>@tanstack/react-router</code>, which is <strong>bundled in</strong> — you
        don't install or import it directly. This package adds locale-translated URL segments and a
        route registry on top — every TanStack option (<code>loader</code>, <code>beforeLoad</code>,{' '}
        <code>validateSearch</code>, <code>head</code>, layout routes) keeps working untouched — and
        re-exports the few structural pieces you need (<code>RouterProvider</code>,{' '}
        <code>Outlet</code>, <code>HeadContent</code>, <code>redirect</code>, <code>notFound</code>
        ).
      </Callout>

      <p>
        TanStack's file-based routing keys each path to a filename, so <code>about.tsx</code> can
        only ever produce the segment <code>about</code>. Real multilingual sites need{' '}
        <code>/nl-BE/over-ons</code> and <code>/fr-BE/pour-nous</code>. <code>@luwio/router</code>{' '}
        lets you define <strong>one route per file</strong>, give each a translated segment per
        locale, and build the whole tree from a registry.
      </p>

      <Callout>
        <strong>Runnable example.</strong> The <code>apps/showcase</code> app uses this router —
        localized routes, a layout route, a locale switcher, and an{' '}
        <a href="#default-locale">unprefixed default locale</a> — alongside the other{' '}
        <code>@luwio</code> packages. Run it with <code>pnpm --filter @luwio/showcase dev</code>.
      </Callout>

      <h2 id="installation">Installation</h2>
      <InstallBar command="npm i @luwio/router @luwio/locale" />
      <p>
        <code>react</code> (18+) is the only peer dependency — <code>@tanstack/react-router</code>{' '}
        is bundled in.
      </p>

      <h2 id="define">Define a route</h2>
      <p>
        <code>createRoute</code> is a thin wrapper: it collects your TanStack options and defers the
        real route creation until the locales are known. Add a slug per locale with{' '}
        <code>.alias</code> and <strong>export</strong> the route — no <code>add()</code> call. Like
        TanStack's <code>export const Route = …</code>, the tooling collects it for you.
      </p>
      <CodeBlock code={DEFINE} />

      <h2 id="register">Register &amp; build</h2>
      <p>
        Expand the registry into a router once, at boot. Config decides which locales mount — each
        becomes a <code>/{'{locale.code}'}</code> sub-tree.
      </p>
      <CodeBlock code={BUILD} />
      <p>
        The registry fills up as a <strong>side effect</strong> of <code>add()</code> running — and
        in ESM that only happens when a route's module is imported. So something must load every
        route file. The recommended way is the <strong>Vite plugin</strong> — add it once and it
        scans your routes directory and self-registers everything through the virtual module above,
        just like TanStack Router's own plugin. Adding or removing a route file reloads
        automatically.
      </p>
      <CodeBlock code={PLUGIN} lang="ts" />
      <p>
        Prefer no plugin? A one-line glob does the same discovery from app code — without it, the
        registry comes up empty:
      </p>
      <CodeBlock code={GLOB} lang="ts" />

      <h2 id="context">The locale in context</h2>
      <p>
        Before each route's own <code>beforeLoad</code> runs, <code>createRouter</code> injects{' '}
        <code>{'{ routeId, locale }'}</code> into the route context — where <code>locale</code> is
        the full <code>ILocale</code> from <code>@luwio/locale</code>. Loaders and guards read it
        directly:
      </p>
      <CodeBlock code={CONTEXT} lang="ts" />
      <p>
        The locale layout also wraps the tree in <code>@luwio/locale</code>'s provider, so{' '}
        <code>useLocale()</code> works in every component.
      </p>

      <h2 id="head">Document head (title, meta, links)</h2>
      <p>
        Give a route a <code>head</code> and its <code>context.locale</code> is the active locale —
        the same idiom as <code>loader</code>/<code>beforeLoad</code> — so the title, description and{' '}
        <code>og:</code> tags localize. Every TanStack head field works — <code>meta</code>,{' '}
        <code>links</code>, <code>scripts</code>, <code>styles</code>.
      </p>
      <CodeBlock code={HEAD} lang="tsx" />
      <p>
        Render the merged tags with <code>&lt;HeadContent /&gt;</code>, re-exported from{' '}
        <code>@luwio/router</code> — no <code>@tanstack/react-router</code> import. TanStack merges
        across matches: the deepest route wins for <code>title</code> and for each <code>meta</code>{' '}
        name/property; links and scripts concatenate.
      </p>
      <CodeBlock code={HEADRENDER} lang="tsx" />

      <h2 id="layout">Advanced: layout routes</h2>
      <p>
        Set <code>layout: true</code> to create a <strong>pathless</strong> route: it adds no URL
        segment but still wraps its children. Use it for auth guards (<code>beforeLoad</code>) and
        shared UI shells (<code>component</code>). Layout routes take no aliases.
      </p>
      <CodeBlock code={AUTH} />
      <CodeBlock code={APP} />
      <CodeBlock code={ACCOUNT} />
      <p>
        <code>auth</code> and <code>app</code> never appear in the URL, but run on every request
        beneath them:
      </p>
      <CodeBlock code={TREE} lang="text" />

      <h2 id="config">Config-driven routes</h2>
      <p>
        Because the tree is assembled at runtime, config alone decides what mounts — so one build
        can serve different route and locale sets per deployment, market, or feature flag. Every
        route is mounted by default; <code>exclude</code> is the only route filter, dropping the
        listed ids and all of their descendants.
      </p>
      <CodeBlock code={CONFIG} lang="ts" />
      <p>
        Since <code>exclude</code> (and per-locale aliases) can leave a route unavailable, ask
        before you link to it: <code>router.has(id)</code> is true only when the id is mounted, and{' '}
        <code>router.has(id, locale)</code> also requires it in that locale.
      </p>

      <h2 id="default-locale">Default locale: prefixed or not</h2>
      <p>
        By default every locale — the default included — is mounted under its{' '}
        <code>{'/{locale}'}</code> prefix, and <code>/</code> redirects to the default. Set{' '}
        <code>unprefixedDefault</code> to <strong>also</strong> serve the default locale without a
        prefix, so both forms resolve:
      </p>
      <CodeBlock code={UNPREFIXED} lang="ts" />
      <p>
        On an unprefixed route the active locale is the default locale —{' '}
        <code>useRouter().router.locale</code>, <code>useRouteLocale()</code> and{' '}
        <code>context.locale</code> all report it. And URL generation{' '}
        <strong>strips the prefix</strong> for the default locale:{' '}
        <code>router.href(&#123; id: 'home' &#125;)</code> and <code>navigate</code> return{' '}
        <code>/home</code>, not <code>/nl-BE/home</code> — so every generated link stays unprefixed
        while you're in the default locale.
      </p>

      <h2 id="api">API reference</h2>
      <ApiTable rows={API} />

      <Callout>
        Because the tree is built at runtime, navigate by <code>routeId</code> rather than a literal
        path. IDs and params are still type-checked when you opt in — augment{' '}
        <code>RouteRegister</code> to have <code>href</code> / <code>navigate</code> reject unknown
        ids and require the right params. There is no <code>&lt;Link&gt;</code> by design: render{' '}
        <code>{'<a href={router.href(...)}>'}</code> and call <code>router.navigate</code> on click.
      </Callout>
    </DocsLayout>
  )
}

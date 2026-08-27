import { type ConfigFetcher, createConfigLoader, sessionStorageCache } from '@luwio/bootstrap'
import { type ILocale, Locale } from '@luwio/locale'

/** The JSON the config API sends over the wire — locale *codes*. */
interface LocaleConfigBody {
  locales: string[]
  defaultLocale: string
}

/** What the app consumes — codes hydrated into `ILocale`. */
export interface LocaleConfig {
  locales: ILocale[]
  defaultLocale: ILocale
}

// ---------------------------------------------------------------------------------------------
// The "backend" — a stand-in for `GET /api/config`.
//
// In production this is one line: `fetch: httpConfig('/api/config')` (a real ETag-aware conditional
// GET from @luwio/bootstrap). Here we hand-roll the same contract so the caching behaviour is
// visible in dev without a server: a matching version resolves `unchanged` (a 304 — reuse the
// cache), anything else is `fresh` (a 200). The 400ms is fake network latency.
// ---------------------------------------------------------------------------------------------

let versionSeq = 1

// What the server currently has published. `__publishConfig()` (below, dev-only) bumps this.
let published = {
  version: `cfg_v${versionSeq}`,
  locales: ['en-IE', 'nl-NL', 'fr-FR'],
  defaultLocale: 'nl-NL',
}

const mockFetch: ConfigFetcher<LocaleConfigBody> = (version) =>
  new Promise((resolve) => {
    setTimeout(() => {
      if (version === published.version) {
        resolve({ status: 'unchanged', version: published.version })
      } else {
        resolve({
          status: 'fresh',
          version: published.version,
          data: { locales: published.locales, defaultLocale: published.defaultLocale },
        })
      }
    }, 400)
  })

// The raw body is JSON-serializable (it's what gets cached); hydration to Locale objects happens on
// read via the loader's `map`, so non-serializable class instances never hit sessionStorage.
function hydrate(body: LocaleConfigBody): LocaleConfig {
  return {
    locales: body.locales.map((code) => Locale.new({ languageOrLocale: code })),
    defaultLocale: Locale.new({ languageOrLocale: body.defaultLocale }),
  }
}

/**
 * The runtime locale config. `load()` at boot (see `main.tsx`); the reload nudge watches it via
 * `useConfigUpdate` (see `ConfigUpdateBanner`). Cached in sessionStorage keyed by ETag, so a browser
 * refresh is a cheap `304` when nothing changed and picks up a real publish immediately.
 */
export const localeConfig = createConfigLoader<LocaleConfigBody, LocaleConfig>({
  fetch: mockFetch,
  cache: sessionStorageCache('luwio:showcase:localeConfig'),
  map: hydrate,
  debug: true,
})

// ---------------------------------------------------------------------------------------------
// Dev affordance — "publish" a config change from the console to watch the client react:
//
//   __publishConfig(['en-IE', 'de-DE'], 'de-DE')
//
// Then either refresh (boot re-fetches and mounts the new set) or wait for the focus/interval
// revalidation to surface the reload nudge. Stripped from production builds.
// ---------------------------------------------------------------------------------------------
if (import.meta.env.DEV) {
  const publishLocaleConfig = (locales: string[], defaultLocale?: string) => {
    versionSeq += 1
    const resolved = defaultLocale ?? locales[0] ?? published.defaultLocale
    published = { version: `cfg_v${versionSeq}`, locales, defaultLocale: resolved }
    console.info(`[config] published ${published.version}:`, locales, `default=${resolved}`)
  }
  ;(window as unknown as { __publishConfig: typeof publishLocaleConfig }).__publishConfig =
    publishLocaleConfig
}

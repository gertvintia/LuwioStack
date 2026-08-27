import { type I18n, type Messages, setupI18n } from '@lingui/core'
import { type ILanguage, Language } from '@luwio/language'

export type { Messages }

/**
 * A single typed translation token: a stable message `key` plus its default source text. Define a
 * map of these once, then reference `tokens.help.key` as a type-safe message id — or pass the whole
 * token to {@link ITranslations.t} to use `defaultValue` as the fallback when the active catalog has
 * no entry for it.
 *
 * ```ts
 * export const tokens = {
 *   help: { key: 'help', defaultValue: 'Help' },
 *   home: { key: 'home', defaultValue: 'Home' },
 * }
 * translations.t(tokens.help.key) // 'Help' — or the loaded translation
 * ```
 */
export interface Token {
  key: string
  defaultValue: string
}

/** A map of typed {@link Token}s — the local id registry / source defaults. */
export type Tokens = Record<string, Token>

/**
 * A language's catalog, in either shape:
 *
 * - a flat Lingui {@link Messages} map — `{ help: 'Help' }` — as an API returns it, and
 * - a {@link Tokens} map — `{ help: { key: 'help', defaultValue: 'Help' } }` — as you define your
 *   local source defaults; transformed to messages internally.
 */
export type Catalog = Messages | Tokens

/**
 * Where a language's catalog comes from — passed to {@link ITranslations.add}. A {@link Catalog}
 * (flat messages or a tokens map), delivered any way:
 *
 * - a catalog directly — `{ greeting: 'Hallo' }` or a `tokens` object
 * - a dynamic import — `() => import('./locales/nl').then((m) => m.messages)`
 * - an API call — `() => fetch('/api/i18n/nl').then((r) => r.json())`
 * - a promise — `import('./locales/nl').then((m) => m.messages)`
 */
export type CatalogSource = Catalog | Promise<Catalog> | (() => Catalog | Promise<Catalog>)

const isToken = (value: unknown): value is Token =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Token).key === 'string' &&
  typeof (value as Token).defaultValue === 'string'

/**
 * Normalize a {@link Catalog} to Lingui {@link Messages}: a {@link Token} entry becomes
 * `[token.key]: token.defaultValue`; a plain string (or already-compiled message) passes through.
 * Detection is per-entry, so a flat map, a tokens map, or a mix all normalize correctly.
 */
export function toMessages(catalog: Catalog): Messages {
  const messages: Messages = {}
  for (const [id, value] of Object.entries(catalog)) {
    if (isToken(value)) messages[value.key] = value.defaultValue
    else messages[id] = value
  }
  return messages
}

/**
 * A translation store — created once and handed to `<Translations>`, then reached with
 * `useTranslations()` to add catalogs, switch language, or translate. Languages are added ad-hoc via
 * {@link ITranslations.add} and must be valid `@luwio/language`s.
 */
export interface ITranslations {
  /** The underlying Lingui instance (used by the provider). */
  readonly i18n: I18n
  /** The languages added so far, as {@link ILanguage}. */
  readonly languages: ILanguage[]
  /** Whether a language's catalog has been loaded. */
  isLoaded(language: ILanguage): boolean
  /**
   * Add a language's catalog from any {@link CatalogSource} — flat Lingui {@link Messages} (as an
   * API returns) or a {@link Tokens} map (normalized internally). Awaitable, cached and deduped — a
   * language is fetched at most once, so it never re-loads on switch. The language must be a valid
   * `@luwio/language`.
   */
  add(language: ILanguage, source: CatalogSource): Promise<void>
  /** Make a language the active one. The language must be a valid `@luwio/language`. */
  activate(language: ILanguage): void
  /**
   * Translate a message id at runtime, or a {@link Token} — in which case its `defaultValue` is the
   * fallback used when the active catalog has no entry for `token.key`. For JSX, prefer `<Trans>`.
   */
  t(id: string | Token, values?: Record<string, unknown>): string
}

// Revalidate against @luwio/language so only real languages are ever added (guards a bogus object
// asserted as ILanguage). Returns the canonical ILanguage.
const validate = (language: ILanguage): ILanguage => Language.new({ code: language.code })

/**
 * Create a {@link ITranslations} store — no config. Add languages with {@link ITranslations.add}
 * (including any you want up front); each must be a valid `@luwio/language`. It knows nothing about
 * routing.
 *
 * @example
 * const translations = createTranslations()
 * const nl = Language.new({ code: 'nl' })
 * await translations.add(nl, () => fetch(`/api/i18n/${nl.code}`).then((r) => r.json()))
 * translations.activate(nl)
 */
export function createTranslations(): ITranslations {
  const i18n = setupI18n()
  const known = new Map<string, ILanguage>() // languages added so far
  const loaded = new Set<string>()
  const inFlight = new Map<string, Promise<void>>()

  const translations: ITranslations = {
    i18n,
    get languages() {
      return [...known.values()]
    },
    isLoaded: (language) => loaded.has(language.code),
    add: (language, source) => {
      let lang: ILanguage
      try {
        lang = validate(language)
      } catch (error) {
        return Promise.reject(error)
      }
      const code = lang.code
      if (loaded.has(code)) return Promise.resolve()
      const existing = inFlight.get(code)
      if (existing) return existing
      known.set(code, lang)
      const value = typeof source === 'function' ? source() : source
      const promise = Promise.resolve(value).then((catalog) => {
        // Accept flat messages (API) or a tokens map — normalize before loading.
        i18n.load(code, toMessages(catalog))
        loaded.add(code)
        inFlight.delete(code)
      })
      inFlight.set(code, promise)
      return promise
    },
    activate: (language) => {
      const lang = validate(language)
      known.set(lang.code, lang)
      if (i18n.locale !== lang.code) i18n.activate(lang.code)
    },
    t: (id, values) =>
      typeof id === 'string'
        ? i18n._(id, values)
        : i18n._(id.key, values, { message: id.defaultValue }),
  }

  return translations
}

import { Locale } from '../domain/locale'
import type { ILocale, LocaleOverrides } from '../types'
import { matchLocalePattern } from './match-locale-pattern'
import { normalizeLocale } from './normalize-locale'

function isPattern(key: string): boolean {
  return key.includes('*') || key.includes('[')
}

/** Whether `key` is a valid locale (a known language + a known country). */
function isValidLocale(key: string): boolean {
  if (key === '') return false
  try {
    Locale.fromLocale({ locale: key })
    return true
  } catch {
    return false
  }
}

/**
 * Resolves a detected locale to the best match among the locales your app supports.
 *
 * `supported` is optional: omit it to accept **any** valid locale (a known language + known
 * country) — the whole dataset. Provide a list to constrain resolution to just those locales.
 *
 * Resolution order:
 * 1. The detected locale itself, when it's supported (in the list, or — with no list — any valid locale)
 * 2. Exact override key match (e.g. `'en-GB': 'nl-BE'`)
 * 3. Pattern override key match using `*` and `[a,b]` syntax (e.g. `'en-*'`, `'en-[BE,NL]'`)
 * 4. First supported locale with the same language (e.g. `nl-DE` → `nl-NL`); only with a `supported` list
 * 5. Catch-all override `'*'` (required — guarantees a locale is always returned)
 *
 * `detected` may be an {@link ILocale}, a raw locale string (e.g. straight from a URL), or
 * `null`/`undefined` (a route with no locale segment) — a missing or unknown value never throws
 * here; it resolves via the required `'*'` catch-all.
 */
export function resolveLocale(value: {
  detected: ILocale | string | null | undefined
  supported?: string[]
  overrides: LocaleOverrides
}): ILocale {
  const { detected, supported, overrides } = value

  const detectedString = typeof detected === 'string' ? detected : (detected?.locale ?? '')
  const key = detectedString === '' ? '' : normalizeLocale({ locale: detectedString })
  const languageCode =
    detected != null && typeof detected !== 'string'
      ? detected.language_code
      : (key.split('-')[0] ?? '')
  // No `supported` list → the whole dataset: every valid locale is supported.
  const normalizedSupported = supported?.map((s) => normalizeLocale({ locale: s }))
  const isSupported = (k: string): boolean =>
    normalizedSupported ? normalizedSupported.includes(k) : isValidLocale(k)
  const normalizedOverrides = Object.fromEntries(
    Object.entries(overrides).map(([k, v]) => [
      isPattern(k) ? k : normalizeLocale({ locale: k }),
      normalizeLocale({ locale: v }),
    ]),
  ) as LocaleOverrides

  if (isSupported(key)) {
    return detected != null && typeof detected !== 'string'
      ? detected
      : Locale.fromLocale({ locale: key })
  }

  const overridden = normalizedOverrides[key]
  if (overridden) {
    return Locale.fromLocale({ locale: overridden })
  }

  const [lang = '', country = ''] = key.split('-')

  const patternMatch = Object.entries(normalizedOverrides).find(([pattern]) => {
    if (pattern === '*' || !isPattern(pattern)) return false
    return matchLocalePattern(pattern, lang, country)
  })

  if (patternMatch) {
    return Locale.fromLocale({ locale: patternMatch[1] })
  }

  // Same-language fallback only applies to an explicit supported list.
  const byLanguage = normalizedSupported?.find((s) =>
    s.toLowerCase().startsWith(`${languageCode.toLowerCase()}-`),
  )

  if (byLanguage) {
    return Locale.fromLocale({ locale: byLanguage })
  }

  return Locale.fromLocale({ locale: normalizedOverrides['*'] })
}

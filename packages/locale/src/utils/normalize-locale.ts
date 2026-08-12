/**
 * Normalizes a locale string to the format `language-REGION`.
 *
 * Trims whitespace, replaces underscores with hyphens, lowercases the language,
 * and uppercases the region.
 *
 * @throws If the locale string is missing its language or region part.
 *
 * @example
 * normalizeLocale({ locale: 'EN_us' }) // 'en-US'
 * normalizeLocale({ locale: 'fr-fr' }) // 'fr-FR'
 */
export function normalizeLocale(value: { locale: string }): string {
  const cleaned = value.locale.trim().replace('_', '-')
  const [language, country] = cleaned.split('-')

  if (!language) {
    throw new Error(`Invalid language: ${value.locale}`)
  }
  if (!country) {
    throw new Error(`Invalid country: ${value.locale}`)
  }

  return `${language.toLowerCase()}-${country.toUpperCase()}`
}

function matchesPart(pattern: string, value: string): boolean {
  if (pattern === '*') return true
  if (pattern.startsWith('[') && pattern.endsWith(']')) {
    const options = pattern
      .slice(1, -1)
      .split(',')
      .map((s) => s.trim())
    return options.some((opt) => opt.toLowerCase() === value.toLowerCase())
  }
  return pattern.toLowerCase() === value.toLowerCase()
}

/**
 * Matches a `language-country` pattern against a concrete language/country pair.
 * Supports `*` wildcards and `[a,b]` option lists on either side, e.g. `en-*`,
 * `*-BE`, `en-[BE,NL]`.
 */
export function matchLocalePattern(pattern: string, lang: string, country: string): boolean {
  const dash = pattern.indexOf('-')
  if (dash === -1) return false
  return matchesPart(pattern.slice(0, dash), lang) && matchesPart(pattern.slice(dash + 1), country)
}

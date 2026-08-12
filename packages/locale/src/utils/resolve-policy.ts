import type { LocalePolicy, MatchingPolicy } from '../types'
import { matchLocalePattern } from './match-locale-pattern'

function sideScore(part: string): number {
  if (part === '*') return 2
  if (part.startsWith('[')) return 1
  return 0
}

function specificity(pattern: string): number {
  const dash = pattern.indexOf('-')
  if (dash === -1) return 0
  return sideScore(pattern.slice(0, dash)) + sideScore(pattern.slice(dash + 1))
}

/**
 * Resolves the effective {@link MatchingPolicy} for a language/country pair.
 * A uniform policy is returned as-is; a rule map is scanned most-specific-first,
 * falling back to its `default`.
 */
export function resolvePolicy(
  policy: LocalePolicy,
  language: string,
  country: string,
): MatchingPolicy {
  if (typeof policy === 'string') return policy

  const sorted = Object.entries(policy.locales).sort(([a], [b]) => specificity(a) - specificity(b))

  for (const [pattern, match] of sorted) {
    if (matchLocalePattern(pattern, language, country)) return match
  }

  return policy.default
}

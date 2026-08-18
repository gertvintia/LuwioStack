import { type PropsWithChildren, useMemo } from 'react'
import { Locale as LocaleClass } from '../domain/locale'
import type { LocaleOverrides, LocalePolicy } from '../types'
import { resolveLocale } from '../utils/resolve-locale'
import { LocaleContext } from './locale-context'

type LocaleCommon = PropsWithChildren & {
  /** Optional matching policy applied when resolving the locale. */
  policy?: LocalePolicy
}

/**
 * Props for `<Locale>`. Two shapes:
 *
 * - **Strict** — a known-good `locale` string, used as-is (throws if unknown).
 * - **Resolve** — a `locale` that may be `null`/`undefined` (e.g. straight from the router, where a
 *   route can have no locale segment). Requires `supported` + `overrides` so it can resolve exactly
 *   like `resolveLocale`; a missing or unsupported `locale` lands on the required `'*'` catch-all.
 */
export type LocaleProps =
  | (LocaleCommon & { locale: string; supported?: never; overrides?: never })
  | (LocaleCommon & {
      locale: string | null | undefined
      supported: string[]
      overrides: LocaleOverrides
    })

/** Resolves `locale` and provides it to descendants. Read it with {@link useLocale}. */
export function Locale(props: LocaleProps) {
  const { locale, policy, children } = props
  const supportedKey = props.supported?.join('|')

  // biome-ignore lint/correctness/useExhaustiveDependencies: `supported` is tracked via supportedKey
  const value = useMemo(() => {
    // Strict: no overrides means `locale` is a known-good string (enforced by the type).
    if (props.overrides === undefined) {
      return LocaleClass.fromLocale({ locale: props.locale, policy })
    }
    // Resolve: a missing (null/undefined) locale — a route with no locale segment — falls straight
    // to the required '*' catch-all; anything else resolves through resolveLocale's rules.
    if (!props.locale) {
      return LocaleClass.fromLocale({ locale: props.overrides['*'], policy })
    }
    return resolveLocale({
      detected: props.locale,
      supported: props.supported,
      overrides: props.overrides,
      policy,
    })
  }, [locale, policy, supportedKey, props.overrides])

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

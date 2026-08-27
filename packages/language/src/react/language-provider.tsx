import { type PropsWithChildren, useMemo } from 'react'
import { Language as LanguageClass } from '../domain/language'
import type { ILanguage } from '../types'
import { LanguageContext } from './language-context'

export interface LanguageProps extends PropsWithChildren {
  /** A resolved language, e.g. `Language.new({ code: 'nl' })`. */
  language: ILanguage
}

/**
 * Provides `language` to descendants. Read it with {@link useLanguage}.
 *
 * `<Language>` takes an already-built {@link ILanguage}; the same export carries `Language.new` /
 * `Language.from`, so one import from `@luwio/language/react` both builds and provides. (The
 * React-free domain class lives at `@luwio/language`.)
 */
export function Language({ language, children }: LanguageProps) {
  // Key on the language's code, so a fresh-but-equal ILanguage passed each render keeps a stable
  // identity — safe to use directly in dependency arrays.
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally keyed on code, not identity
  const value = useMemo(() => language, [language.code])
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

/** Look up a language by ISO 639-1 code — the domain factory, surfaced on the provider. */
Language.new = LanguageClass.new
/** Look up by code in an explicit format (defaults to alpha-2). */
Language.from = LanguageClass.from

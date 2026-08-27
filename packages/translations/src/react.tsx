import { I18nProvider } from '@lingui/react'
import { createContext, type PropsWithChildren, useContext, useSyncExternalStore } from 'react'
import type { ITranslations } from './translations'

const TranslationsContext = createContext<ITranslations | null>(null)

export interface TranslationsProps extends PropsWithChildren {
  /** The store created by {@link createTranslations}. */
  translations: ITranslations
}

/**
 * Provides a translations store to the tree — like `<RouterProvider router={…} />`, but named just
 * `Translations` (the `@luwio/locale` `<Locale>` convention). Reach it with {@link useTranslations}.
 *
 * @example
 * <Translations translations={translations}>
 *   <App />
 * </Translations>
 */
export function Translations({ translations, children }: TranslationsProps) {
  return (
    <TranslationsContext.Provider value={translations}>
      <I18nProvider i18n={translations.i18n}>{children}</I18nProvider>
    </TranslationsContext.Provider>
  )
}

const noop = () => {}

/**
 * Access the translations store — like `useRouter()` returns `{ router }`, this returns
 * `{ translations }`. Use it to `add()` catalogs (cached, deduped), `activate()` a language, or
 * `t()` to translate. Re-renders when the active language changes.
 *
 * @throws If used outside a {@link Translations} provider.
 *
 * @example
 * const { translations } = useTranslations()
 * translations.t('greeting')
 * await translations.activate(nl)
 */
export function useTranslations(): { translations: ITranslations } {
  const translations = useContext(TranslationsContext)
  // Re-render when the active language/catalog changes. Hooks stay unconditional (null-safe) so the
  // guard below can throw our own error.
  useSyncExternalStore(
    (onChange) => translations?.i18n.on('change', onChange) ?? noop,
    () => translations?.i18n.locale,
    () => translations?.i18n.locale,
  )
  if (!translations) {
    throw new Error('useTranslations must be used within a <Translations> provider.')
  }
  return { translations }
}

// Re-export the Lingui React primitives consumers commonly need.
export { Trans, useLingui } from '@lingui/react'

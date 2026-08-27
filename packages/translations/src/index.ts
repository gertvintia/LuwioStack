// @luwio/translations — Lingui-powered translations for React.
//
// Create a translations store (no config), hand it to <Translations translations={…} /> (like
// <RouterProvider router={…} />), then reach it with useTranslations() to add catalogs at runtime
// (cached, deduped), activate a language, or translate. Languages are added ad-hoc and must be valid
// @luwio/language`s. It knows nothing about routing.

export {
  Trans,
  Translations,
  type TranslationsProps,
  useLingui,
  useTranslations,
} from './react'
export {
  type Catalog,
  type CatalogSource,
  createTranslations,
  type ITranslations,
  type Messages,
  type Token,
  type Tokens,
  toMessages,
} from './translations'

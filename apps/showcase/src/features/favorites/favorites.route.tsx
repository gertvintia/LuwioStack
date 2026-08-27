import { Locale } from '@luwio/locale'
import { createRoute } from '@luwio/router'
import { translations } from '../../app/translations'
import { Favorites } from './Favorites'

export default createRoute({
  id: 'favorites',
  parent: 'shell',
  component: Favorites,
  head: () => ({ meta: [{ title: translations.t('favorites.title') }] }),
})
  .alias(Locale.new({ languageOrLocale: 'en-IE' }), 'favourites')
  .alias(Locale.new({ languageOrLocale: 'nl-NL' }), 'favorieten')
  .alias(Locale.new({ languageOrLocale: 'fr-FR' }), 'favoris')

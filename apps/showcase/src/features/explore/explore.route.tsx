import { Locale } from '@luwio/locale'
import { createRoute } from '@luwio/router'
import { translations } from '../../app/translations'
import { Explore } from './Explore'

export default createRoute({
  id: 'explore',
  parent: 'shell',
  component: Explore,
  head: () => ({ meta: [{ title: translations.t('explore.title') }] }),
})
  .alias(Locale.new({ languageOrLocale: 'en-IE' }), 'explore')
  .alias(Locale.new({ languageOrLocale: 'nl-NL' }), 'ontdek')
  .alias(Locale.new({ languageOrLocale: 'fr-FR' }), 'explorer')

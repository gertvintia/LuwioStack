import { Locale } from '@luwio/locale'
import { createRoute, notFound } from '@luwio/router'
import { translations } from '../../app/translations'
import { About } from './About'

// Aliased for English and French only. Dutch (nl-NL) has no alias, so beforeLoad throws notFound()
// there — a per-locale 404, shown by the shell's NotFound.
const about = createRoute({
  id: 'about',
  parent: 'shell',
  component: About,
  beforeLoad: ({ context }) => {
    if (!about.hasAlias(context.locale)) throw notFound()
  },
  head: () => ({ meta: [{ title: translations.t('about.title') }] }),
})

about
  .alias(Locale.new({ languageOrLocale: 'en-IE' }), 'about')
  .alias(Locale.new({ languageOrLocale: 'fr-FR' }), 'a-propos')

export default about

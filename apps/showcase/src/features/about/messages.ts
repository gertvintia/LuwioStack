// about.nav is provided for every language so the (disabled) nav tab is labelled; the page itself is
// only aliased for en/fr — Dutch throws notFound(), so about.title/body aren't needed for nl.
export const messages: Record<string, Record<string, string>> = {
  en: {
    'about.nav': 'About',
    'about.title': 'About',
    'about.body':
      'This page is aliased for English and French only. Switch to Dutch and the route throws notFound() — a per-locale 404.',
  },
  nl: {
    'about.nav': 'Over',
  },
  fr: {
    'about.nav': 'À propos',
    'about.title': 'À propos',
    'about.body':
      'Cette page n’a d’alias qu’en anglais et en français. Passez au néerlandais et la route renvoie notFound().',
  },
}

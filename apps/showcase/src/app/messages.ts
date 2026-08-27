// App-level strings (not owned by a single feature) — e.g. the 404 shown when a route has no alias
// for the active language. Collected by messages-api alongside each feature's messages.
export const messages: Record<string, Record<string, string>> = {
  en: {
    'notfound.title': 'Not available here',
    'notfound.body': 'This page isn’t translated for the current language.',
    'notfound.home': 'Back home',
  },
  nl: {
    'notfound.title': 'Niet beschikbaar in deze taal',
    'notfound.body': 'Deze pagina bestaat niet in het Nederlands.',
    'notfound.home': 'Terug naar start',
  },
  fr: {
    'notfound.title': 'Indisponible ici',
    'notfound.body': 'Cette page n’existe pas dans cette langue.',
    'notfound.home': 'Retour à l’accueil',
  },
}

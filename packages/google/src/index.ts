// @luwio/google — a home for Google web-platform integrations, one namespace per library.
//
// Each Google library lives under its own subpath import so you only pull in what you use:
//
//   import { GoogleMapsProvider, useGoogleMaps } from '@luwio/google/map'
//   import { GoogleAnalyticsProvider, useAnalytics } from '@luwio/google/analytics'
//
// Each namespace is a separate Google product with its own script, credential and provider —
// nest the providers you need. Future libraries follow the same pattern (e.g.
// '@luwio/google/places'). This root entry intentionally exports no library code.

export const version = '0.0.0'

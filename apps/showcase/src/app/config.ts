import { createConfig } from '@luwio/config'

// @luwio/config — typed runtime configuration, defined once. Values are read with the generated,
// fully-typed hooks below (no string-keyed lookups, no `any`).
export const { ConfigProvider, useConfig, useConfigValue } = createConfig({
  appName: 'Luwio Showcase',
  tagline: 'Explore locales, save your favourites.',
})

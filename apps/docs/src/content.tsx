import type { ReactNode } from 'react'
import {
  BankIcon,
  BanknoteIcon,
  BarChartIcon,
  CalendarIcon,
  CardReaderIcon,
  ClockIcon,
  CoinIcon,
  ContrastIcon,
  DatabaseIcon,
  GlobeIcon,
  IdCardIcon,
  LanguagesIcon,
  MapPinIcon,
  PhoneIcon,
  RocketIcon,
  RouteIcon,
  SlidersIcon,
  TerminalIcon,
  TypeIcon,
} from './icons'

export type PackageStatus = 'done' | 'ready' | 'skeleton'

export interface PackageMeta {
  slug: string
  name: string
  accent: string
  icon: ReactNode
  tagline: string
  blurb: string
  gzip: string
  install: string
  status: PackageStatus
  /** Show this package in the nav menu and on the home grid. Hidden ones stay
   * fully functional (pages remain reachable by direct link) but aren't listed. */
  show: boolean
}

export const PACKAGES: PackageMeta[] = [
  {
    slug: 'cli',
    name: '@luwio/cli',
    accent: '#64748b',
    icon: <TerminalIcon />,
    tagline: 'Scaffolding CLI',
    blurb:
      'The `luwio` command — scaffold a boilerplate app (locale routing + translations) with `luwio create <dir>`. Dependency-free.',
    gzip: '—',
    install: 'pnpm dlx @luwio/cli create my-app',
    status: 'ready',
    show: true,
  },
  {
    slug: 'bootstrap',
    name: '@luwio/bootstrap',
    accent: '#0ea5e9',
    icon: <RocketIcon />,
    tagline: 'Config-based bootstrap',
    blurb:
      'Fetch runtime config from an API — with ETag caching and stale-while-revalidate — then build your app from it. A `<Bootstrap>` gate + hooks for any React app.',
    gzip: '2.2 kB',
    install: 'npm i @luwio/bootstrap',
    status: 'ready',
    show: true,
  },
  {
    slug: 'router',
    name: '@luwio/router',
    accent: '#ec4899',
    icon: <RouteIcon />,
    tagline: 'Locale-aware routing',
    blurb:
      'A locale-aware route registry for TanStack Router — define one route per file with a translated URL segment per locale, then expand the registry into a real route tree.',
    gzip: '62 kB',
    install: 'npm i @luwio/router @luwio/locale',
    status: 'ready',
    show: true,
  },
  {
    slug: 'locale',
    name: '@luwio/locale',
    accent: '#f59e0b',
    icon: <GlobeIcon />,
    tagline: 'Locale management',
    blurb:
      'Predictable locale management — a typed domain model over ISO country & language data, with a provider and hook.',
    gzip: '3 kB',
    install: 'npm i @luwio/locale',
    status: 'done',
    show: true,
  },
  {
    slug: 'country',
    name: '@luwio/country',
    accent: '#10b981',
    icon: <MapPinIcon />,
    tagline: 'Country data',
    blurb:
      'Typed ISO 3166 country data — continents, borders, dialing codes, currencies and the languages each country speaks.',
    gzip: '20 kB',
    install: 'npm i @luwio/country',
    status: 'ready',
    show: true,
  },
  {
    slug: 'language',
    name: '@luwio/language',
    accent: '#a855f7',
    icon: <TypeIcon />,
    tagline: 'Language data',
    blurb:
      'Typed ISO 639 language data — a small, immutable domain model over the ISO 639-1/2/3 list. Dependency-free.',
    gzip: '4 kB',
    install: 'npm i @luwio/language',
    status: 'ready',
    show: true,
  },
  {
    slug: 'currency',
    name: '@luwio/currency',
    accent: '#14b8a6',
    icon: <BanknoteIcon />,
    tagline: 'Currency data',
    blurb:
      'Typed ISO 4217 currency data — code, name, symbol and minor units, with a `<Currency>` provider and `useCurrency` hook.',
    gzip: '4 kB',
    install: 'npm i @luwio/currency',
    status: 'ready',
    show: false,
  },
  {
    slug: 'timezone',
    name: '@luwio/timezone',
    accent: '#6366f1',
    icon: <ClockIcon />,
    tagline: 'Timezone data',
    blurb:
      'Typed IANA timezone data — DST-aware offsets and abbreviations from Intl, with a `<Timezone>` provider and `useTimezone` hook. The base for @luwio/datetime.',
    gzip: '1 kB',
    install: 'npm i @luwio/timezone',
    status: 'ready',
    show: false,
  },
  {
    slug: 'translations',
    name: '@luwio/translations',
    accent: '#f43f5e',
    icon: <LanguagesIcon />,
    tagline: 'Translations (Lingui)',
    blurb:
      'Lingui-powered translations for React — a language provider, catalog (pre)loading (cached, awaitable in route loaders), and a t() helper.',
    gzip: '1 kB',
    install: 'npm i @luwio/translations @lingui/core @lingui/react',
    status: 'ready',
    show: true,
  },
  {
    slug: 'phone',
    name: '@luwio/phone',
    accent: '#0ea5e9',
    icon: <PhoneIcon />,
    tagline: 'Phone numbers',
    blurb:
      'Parse, validate, classify and format phone numbers — a typed domain model over google-libphonenumber, with a `<Phone>` provider and `usePhone` hook.',
    gzip: '2 kB + libphonenumber',
    install: 'npm i @luwio/phone',
    status: 'ready',
    show: false,
  },
  {
    slug: 'iban',
    name: '@luwio/iban',
    accent: '#ea580c',
    icon: <BankIcon />,
    tagline: 'IBAN validation',
    blurb:
      'Validate and format IBANs — the global ISO 13616 check over a per-country registry (every IBAN country), with a `<Iban>` provider and `useIban` hook.',
    gzip: '2 kB',
    install: 'npm i @luwio/iban',
    status: 'ready',
    show: false,
  },
  {
    slug: 'national-id',
    name: '@luwio/national-id',
    accent: '#d97706',
    icon: <IdCardIcon />,
    tagline: 'National ID validation',
    blurb:
      'Validate national identification numbers — an incremental per-country registry (BE, DE, ES, FR, GB, IT, NL, PT), with a `<NationalId>` provider and `useNationalId` hook.',
    gzip: '2 kB',
    install: 'npm i @luwio/national-id',
    status: 'ready',
    show: false,
  },
  {
    slug: 'eid',
    name: '@luwio/eid',
    accent: '#0d9488',
    icon: <CardReaderIcon />,
    tagline: 'eID card reader',
    blurb:
      'Read national eID smartcards from a physical reader — Belgium (BELPIC), Estonia (EstEID) and the Netherlands (ICAO eMRTD) implemented over a PC/SC transport (`@luwio/eid/node` + `@luwio/eid/electron`), a per-country registry with an honest capability matrix, and a `<Eid>` provider + `useEid` hook.',
    gzip: '2 kB',
    install: 'npm i @luwio/eid',
    status: 'ready',
    show: false,
  },
  {
    slug: 'money',
    name: '@luwio/money',
    accent: '#22c55e',
    icon: <CoinIcon />,
    tagline: 'Money & currency',
    blurb:
      'Currency formatting and safe minor-unit math. Amounts are integer cents, so no floating-point drift.',
    gzip: '—',
    install: 'npm i @luwio/money',
    status: 'skeleton',
    show: false,
  },
  {
    slug: 'datetime',
    name: '@luwio/datetime',
    accent: '#3b82f6',
    icon: <CalendarIcon />,
    tagline: 'Date & time',
    blurb:
      'Small, dependency-free date & time helpers built on the platform Intl APIs. No framework required.',
    gzip: '—',
    install: 'npm i @luwio/datetime',
    status: 'skeleton',
    show: false,
  },
  {
    slug: 'config',
    name: '@luwio/config',
    accent: '#06b6d4',
    icon: <SlidersIcon />,
    tagline: 'Runtime configuration',
    blurb:
      'Typed runtime configuration. Define your shape once and get a fully-typed provider plus hooks — no string keys.',
    gzip: '0.5 kB',
    install: 'npm i @luwio/config',
    status: 'ready',
    show: false,
  },
  {
    slug: 'storage',
    name: '@luwio/storage',
    accent: '#8b5cf6',
    icon: <DatabaseIcon />,
    tagline: 'Reactive Web Storage',
    blurb:
      'Reactive localStorage & sessionStorage hooks that stay in sync across components and browser tabs. SSR-safe.',
    gzip: '1 kB',
    install: 'npm i @luwio/storage',
    status: 'ready',
    show: false,
  },
  {
    slug: 'mijn-burgerprofiel',
    name: '@luwio/mijn-burgerprofiel',
    accent: '#ffb100',
    icon: <IdCardIcon />,
    tagline: 'Mijn Burgerprofiel',
    blurb:
      'React integration for the Flemish Mijn Burgerprofiel — citizen sign-in (ACM/IDM) and profile.',
    gzip: '—',
    install: 'npm i @luwio/mijn-burgerprofiel',
    status: 'skeleton',
    show: false,
  },
  {
    slug: 'theme',
    name: '@luwio/theme',
    accent: '#6366f1',
    icon: <ContrastIcon />,
    tagline: 'Theming',
    blurb:
      'Light / dark / system theme management for React — a provider + hook that reflects the resolved theme on <html>.',
    gzip: '—',
    install: 'npm i @luwio/theme',
    status: 'skeleton',
    show: false,
  },
  {
    slug: 'google-maps',
    name: '@luwio/google-maps',
    accent: '#ef4444',
    icon: <MapPinIcon />,
    tagline: 'Google Maps',
    blurb:
      'Reliable Google Maps JS API loading for React — base script and libraries load once, tracked with query-style states.',
    gzip: '6 kB',
    install: 'npm i @luwio/google-maps',
    status: 'ready',
    show: false,
  },
  {
    slug: 'google-analytics',
    name: '@luwio/google-analytics',
    accent: '#e8710a',
    icon: <BarChartIcon />,
    tagline: 'Google Analytics',
    blurb:
      'Google Analytics 4 (gtag.js) for React — one consent prop gates tracking, with Consent Mode v2 support.',
    gzip: '3 kB',
    install: 'npm i @luwio/google-analytics',
    status: 'ready',
    show: false,
  },
]

/** Packages listed in the nav menu and on the home grid (the current demo set). */
export const VISIBLE_PACKAGES: PackageMeta[] = PACKAGES.filter((p) => p.show)

export function packageBySlug(slug: string): PackageMeta | undefined {
  return PACKAGES.find((p) => p.slug === slug)
}

import type { ReactNode } from 'react'
import {
  BarChartIcon,
  CalendarIcon,
  CoinIcon,
  ContrastIcon,
  DatabaseIcon,
  GlobeIcon,
  IdCardIcon,
  LayoutIcon,
  MapPinIcon,
  PhoneIcon,
  RouteIcon,
  SlidersIcon,
} from './icons'

export type PackageStatus = 'ready' | 'skeleton'

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
}

export const PACKAGES: PackageMeta[] = [
  {
    slug: 'locale',
    name: '@luwio/locale',
    accent: '#f59e0b',
    icon: <GlobeIcon />,
    tagline: 'Locale management',
    blurb:
      'Predictable locale management — a typed domain model over ISO country & language data, with a provider and hook.',
    gzip: '44 kB',
    install: 'npm i @luwio/locale',
    status: 'ready',
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
  },
  {
    slug: 'router',
    name: '@luwio/router',
    accent: '#ec4899',
    icon: <RouteIcon />,
    tagline: 'Typed routing',
    blurb:
      'Typed routing primitives for React. Define routes with full type inference; matching and navigation are on the way.',
    gzip: '—',
    install: 'npm i @luwio/router',
    status: 'skeleton',
  },
  {
    slug: 'ui',
    name: '@luwio/ui',
    accent: '#14b8a6',
    icon: <LayoutIcon />,
    tagline: 'Headless UI',
    blurb:
      'Headless UI helpers and components for React — starting with class-name and accessibility primitives.',
    gzip: '—',
    install: 'npm i @luwio/ui',
    status: 'skeleton',
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
  },
  {
    slug: 'phone',
    name: '@luwio/phone',
    accent: '#0ea5e9',
    icon: <PhoneIcon />,
    tagline: 'Phone numbers',
    blurb:
      'Parse and format phone numbers — a small, dependency-free core with E.164, international and national output.',
    gzip: '—',
    install: 'npm i @luwio/phone',
    status: 'skeleton',
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
  },
]

export function packageBySlug(slug: string): PackageMeta | undefined {
  return PACKAGES.find((p) => p.slug === slug)
}

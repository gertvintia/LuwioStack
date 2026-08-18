import { createContext, createElement, type ReactNode, useContext, useMemo, useState } from 'react'

// @luwio/mijn-burgerprofiel — React integration for the Flemish "Mijn Burgerprofiel"
// citizen profile & sign-in (ACM/IDM). Skeleton: a provider + hook with the auth surface;
// the real OIDC flow and profile fetch are on the roadmap.

export type BurgerprofielEnvironment = 'production' | 'integration'

export interface BurgerprofielConfig {
  /** OAuth/OIDC client id registered with ACM/IDM. */
  clientId: string
  /** Which ACM/IDM environment to talk to. @default "production" */
  environment?: BurgerprofielEnvironment
  /** Where ACM/IDM redirects back to after sign-in. */
  redirectUri?: string
}

/** The citizen's profile, as returned by Mijn Burgerprofiel. */
export interface BurgerprofielProfile {
  firstName: string
  lastName: string
  /** Belgian national number (rijksregisternummer / SSIN). */
  ssin: string
}

export type BurgerprofielStatus = 'anonymous' | 'loading' | 'authenticated'

export interface BurgerprofielApi {
  /** `"anonymous"` until sign-in, `"loading"` during the flow, `"authenticated"` once resolved. */
  status: BurgerprofielStatus
  /** The signed-in citizen's profile, or `null` when not authenticated. */
  profile: BurgerprofielProfile | null
  /** Start the ACM/IDM sign-in flow. */
  signIn: () => void
  /** Clear the session. */
  signOut: () => void
}

export interface MijnBurgerprofielProviderProps extends BurgerprofielConfig {
  children: ReactNode
}

const BurgerprofielContext = createContext<BurgerprofielApi | null>(null)
BurgerprofielContext.displayName = 'MijnBurgerprofiel'

export function MijnBurgerprofielProvider(props: MijnBurgerprofielProviderProps) {
  const [status, setStatus] = useState<BurgerprofielStatus>('anonymous')
  const [profile, setProfile] = useState<BurgerprofielProfile | null>(null)

  const value = useMemo<BurgerprofielApi>(
    () => ({
      status,
      profile,
      // Skeleton: a real integration starts the ACM/IDM OIDC flow with props.clientId /
      // props.redirectUri here, then resolves the profile on the return leg.
      signIn: () => setStatus('loading'),
      signOut: () => {
        setStatus('anonymous')
        setProfile(null)
      },
    }),
    [status, profile],
  )

  return createElement(BurgerprofielContext.Provider, { value }, props.children)
}
MijnBurgerprofielProvider.displayName = 'MijnBurgerprofielProvider'

/** Access the citizen's sign-in state and profile. Throws outside a provider. */
export function useBurgerprofiel(): BurgerprofielApi {
  const ctx = useContext(BurgerprofielContext)
  if (ctx === null) {
    throw new Error(
      '@luwio/mijn-burgerprofiel: useBurgerprofiel must be used inside a <MijnBurgerprofielProvider>',
    )
  }
  return ctx
}

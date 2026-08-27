import type { ICountry } from '@luwio/country'
import { useCallback, useContext, useState } from 'react'
import { Eid as EidDomain } from '../domain/eid'
import type { CardSecrets, IIdentityDocument } from '../types'
import { EidContext } from './eid-context'

/** The read lifecycle: idle → (no-reader | waiting → reading → read) with error as a sink. */
export type EidStatus = 'idle' | 'no-reader' | 'waiting' | 'reading' | 'read' | 'error'

export interface UseEidResult {
  /** Current phase of the read. */
  status: EidStatus
  /** The last successfully read document, or `null`. */
  card: IIdentityDocument | null
  /** The last error, or `null`. */
  error: Error | null
  /** Read the card for `country`. Resolves with the document, or `undefined` on error/no-reader. */
  read(country: ICountry, secrets?: CardSecrets): Promise<IIdentityDocument | undefined>
  /** Return to the `idle` state. */
  reset(): void
}

interface EidState {
  status: EidStatus
  card: IIdentityDocument | null
  error: Error | null
}

const IDLE: EidState = { status: 'idle', card: null, error: null }

/**
 * Read eID cards from the reader supplied by `<Eid>`. Models the full async lifecycle so UIs can
 * show progress; the actual transport and per-country parsing are provided elsewhere.
 */
export function useEid(): UseEidResult {
  const reader = useContext(EidContext)
  if (reader === undefined) {
    throw new Error('useEid must be used within a <Eid> provider')
  }

  const [state, setState] = useState<EidState>(IDLE)

  const read = useCallback(
    async (country: ICountry, secrets?: CardSecrets): Promise<IIdentityDocument | undefined> => {
      if (!reader) {
        setState({ status: 'no-reader', card: null, error: null })
        return undefined
      }
      setState({ status: 'waiting', card: null, error: null })
      try {
        const card = await EidDomain.read(reader, country, {
          secrets,
          onCardPresent: () => setState((s) => ({ ...s, status: 'reading' })),
        })
        setState({ status: 'read', card, error: null })
        return card
      } catch (error) {
        setState({ status: 'error', card: null, error: error as Error })
        return undefined
      }
    },
    [reader],
  )

  const reset = useCallback(() => setState(IDLE), [])

  return { ...state, read, reset }
}

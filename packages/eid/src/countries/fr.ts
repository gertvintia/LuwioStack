import { type CardProfile, NotImplementedError } from '../types'

// France — CNIe (2021+). Carries an ICAO chip read over a PACE secure channel via the CAN.
export const fr: CardProfile = {
  countryCode: 'FR',
  access: { level: 'secure-channel', via: 'can' },
  read: () => Promise.reject(new NotImplementedError('FR', 'CNIe read not yet implemented')),
}

import { type CardProfile, NotImplementedError } from '../types'

// Italy — CIE (Carta d'Identità Elettronica). Requires a PACE secure channel via the CAN.
export const it: CardProfile = {
  countryCode: 'IT',
  access: { level: 'secure-channel', via: 'can' },
  read: () => Promise.reject(new NotImplementedError('IT', 'CIE read not yet implemented')),
}

import { type CardProfile, NotImplementedError } from '../types'

// Spain — DNIe 3.0. Data sits behind a PACE secure channel opened with the card's CAN.
export const es: CardProfile = {
  countryCode: 'ES',
  access: { level: 'secure-channel', via: 'can' },
  read: () => Promise.reject(new NotImplementedError('ES', 'DNIe read not yet implemented')),
}

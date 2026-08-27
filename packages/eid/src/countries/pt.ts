import { type CardProfile, NotImplementedError } from '../types'

// Portugal — Cartão de Cidadão. Personal data is released after PIN verification.
export const pt: CardProfile = {
  countryCode: 'PT',
  access: { level: 'secure-channel', via: 'pin' },
  read: () =>
    Promise.reject(new NotImplementedError('PT', 'Cartão de Cidadão read not yet implemented')),
}

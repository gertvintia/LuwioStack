import { type CardProfile, NotImplementedError } from '../types'

// Germany — nPA / eID. Personal data is protected by Extended Access Control: reading requires a
// government authorization certificate (Berechtigungszertifikat) and an eID-Server, so third-party
// raw reading is effectively closed. Registered for transparency; read() will stay unsupported.
export const de: CardProfile = {
  countryCode: 'DE',
  access: { level: 'authorization-required' },
  read: () =>
    Promise.reject(
      new NotImplementedError('DE', 'nPA requires an authorization certificate + eID-Server'),
    ),
}

# @luwio/mijn-burgerprofiel

React integration for the Flemish **Mijn Burgerprofiel** — citizen sign-in (ACM/IDM) and profile.

Part of [LuwioStack](https://github.com/) — standalone, but pairs well with the other `@luwio/*` packages.

> **Status: skeleton.** A provider + hook with the auth surface today; the real ACM/IDM OIDC flow
> and profile fetch are on the roadmap.

## Install

```bash
npm install @luwio/mijn-burgerprofiel
```

React 18+ is a peer dependency.

## Usage

```tsx
import { MijnBurgerprofielProvider, useBurgerprofiel } from '@luwio/mijn-burgerprofiel'

function App() {
  return (
    <MijnBurgerprofielProvider clientId={import.meta.env.VITE_ACM_CLIENT_ID}>
      <Account />
    </MijnBurgerprofielProvider>
  )
}

function Account() {
  const { status, profile, signIn, signOut } = useBurgerprofiel()
  if (status !== 'authenticated') return <button onClick={signIn}>Aanmelden</button>
  return (
    <p>
      Welkom {profile?.firstName} — <button onClick={signOut}>Afmelden</button>
    </p>
  )
}
```

## API surface

- `<MijnBurgerprofielProvider clientId environment? redirectUri?>` — provides the auth context.
- `useBurgerprofiel()` → `{ status, profile, signIn, signOut }`.

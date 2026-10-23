# GuruBridge mobile app (Expo)

iOS + Android app for families. It uses the same accounts, classes and rules as the website through the JSON API (`/api/v1`, see `../../docs/api.md`). Admin and the teacher dashboard stay on the website.

- **Expo SDK 58**, Expo Router (`src/app/` — every file is a screen)
- **Sign-in:** Better Auth with `@better-auth/expo`; the session is kept in the device's secure storage
- **Shared code:** `../../packages/shared` (types, time zones, ₹ formatting) via the `@shared/*` alias
- **API:** `https://marketplace-ten-virid.vercel.app` (set in `app.json → extra.apiUrl`, or override with `EXPO_PUBLIC_API_URL`)
- **Scheme:** `gurubridge://` — must match `siteConfig.appScheme` on the server

## Commands (run inside `apps/mobile`)

```bash
npm install              # npm 12: use plain npm installs; `npx expo install` fails with EALLOWSCRIPTS
npm run typecheck        # tsc --noEmit
npx eslint src           # lint
npx expo-doctor          # dependency/config check
npx expo export --platform android   # bundle check without a device
```

## Trying it on a phone

1. **Expo Go (quickest):** set `ALLOW_EXPO_GO=1` in Vercel (Project → Settings → Environment Variables) and redeploy, install *Expo Go* on the phone, run `npx expo start --tunnel` here, and scan the QR code. Remove the setting when done.
2. **Development build (closer to the real app):** create a free Expo account, then `npx eas-cli@latest build --profile development --platform android` and install the build on the phone.

## Screens so far (Week 1)

- **Explore** — categories and live classes from the website, times in the phone's time zone with IST
- **Account** — join free / sign in; signed in: profile loaded from `/api/v1/me`, sign out
- **Sign in / Join free** — only reachable while signed out (`Stack.Protected`)

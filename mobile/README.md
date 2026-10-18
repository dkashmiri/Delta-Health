# Delta Health mobile app

Expo SDK 58 · TypeScript · Expo Router. See the repo root `CLAUDE.md` for the project rules.

## Run it

1. Copy `.env.example` to `.env` and fill in your Supabase project URL and publishable key.
2. Apply `../supabase/migrations` to that project.
3. `npm install`, then `npx expo start` and scan the QR code with Expo Go.

## Checks

`npm run typecheck`, `npm run lint` and `npm test` (CI runs the same on every push).

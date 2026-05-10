# resonance-profile

Music taste analyser that pulls data from Spotify API and profiles the user's musical identity.

## Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: NextAuth v5 (beta) — Spotify OAuth
- **Database**: PostgreSQL via Supabase
- **ORM**: Prisma v7
- **Visualization**: Recharts
- **Testing**: Vitest + React Testing Library

## Key Commands
- `npm run dev` — start dev server
- `npm run test` — run tests in watch mode
- `npm run test:run` — run tests once
- `npm run lint` — lint
- `npx prisma studio` — open Prisma Studio
- `npx prisma migrate dev` — run migrations

## Project Structure
- `src/app/` — App Router pages and layouts
- `src/components/` — shared components (`ui/` for shadcn)
- `src/lib/` — utilities, auth config, db client
- `src/test/` — test setup
- `prisma/` — schema and migrations

## Notes
- `.env` is gitignored — use `.env.example` as reference
- NextAuth v5 uses `auth.ts` at the root of `src/lib/` or `src/`
- Prisma client should be instantiated as a singleton in `src/lib/db.ts`

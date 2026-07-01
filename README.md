# Passerine

A movie and TV watchlist app. Search for films and shows, track your watch status, rate and review what you've seen, and browse what others are watching.

Built with Next.js 16, TypeScript, PostgreSQL, and the TMDB API.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?logo=postgresql)

## Features

- **Browse & Search** — Discover trending movies and shows, search the full TMDB catalog with live autocomplete
- **Watchlist** — Add titles with a status: Plan to Watch, Watching, Completed, or Dropped
- **Reviews** — Rate titles out of 10 and write a review once you've marked them as completed
- **Favorites** — Star anything on your watchlist
- **Profile** — View your stats, filter your watchlist by status, and browse your reviews
- **Auth** — Sign up with email/password or Google OAuth

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | NextAuth v5 — Google OAuth + Credentials |
| Database | PostgreSQL via Supabase |
| ORM | Prisma v7 |
| Data | TMDB API |
| Testing | Vitest |

## Getting Started

**Prerequisites:** Node.js 18+, a PostgreSQL database, and a TMDB API key.

```bash
git clone https://github.com/yaisnw/passerine.git
cd passerine
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

```env
DATABASE_URL=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
TMDB_API_KEY=
```

Run the database migration and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # start dev server
npm run test:run     # run tests
npm run lint         # lint
npx prisma studio    # open Prisma Studio
```

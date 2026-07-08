# Passerine

A movie and TV watchlist app. Search for films and shows, track your watch status, rate and review what you've seen, and browse what others are watching.

Built with Next.js 16, TypeScript, PostgreSQL, and the TMDB API.

**Live:** [passerine.vercel.app](https://passerine.vercel.app/)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-green?logo=postgresql)

## Features

- **Browse & Search** — Discover trending movies and shows, search the full TMDB catalog
- **Media details** — Cast, overview, runtime, budget/revenue (movies) or seasons/episodes (TV), and a backdrop lightbox
- **Watchlist** — Add titles with a status: Plan to Watch, Watching, Completed, or Dropped, editable from a dropdown
- **Reviews** — Rate anything marked Completed on a half-star scale (0.5–10) with an optional written review; edit or delete your review any time, with optimistic UI updates
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
# Database (Supabase)
DATABASE_URL=

# NextAuth v5
AUTH_SECRET=
AUTH_URL=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# TMDB API
TMDB_API_TOKEN=
```

Run the database migration and start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev             # start dev server
npm run build            # production build
npm run start            # start production server
npm run lint             # lint
npm run test             # run tests in watch mode
npm run test:run         # run tests once
npx prisma studio        # open Prisma Studio
npx prisma migrate dev   # run migrations
```

## Project structure

```
src/
  app/            App Router pages and layouts
    api/          API routes (auth, search)
    media/[type]/[id]/   Movie/TV details page
  actions/        Server actions (watchlist, reviews)
  components/
    ui/           shared/shadcn primitives
    layout/       navbar, etc.
    media/        media details, reviews, review dialogs
    watchlist/    add/remove/status/favorite controls
    profile/      profile grids (watchlist, favorites, reviews)
  lib/            auth config, db client, TMDB client, utilities
  generated/      Prisma client (generated, do not edit)
  test/           Vitest setup
prisma/
  schema.prisma   Data model
  migrations/     Migration history
```

## Data model

- **User** — account info; supports both OAuth and password-based accounts
- **Watchlist** — one row per (user, TMDB title): status, favorite flag, optional review
- **Review** — rating (0.5–10 in half-point steps) and optional text, one per watchlist entry

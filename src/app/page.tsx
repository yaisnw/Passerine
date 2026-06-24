import Link from "next/link"
import { BookMarked, Star, MessageSquare, ArrowRight, TrendingUp, ChevronRight } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { tmdbFetch } from "@/lib/tmdb"
import type { Movie, TvShow, TrendingResponse } from "@/lib/tmdb.types"
import Navbar from "@/components/layout/navbar"
import MediaCard from "@/components/media/media-card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MediaType } from "@/generated/prisma/enums"

const features = [
  {
    icon: BookMarked,
    label: "Watchlist",
    description: "Save movies you want to watch and never lose track again.",
  },
  {
    icon: Star,
    label: "Ratings",
    description: "Rate everything you've seen with a simple star score.",
  },
  {
    icon: MessageSquare,
    label: "Reviews",
    description: "Write and read reviews to remember what you thought.",
  },
]

export default async function Home() {
  const [session, trendingMovies, trendingTv] = await Promise.all([
    auth(),
    tmdbFetch<TrendingResponse<Movie>>("/trending/movie/week"),
    tmdbFetch<TrendingResponse<TvShow>>("/trending/tv/week"),
  ])

  const movies = trendingMovies.results.slice(0, 6)
  const shows = trendingTv.results.slice(0, 6)

  // Fetch watchlist for authenticated users and build a lookup map: `${tmdb_id}:${media_type}` -> watchlist_id
  let watchlistMap: Map<string, number> = new Map()
  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      const entries = await prisma.watchlist.findMany({
        where: { user_id: user.user_id },
        select: { watchlist_id: true, tmdb_id: true, media_type: true },
      })
      watchlistMap = new Map(entries.map((e) => [`${e.tmdb_id}:${e.media_type}`, e.watchlist_id]))
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        {session ? (
          /* ── Authenticated view ── */
          <section className="mx-auto w-full max-w-6xl px-6 py-12">
            <div className="mb-10">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Welcome back, {session.user?.name?.split(" ")[0]}.
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Here&apos;s what&apos;s trending this week.
              </p>
            </div>

            <MediaSection title="Trending movies" href="/movies" icon={TrendingUp} items={movies} watchlistMap={watchlistMap} isAuthenticated />
            <div className="mt-10">
              <MediaSection title="Trending TV shows" href="/shows" icon={TrendingUp} items={shows} watchlistMap={watchlistMap} isAuthenticated />
            </div>
          </section>
        ) : (
          /* ── Guest view ── */
          <>
            {/* Hero */}
            <section className="flex flex-col items-center px-6 py-24 text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Star className="size-3 fill-primary text-primary" />
                Powered by TMDB
              </div>

              <h1 className="max-w-2xl text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
                Track every movie
                <br />
                <span className="text-primary">you watch.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Build your watchlist, rate what you&apos;ve seen, and write reviews — all in one clean place.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/register" className={cn(buttonVariants({ size: "lg" }), "gap-2")}>
                  Get started free
                  <ArrowRight className="size-5" strokeWidth={1.75} />
                </Link>
                <Link href="/login" className={buttonVariants({ size: "lg", variant: "outline" })}>
                  Sign in
                </Link>
              </div>
            </section>

            {/* Feature cards */}
            <section className="mx-auto w-full max-w-4xl px-6 pb-16">
              <div className="grid gap-4 sm:grid-cols-3">
                {features.map(({ icon: Icon, label, description }) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-card p-6 text-left"
                  >
                    <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" strokeWidth={1.75} />
                    </div>
                    <h3 className="mb-1.5 text-sm font-semibold text-foreground">{label}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Trending preview */}
            <section className="mx-auto w-full max-w-6xl px-6 pb-24 flex flex-col gap-10">
              <MediaSection title="Trending movies" href="/movies" icon={TrendingUp} items={movies} />
              <MediaSection title="Trending TV shows" href="/shows" icon={TrendingUp} items={shows} />
            </section>
          </>
        )}
      </main>
    </>
  )
}

function MediaSection({
  title,
  href,
  icon: Icon,
  items,
  watchlistMap = new Map(),
  isAuthenticated = false,
}: {
  title: string
  href: string
  icon: React.ElementType
  items: (Movie | TvShow)[]
  watchlistMap?: Map<string, number>
  isAuthenticated?: boolean
}) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" strokeWidth={1.75} />
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}>
          View all
          <ChevronRight className="size-4" strokeWidth={1.75} />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => {
          const mediaType = "title" in item ? MediaType.MOVIE : MediaType.TV
          const watchlist_id = watchlistMap.get(`${item.id}:${mediaType}`) ?? null
          return (
            <MediaCard key={item.id} item={item} watchlist_id={watchlist_id} isAuthenticated={isAuthenticated} />
          )
        })}
      </div>
    </div>
  )
}

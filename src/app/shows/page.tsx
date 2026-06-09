import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { discoverTv } from "@/lib/tmdb"
import { MediaType } from "@/generated/prisma/enums"
import { TMDB_TV_SORT_MAP, type SortOption } from "@/lib/utils"
import Navbar from "@/components/layout/navbar"
import MediaCard from "@/components/media/media-card"
import Pagination from "@/components/ui/pagination"
import SortSelect from "@/components/ui/sort-select"

interface Props {
  searchParams: Promise<{ page?: string; sort?: string }>
}

export default async function ShowsPage({ searchParams }: Props) {
  const { page, sort } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const sortOption = (sort ?? "popularity") as SortOption
  const sortBy = TMDB_TV_SORT_MAP[sortOption] ?? TMDB_TV_SORT_MAP.popularity

  const [session, data] = await Promise.all([auth(), discoverTv(currentPage, sortBy)])

  const totalPages = Math.min(data.total_pages, 500)

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
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-2xl font-semibold text-foreground">TV Shows</h1>
            <p className="text-sm text-muted-foreground">
              {data.total_results.toLocaleString()} shows available
            </p>
          </div>
          <SortSelect value={sortOption} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.results.map((show) => {
            const watchlist_id = watchlistMap.get(`${show.id}:${MediaType.TV}`) ?? null
            return (
              <MediaCard
                key={show.id}
                item={show}
                watchlist_id={watchlist_id}
                isAuthenticated={!!session}
              />
            )
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(p) => `?sort=${sortOption}&page=${p}`}
        />
      </main>
    </>
  )
}

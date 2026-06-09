import { notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { searchMulti } from "@/lib/tmdb"
import { sortResults, type SortOption } from "@/lib/utils"
import { MediaType } from "@/generated/prisma/enums"
import Navbar from "@/components/layout/navbar"
import MediaCard from "@/components/media/media-card"
import Pagination from "@/components/ui/pagination"
import SortSelect from "@/components/ui/sort-select"

interface Props {
  searchParams: Promise<{ q?: string; page?: string; sort?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page, sort } = await searchParams
  const query = q?.trim()
  const currentPage = Math.max(1, Number(page) || 1)
  const sortOption = (sort ?? "popularity") as SortOption

  if (!query) notFound()

  const [session, data] = await Promise.all([auth(), searchMulti(query, currentPage)])
  const totalPages = Math.min(data.total_pages, 500)
  const results = sortResults(data.results, sortOption)

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
            <h1 className="mb-1 text-2xl font-semibold text-foreground">Search results</h1>
            <p className="text-sm text-muted-foreground">
              {data.total_results} results for &ldquo;{query}&rdquo;
            </p>
          </div>
          <SortSelect value={sortOption} />
        </div>

        {results.length === 0 ? (
          <p className="text-muted-foreground">No results found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((result) => {
              const watchlist_id = watchlistMap.get(`${result.id}:${result.media_type === "movie" ? MediaType.MOVIE : MediaType.TV}`) ?? null
              return (
                <MediaCard
                  key={`${result.media_type}-${result.id}`}
                  item={result}
                  watchlist_id={watchlist_id}
                  isAuthenticated={!!session}
                  showTypeBadge
                />
              )
            })}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          buildHref={(p) => `?${new URLSearchParams({ q: query, sort: sortOption, page: String(p) }).toString()}`}
        />
      </main>
    </>
  )
}

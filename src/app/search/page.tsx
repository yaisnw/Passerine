import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import Navbar from "@/components/layout/navbar"
import { searchMulti, tmdbImage } from "@/lib/tmdb"

interface Props {
  searchParams: Promise<{ q?: string; page?: string }>
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, page } = await searchParams
  const query = q?.trim()
  const currentPage = Math.max(1, Number(page) || 1)

  if (!query) notFound()

  const data = await searchMulti(query, currentPage)
  
  const results = data.results
  const totalPages = Math.min(data.total_pages, 20) // TMDB caps at page 1000, we cap at 20 for UX reasons
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-semibold text-foreground">
          Search results
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">
          {data.total_results} results for &ldquo;{query}&rdquo;
        </p>

        {results.length === 0 ? (
          <p className="text-muted-foreground">No results found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((result) => {
              const title = result.title ?? result.name ?? "Unknown"
              const year = (result.release_date ?? result.first_air_date)?.slice(0, 4)
              const href = `/media/${result.media_type}/${result.id}`
              return (
                <Link
                  key={`${result.media_type}-${result.id}`}
                  href={href}
                  className="group flex flex-col gap-2"
                >
                  <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl border border-border bg-muted transition-colors group-hover:border-primary">
                    {result.poster_path ? (
                      <Image
                        src={tmdbImage(result.poster_path, "w342")}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
                      {result.media_type === "movie" ? "Movie" : "TV"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5 px-0.5">
                    <p className="truncate text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {title}
                    </p>
                    {year && <p className="text-xs text-muted-foreground">{year}</p>}
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              const params = new URLSearchParams({ q: query, page: String(p) })
              return (
                <Link
                  key={p}
                  href={`?${params.toString()}`}
                  className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    p === currentPage
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}

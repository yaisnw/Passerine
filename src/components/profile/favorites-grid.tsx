"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Heart } from "lucide-react"
import SortDropdown from "@/components/ui/profile-sort"
import WatchlistCard from "@/components/watchlist/watchlist-card"

interface FavoriteEntry {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  tmdb_rating: number | null
  added_at: Date
}

const sortOptions = [
  { label: "Date Added", value: "added_at" },
  { label: "Title", value: "title" },
  { label: "TMDB Rating", value: "tmdb_rating" },
]

interface Props {
  entries: FavoriteEntry[]
  activeSort?: string
}

export default function FavoritesGrid({ entries, activeSort = "added_at" }: Props) {
  const [unfavorited, setUnfavorited] = useState<Set<number>>(new Set())
  const router = useRouter()
  const searchParams = useSearchParams()

  const items = entries.filter((e) => !unfavorited.has(e.watchlist_id))

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set(key, value)
    params.set("tab", "favorites")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex items-center justify-end">
        <SortDropdown options={sortOptions} active={activeSort} onChange={(value) => setParam("sort", value)} />
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <Heart className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">
            No favorites yet.{" "}
            <Link href="/" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
              Browse trending media
            </Link>{" "}
            and heart something.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {items.map((entry) => (
            <WatchlistCard
              key={entry.watchlist_id}
              {...entry}
              favorite={true}
              showFavorite
              onFavoriteToggle={(next) => {
                if (!next) setUnfavorited((prev) => new Set(prev).add(entry.watchlist_id))
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

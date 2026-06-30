"use client"

import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { tmdbImage } from "@/lib/tmdb"
import { WatchStatus } from "@/generated/prisma/enums"
import WatchStatusButton from "@/components/watchlist/watch-status-button"
import WatchlistRemoveButton from "@/components/watchlist/watchlist-remove-button"
import FavoriteButton from "@/components/watchlist/favorite-button"

interface Props {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  tmdb_rating: number | null
  added_at: Date
  status?: WatchStatus
  favorite?: boolean
  showStatus?: boolean
  showRemove?: boolean
  showFavorite?: boolean
  onRemove?: () => void
  onFavoriteToggle?: (next: boolean) => void
  onStatusChange?: (next: WatchStatus) => void
}

export default function WatchlistCard({
  watchlist_id,
  tmdb_id,
  media_type,
  title,
  poster_path,
  tmdb_rating,
  added_at,
  status,
  favorite = false,
  showStatus = false,
  showRemove = false,
  showFavorite = false,
  onRemove,
  onFavoriteToggle,
  onStatusChange,
}: Props) {
  const href = `/media/${media_type.toLowerCase()}/${tmdb_id}`

  return (
    <div className="group flex flex-col gap-2">
      <Link
        href={href}
        className="relative aspect-2/3 w-full overflow-hidden rounded-xl border-2 border-background bg-muted transition-colors duration-200 hover:border-primary block"
      >
        {poster_path ? (
          <Image
            src={tmdbImage(poster_path, "w342")}
            alt={title}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}

        {tmdb_rating != null && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="size-3 fill-primary text-primary" />
            <span className="text-xs font-medium text-foreground">{tmdb_rating.toFixed(1)}</span>
          </div>
        )}

        {(showRemove || showFavorite) && (
          <div className="relative">
            {showRemove && (
              <WatchlistRemoveButton watchlistId={watchlist_id} onRemove={onRemove} className="absolute top-2 right-2 z-10" />
            )}
            {showFavorite && (
              <FavoriteButton
                watchlist_id={watchlist_id}
                isFavorite={favorite}
                onToggle={onFavoriteToggle}
                className="absolute top-2 left-2 z-10"
              />
            )}
          </div>
        )}
      </Link>

      <Link
        href={href}
        className="truncate text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors"
      >
        {title}
      </Link>

      <p className="text-xs text-muted-foreground -mt-1">
        {new Date(added_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>

      {showStatus && status && (
        <WatchStatusButton
          watchlist_id={watchlist_id}
          status={status}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  )
}

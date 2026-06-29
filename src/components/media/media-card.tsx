import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { tmdbImage } from "@/lib/tmdb"
import type { MediaItem } from "@/lib/tmdb.types"
import type { SearchResult } from "@/lib/tmdb"
import { MediaType } from "@/generated/prisma/enums"
import WatchlistAddButton from "@/components/watchlist/watchlist-add-button"

interface MediaCardProps {
  item: MediaItem | SearchResult
  watchlist_id?: number | null
  isAuthenticated?: boolean
  showTypeBadge?: boolean
}

export default function MediaCard({ item, watchlist_id = null, isAuthenticated = false, showTypeBadge = false }: MediaCardProps) {
  const mediaTypeStr: "movie" | "tv" = item.media_type ?? ("title" in item ? "movie" : "tv")
  const title = "title" in item ? (item.title ?? "Unknown") : (item.name ?? "Unknown")
  const year = ("release_date" in item ? item.release_date : item.first_air_date)?.slice(0, 4)
  const rating = item.vote_average?.toFixed(1)
  const isMovie = mediaTypeStr === "movie"
  const href = `/media/${mediaTypeStr}/${item.id}`
  const mediaType = isMovie ? MediaType.MOVIE : MediaType.TV

  return (
    <Link href={href} className="group flex flex-col gap-3">
      {/* Poster */}
      <div className="relative aspect-2/3 overflow-hidden bg-muted border-2 border-background hover:border-primary rounded-xl transition-colors duration-200">
        {item.poster_path ? (
          <Image
            src={tmdbImage(item.poster_path, "w342")}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            loading="eager"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}

        {/* Bottom-left badges */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          {showTypeBadge && (
            <span className="rounded-md bg-background/80 px-1.5 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
              {isMovie ? "Movie" : "TV"}
            </span>
          )}
          {rating && (
            <div className="flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
              <Star className="size-3 fill-primary text-primary" />
              <span className="text-xs font-medium text-foreground">{rating.includes("0") ? "N/A" : rating}</span>
            </div>
          )}
        </div>

        {/* Watchlist button */}
        {isAuthenticated && (
          <div className="absolute top-2 right-2">
            <WatchlistAddButton
              tmdb_id={item.id}
              media_type={mediaType}
              title={title}
              poster_path={item.poster_path ?? ""}
              tmdb_rating={item.vote_average ?? undefined}
              watchlist_id={watchlist_id}
              variant="icon"
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-0.5">
        <p className="truncate text-sm font-medium text-foreground leading-snug">
          {title}
        </p>
        {year && (
          <p className="text-xs text-muted-foreground">{year}</p>
        )}
      </div>
    </Link>
  )
}

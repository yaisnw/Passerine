import Image from "next/image"
import { Star } from "lucide-react"
import { tmdbImage } from "@/lib/tmdb"
import type { MediaItem } from "@/lib/tmdb.types"

interface MediaCardProps {
  item: MediaItem
}

export default function MediaCard({ item }: MediaCardProps) {
  const title = "title" in item ? item.title : item.name
  const year = ("release_date" in item ? item.release_date : item.first_air_date)?.slice(0, 4)
  const rating = item.vote_average?.toFixed(1)

  return (
    <div className="group flex flex-col gap-3 ">
      {/* Poster */}
      <div className="relative aspect-2/3 overflow-hidden bg-muted border-2 border-transparent hover:border-primary rounded-xl transition-colors duration-200">
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

        {/* Rating badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
          <Star className="size-3 fill-primary text-primary" />
          <span className="text-xs font-medium text-foreground">{rating}</span>
        </div>
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
    </div>
  )
}

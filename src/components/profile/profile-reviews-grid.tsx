import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { tmdbImage } from "@/lib/tmdb"
import WriteReviewSheet from "@/components/media/write-review-sheet"

interface ReviewEntry {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  rating: number
  review_text: string | null
}

interface Props {
  entries: ReviewEntry[]
}

export default function ProfileReviewsGrid({ entries }: Props) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Mark media as completed to write a review.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map((entry) => {
        const href = `/media/${entry.media_type.toLowerCase()}/${entry.tmdb_id}`
        return (
          <div key={entry.watchlist_id} className="flex gap-4 rounded-xl border border-border bg-card p-3">
            <Link href={href} className="shrink-0 relative w-30 aspect-2/3 overflow-hidden rounded-lg bg-muted">
              <div className="absolute inset-0">
                {entry.poster_path ? (
                  <Image
                    src={tmdbImage(entry.poster_path, "w185")}
                    alt={entry.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs">?</div>
                )}
              </div>
            </Link>
            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <Link href={href} className="truncate text-xl font-medium text-foreground hover:text-primary transition-colors">
                  {entry.title}
                </Link>
                <div className="shrink-0">
                  <WriteReviewSheet
                    watchlistId={entry.watchlist_id}
                    mediaTitle={entry.title}
                    existingRating={entry.rating}
                    existingReview={entry.review_text ?? undefined}
                    tmdbId={entry.tmdb_id}
                    mediaType={entry.media_type}
                  />
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const n = i + 1
                  const full = entry.rating >= n
                  const half = !full && entry.rating >= n - 0.5
                  return (
                    <span key={i} className="relative size-4">
                      <Star className="absolute inset-0 size-4 text-muted-foreground" />
                      {(full || half) && (
                        <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                          <Star className="size-4 fill-primary text-primary" />
                        </span>
                      )}
                    </span>
                  )
                })}
              </div>
              {entry.review_text && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{entry.review_text}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

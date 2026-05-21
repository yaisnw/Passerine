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
    <div className="flex flex-col gap-3 ">
      {entries.map((entry) => {
        const href = `/media/${entry.media_type.toLowerCase()}/${entry.tmdb_id}`
        return (
          <div key={entry.watchlist_id} className="relative flex gap-4 rounded-xl border border-border bg-card p-3">
            <Link href={href} className="shrink-0 relative w-16 aspect-2/3 overflow-hidden rounded-lg bg-muted">
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
              <div className="flex items-center gap-2 pr-28">
                <Link href={href} className="truncate text-xl font-medium text-foreground hover:text-primary transition-colors">
                  {entry.title}
                </Link>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-5 ${i < entry.rating ? "fill-primary text-primary" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              {entry.review_text && (
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{entry.review_text}</p>
              )}
            </div>
            <div className="absolute top-3 right-3">
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
        )
      })}
    </div>
  )
}

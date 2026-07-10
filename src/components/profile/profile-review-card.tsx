"use client"

import { useOptimistic } from "react"
import Image from "next/image"
import Link from "next/link"
import { tmdbImage } from "@/lib/tmdb"
import WriteReviewSheet from "@/components/media/write-review-sheet"
import DeleteReviewButton from "@/components/media/delete-review-button"
import StarRating from "@/components/media/star-rating"

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
  entry: ReviewEntry
  onDeleted?: () => void
}

export default function ProfileReviewCard({ entry, onDeleted }: Props) {
  const [review, setReview] = useOptimistic({ rating: entry.rating, review_text: entry.review_text })
  const href = `/media/${entry.media_type.toLowerCase()}/${entry.tmdb_id}`

  function handleSaved(rating: number, reviewText?: string) {
    setReview({ rating, review_text: reviewText ?? null })
  }

  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-3">
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
          <div className="flex shrink-0 gap-2">
            <WriteReviewSheet
              watchlistId={entry.watchlist_id}
              mediaTitle={entry.title}
              existingRating={review.rating}
              existingReview={review.review_text ?? undefined}
              tmdbId={entry.tmdb_id}
              mediaType={entry.media_type}
              onSaved={handleSaved}
            />
            <DeleteReviewButton watchlistId={entry.watchlist_id} onDeleted={onDeleted} />
          </div>
        </div>
        <StarRating rating={review.rating} size="sm" />
        {review.review_text && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{review.review_text}</p>
        )}
      </div>
    </div>
  )
}

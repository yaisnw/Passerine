"use client"

import { useOptimistic } from "react"
import { Star } from "lucide-react"
import { WatchStatus } from "@/generated/prisma/enums"
import WriteReviewSheet from "@/components/media/write-review-sheet"
import DeleteReviewButton from "@/components/media/delete-review-button"

interface Review {
  rating: number
  review_text: string | null
}

interface Props {
  watchlistId: number
  watchlistStatus: WatchStatus | null
  mediaTitle: string
  tmdbId: number
  mediaType: string
  existingReview: Review | null
}

export default function YourReviewSection({
  watchlistId,
  watchlistStatus,
  mediaTitle,
  tmdbId,
  mediaType,
  existingReview,
}: Props) {
  const [review, setReview] = useOptimistic<Review | null>(existingReview)

  function handleSaved(rating: number, reviewText?: string) {
    setReview({ rating, review_text: reviewText ?? null })
  }

  function handleDeleted() {
    setReview(null)
  }

  return (
    <>
      {review && (
        <div className="mb-4 rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 10 }).map((_, i) => {
              const n = i + 1
              const full = review.rating >= n
              const half = !full && review.rating >= n - 0.5
              return (
                <span key={i} className="relative size-5">
                  <Star className="absolute inset-0 size-5 text-muted-foreground" />
                  {(full || half) && (
                    <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                      <Star className="size-5 fill-primary text-primary" />
                    </span>
                  )}
                </span>
              )
            })}
            <span className="ml-1.5 text-xs text-muted-foreground">{review.rating} / 10</span>
          </div>
          {review.review_text && (
            <p className="text-sm leading-relaxed text-foreground/80">{review.review_text}</p>
          )}
        </div>
      )}
      {(watchlistStatus === "COMPLETED" || review) ? (
        <div className="flex flex-wrap gap-2">
          <WriteReviewSheet
            watchlistId={watchlistId}
            mediaTitle={mediaTitle}
            existingRating={review?.rating}
            existingReview={review?.review_text ?? undefined}
            tmdbId={tmdbId}
            mediaType={mediaType}
            onSaved={handleSaved}
          />
          {review && <DeleteReviewButton watchlistId={watchlistId} onDeleted={handleDeleted} />}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Mark as completed to write a review
        </p>
      )}
    </>
  )
}

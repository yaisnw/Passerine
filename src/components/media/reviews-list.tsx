"use client"

import { useOptimistic } from "react"
import { UserCircle2 } from "lucide-react"
import Image from "next/image"
import WriteReviewSheet from "@/components/media/write-review-sheet"
import DeleteReviewButton from "@/components/media/delete-review-button"
import StarRating from "@/components/media/star-rating"

interface ReviewItem {
  review_id: number
  rating: number
  review_text: string | null
  reviewed_at: Date
  isOwn: boolean
  user: { name: string; avatar_url: string } | null
}

interface Props {
  reviews: ReviewItem[]
  watchlistId: number | null
  mediaTitle: string
  tmdbId: number
  mediaType: string
}

export default function ReviewsList({ reviews: initialReviews, watchlistId, mediaTitle, tmdbId, mediaType }: Props) {
  const [reviews, setReviews] = useOptimistic(initialReviews)
  const ownReview = reviews.find((r) => r.isOwn)

  function handleSaved(rating: number, reviewText?: string) {
    setReviews((prev) => {
      if (ownReview) {
        return prev.map((r) => (r.isOwn ? { ...r, rating, review_text: reviewText ?? null } : r))
      }
      return [
        { review_id: -1, rating, review_text: reviewText ?? null, reviewed_at: new Date(), isOwn: true, user: null },
        ...prev,
      ]
    })
  }

  function handleDeleted() {
    setReviews((prev) => prev.filter((r) => !r.isOwn))
  }

  return (
    <div className="flex flex-col gap-3">
      {watchlistId && (
        <div className="flex flex-wrap gap-2">
          <WriteReviewSheet
            watchlistId={watchlistId}
            mediaTitle={mediaTitle}
            existingRating={ownReview?.rating}
            existingReview={ownReview?.review_text ?? undefined}
            tmdbId={tmdbId}
            mediaType={mediaType}
            onSaved={handleSaved}
          />
          {ownReview && <DeleteReviewButton watchlistId={watchlistId} onDeleted={handleDeleted} />}
        </div>
      )}

      {reviews.map((review, i) => (
        <div key={review.review_id}>
          <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {review.user?.avatar_url ? (
                  <Image
                    src={review.user.avatar_url}
                    alt={review.user.name}
                    width={24}
                    height={24}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="size-8 text-muted-foreground" strokeWidth={1.75} />
                )}
                <span className="text-lg font-medium text-foreground leading-none">
                  {review.isOwn ? "You" : review.user?.name ?? "User"}
                </span>
              </div>
              <StarRating rating={review.rating} size="sm" showLabel />
            </div>
            {review.review_text && (
              <p className="text-sm text-foreground/80 leading-relaxed">{review.review_text}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(review.reviewed_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
          {review.isOwn && i < reviews.length - 1 && (
            <hr className="mt-3 border-primary
            " />
          )}
        </div>
      ))}
    </div>
  )
}

import Link from "next/link"
import { prisma } from "@/lib/db"
import { MediaType } from "@/generated/prisma/enums"
import ReviewsList from "@/components/media/reviews-list"

const PER_PAGE = 5

interface Props {
  tmdbId: number
  mediaType: MediaType
  currentUserId?: number
  watchlistId: number | null
  mediaTitle: string
  mediaTypeParam: string
  page: number
}

export default async function MediaReviews({ tmdbId, mediaType, currentUserId, watchlistId, mediaTitle, mediaTypeParam, page }: Props) {
  const baseWhere = { watchlist: { tmdb_id: tmdbId, media_type: mediaType } }
  const othersWhere = { ...baseWhere, ...(currentUserId ? { NOT: { user_id: currentUserId } } : {}) }

  const [ownReview, others, othersTotal] = await Promise.all([
    currentUserId
      ? prisma.review.findFirst({
          where: { ...baseWhere, user_id: currentUserId },
          select: { review_id: true, rating: true, review_text: true, reviewed_at: true },
        })
      : null,
    prisma.review.findMany({
      where: othersWhere,
      orderBy: { rating: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        review_id: true,
        rating: true,
        review_text: true,
        reviewed_at: true,
        user: { select: { name: true, avatar_url: true } },
      },
    }),
    prisma.review.count({ where: othersWhere }),
  ])

  const total = othersTotal + (ownReview ? 1 : 0)

  if (total === 0 && !watchlistId) return (
    <section className="mt-14">
      <h2 className="mb-5 text-base font-semibold text-foreground">Reviews</h2>
      <p className="text-sm text-muted-foreground">No reviews yet. Be the first to write one by adding this to your watchlist.</p>
    </section>
  )

  const totalPages = Math.ceil(othersTotal / PER_PAGE)

  const reviews = [
    ...(ownReview && page === 1 ? [{ ...ownReview, isOwn: true, user: null }] : []),
    ...others.map((r) => ({ ...r, isOwn: false })),
  ]

  return (
    <section className="mt-14">
      <h2 className="mb-5 text-base font-semibold text-foreground">
        Reviews {total > 0 && <span className="text-muted-foreground font-normal text-sm">({total})</span>}
      </h2>

      <ReviewsList
        reviews={reviews}
        watchlistId={watchlistId}
        mediaTitle={mediaTitle}
        tmdbId={tmdbId}
        mediaType={mediaTypeParam}
      />

      {total === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">No reviews yet. Be the first to write one.</p>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => {
            const p = i + 1
            const params = new URLSearchParams()
            params.set("page", String(p))
            return (
              <Link
                key={p}
                href={`?${params.toString()}`}
                className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
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
    </section>
  )
}

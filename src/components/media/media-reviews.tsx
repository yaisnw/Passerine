import Image from "next/image"
import Link from "next/link"
import { Star, UserCircle2 } from "lucide-react"
import { prisma } from "@/lib/db"
import { MediaType } from "@/generated/prisma/enums"

const PER_PAGE = 5

interface Props {
  tmdbId: number
  mediaType: MediaType
  currentUserId?: number
  page: number
}

export default async function MediaReviews({ tmdbId, mediaType, currentUserId, page }: Props) {
  const where = {
    watchlist: { tmdb_id: tmdbId, media_type: mediaType },
    ...(currentUserId ? { NOT: { user_id: currentUserId } } : {}),
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { rating: "desc" },
      // this is the "offset" in sql, it just skips the amount written here
      skip: (page - 1) * PER_PAGE,
      //this is the "limit" in sql
      take: PER_PAGE,
      select: {
        review_id: true,
        rating: true,
        review_text: true,
        reviewed_at: true,
        user: { select: { name: true, avatar_url: true } },
      },
    }),
    prisma.review.count({ where }),
  ])

  if (total === 0) return (
    <section className="mt-14">
      <h2 className="mb-5 text-base font-semibold text-foreground">Reviews</h2>
      <p className="text-sm text-muted-foreground">No reviews yet. Be the first to write one.</p>
    </section>
  )

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <section className="mt-14">
      <h2 className="mb-5 text-base font-semibold text-foreground">
        Reviews <span className="text-muted-foreground font-normal text-sm">({total})</span>
      </h2>

      <div className="flex flex-col gap-3">
        {reviews.map((review) => (
          <div key={review.review_id} className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2">
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
                <span className="text-lg font-medium text-foreground leading-none">{review.user?.name ?? "User"}</span>
              </div>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 10 }).map((_, i) => {
                  const n = i + 1
                  const full = review.rating >= n
                  const half = !full && review.rating >= n - 0.5
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
                <span className="ml-1.5 text-xs text-muted-foreground">{review.rating} / 10</span>
              </div>
            </div>
            {review.review_text && (
              <p className="text-sm text-foreground/80 leading-relaxed">{review.review_text}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(review.reviewed_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
          </div>
        ))}
      </div>

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

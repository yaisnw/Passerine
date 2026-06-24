export const dynamic = "force-dynamic"

import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Star, Clock, Calendar, Globe, BarChart2, Tv } from "lucide-react"
import Navbar from "@/components/layout/navbar"
import BackdropLightbox from "@/components/media/backdrop-lightbox"
import WatchlistAddButton from "@/components/watchlist/watchlist-add-button"
import WriteReviewSheet from "@/components/media/write-review-sheet"
import MediaReviews from "@/components/media/media-reviews"
import BackButton from "@/components/ui/back-button"
import { getMovieDetails, getMovieCredits, getTvDetails, getTvCredits, tmdbImage } from "@/lib/tmdb"
import type { MediaType, MovieDetails, TvDetails } from "@/lib/tmdb.types"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { MediaType as PrismaMediaType } from "@/generated/prisma/enums"

interface Props {
  params: Promise<{ type: string; id: string }>
  searchParams: Promise<{ page?: string }>
}

export default async function MediaPage({ params, searchParams }: Props) {
  const { type, id } = await params
  const { page } = await searchParams
  const currentPage = Math.max(1, Number(page) || 1)
  const mediaId = Number(id)

  if (isNaN(mediaId) || (type !== "movie" && type !== "tv")) notFound()

  const mediaType = type as MediaType

  const session = await auth()

  const [media, credits] = await Promise.all([
    mediaType === "movie"
      ? getMovieDetails(mediaId).catch(() => null)
      : getTvDetails(mediaId).catch(() => null),
    mediaType === "movie"
      ? getMovieCredits(mediaId).catch(() => null)
      : getTvCredits(mediaId).catch(() => null),
  ])

  let watchlist_id: number | null = null
  let watchlistStatus: import("@/generated/prisma/enums").WatchStatus | null = null
  let existingReview: { rating: number; review_text: string | null } | null = null
  let currentUserId: number | undefined

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } })
    if (user) {
      const entry = await prisma.watchlist.findUnique({
        where: {
          user_id_tmdb_id_media_type: {
            user_id: user.user_id,
            tmdb_id: mediaId,
            media_type: mediaType === "movie" ? PrismaMediaType.MOVIE : PrismaMediaType.TV,
          },
        },
        select: { watchlist_id: true, status: true, review: { select: { rating: true, review_text: true } } },
      })
      currentUserId = user.user_id
      watchlist_id = entry?.watchlist_id ?? null
      watchlistStatus = entry?.status ?? null
      existingReview = entry?.review ?? null
    }
  }
  if (!media) notFound()

  const isMovie = mediaType === "movie"
  const movieData = isMovie ? (media as MovieDetails) : null
  const tvData = !isMovie ? (media as TvDetails) : null

  const title = isMovie ? movieData!.title : tvData!.name
  const date = isMovie ? movieData!.release_date : tvData!.first_air_date
  const year = date?.slice(0, 4)
  const rating = media.vote_average?.toFixed(1)
  const cast = credits?.cast.slice(0, 12) ?? []

  const runtime = isMovie && movieData!.runtime
    ? `${Math.floor(movieData!.runtime! / 60)}h ${movieData!.runtime! % 60}m`
    : !isMovie && tvData!.episode_run_time?.[0]
      ? `~${tvData!.episode_run_time[0]}m / ep`
      : null

  const details = [
    {
      label: "Original language",
      value: new Intl.DisplayNames(["en"], { type: "language" }).of(media.original_language),
    },
    {
      label: isMovie ? "Release date" : "First aired",
      value: date
        ? new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "—",
    },
    ...(isMovie
      ? [
        {
          label: "Budget",
          value: movieData!.budget > 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(movieData!.budget)
            : "—",
        },
        {
          label: "Revenue",
          value: movieData!.revenue > 0
            ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(movieData!.revenue)
            : "—",
        },
      ]
      : [
        { label: "Seasons", value: String(tvData!.number_of_seasons) },
        { label: "Episodes", value: String(tvData!.number_of_episodes) },
      ]),
  ]

  return (
    <>
      <Navbar />
      <main className="relative flex flex-1 flex-col">
        {/* Full-page backdrop background */}
        {media.backdrop_path && (
          <div className="fixed inset-0 -z-10">
            <Image
              src={tmdbImage(media.backdrop_path, "w1280")}
              alt=""
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 100vw, 1280px"
            />
            <div className="absolute inset-0 bg-background/85" />
          </div>
        )}

        {/* Main content */}
        <div className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="my-8">
            <BackButton />
          </div>
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-10">
            {/* Poster */}
            <div className="shrink-0 self-start relative z-10 mx-auto sm:mx-0">
              <div className="relative w-40 aspect-2/3 overflow-hidden rounded-xl border-2 border-border bg-muted shadow-2xl sm:w-48">
                {media.poster_path ? (
                  <Image
                    src={tmdbImage(media.poster_path, "w342")}
                    alt={title}
                    fill
                    priority
                    className="object-cover"
                    sizes="192px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-5">
              {/* Title + tagline */}
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  {!isMovie && <Tv className="size-4 text-muted-foreground" strokeWidth={1.75} />}
                  <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                    {title}
                  </h1>
                </div>
                {media.tagline && (
                  <p className="text-sm italic text-muted-foreground">
                    &ldquo;{media.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="size-4 fill-primary text-primary" strokeWidth={1.75} />
                  <span className="font-medium text-foreground">{rating.includes("0") ? "N/A" : rating}</span>
                  <span>({media.vote_count.toLocaleString()} votes)</span>
                </span>
                {year && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-4" strokeWidth={1.75} />
                    {date >= new Date().toISOString() ? "Unreleased" : year}
                  </span>
                )}
                {runtime && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4" strokeWidth={1.75} />
                    {runtime}
                  </span>
                )}
                {media.status && (
                  <span className="flex items-center gap-1.5">
                    <BarChart2 className="size-4" strokeWidth={1.75} />
                    {media.status}
                  </span>
                )}
                {media.homepage && (
                  <a
                    href={media.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-foreground hover:text-primary transition-colors"
                  >
                    <Globe className="size-4" strokeWidth={1.75} />
                    Watch here
                  </a>
                )}
              </div>

              {/* Genres */}
              {media.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {media.genres.map((g) => (
                    <span
                      key={g.id}
                      className="rounded-full border border-border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              {media.overview && (
                <p className="max-w-2xl text-sm leading-relaxed text-foreground">
                  {media.overview}
                </p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-start gap-2 pt-1">
                {session && (
                  <WatchlistAddButton
                    tmdb_id={mediaId}
                    media_type={mediaType === "movie" ? PrismaMediaType.MOVIE : PrismaMediaType.TV}
                    title={title}
                    poster_path={media.poster_path ?? ""}
                    watchlist_id={watchlist_id}
                    status={watchlistStatus}
                  />
                )}
                {session && (watchlistStatus === "COMPLETED" || existingReview) && watchlist_id && (
                  <WriteReviewSheet
                    watchlistId={watchlist_id}
                    mediaTitle={title}
                    existingRating={existingReview?.rating}
                    existingReview={existingReview?.review_text ?? undefined}
                    tmdbId={mediaId}
                    mediaType={mediaType}
                  />
                )}
                {media.backdrop_path && (
                  <BackdropLightbox
                    src={tmdbImage(media.backdrop_path, "original")}
                    alt={title}
                  />
                )}
              </div>
              {session && watchlistStatus !== "COMPLETED" && watchlist_id && (
                <p className="text-xs text-muted-foreground">
                  Mark as completed to write a review
                </p>
              )}
            </div>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-5 text-base font-semibold text-foreground">Cast</h2>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12">
                {cast.map((member) => (
                  <a
                    key={member.id}
                    href={`https://www.google.com/search?q=${encodeURIComponent(member.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col gap-1.5"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-lg bg-muted border border-border transition-colors group-hover:border-primary">
                      {member.profile_path ? (
                        <Image
                          src={tmdbImage(member.profile_path, "w185")}
                          alt={member.name}
                          fill
                          loading="lazy"
                          className="object-cover object-center aspect-video transition-transform duration-300 group-hover:scale-105"
                          sizes="140px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                          ?
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="truncate text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.character}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Details grid */}
          <section className="mt-14">
            <h2 className="mb-5 text-base font-semibold text-foreground">Details</h2>
            <div className="grid gap-px rounded-xl border border-border overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4">
              {details.map(({ label, value }) => (
                <div key={label} className="flex flex-col gap-1 bg-card px-5 py-4">
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Your review */}
          {existingReview && (
            <section className="mt-14">
              <h2 className="mb-5 text-base font-semibold text-foreground">Your review</h2>
              <div className="rounded-xl border border-border bg-card px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 10 }).map((_, i) => {
                    const n = i + 1
                    const full = existingReview.rating >= n
                    const half = !full && existingReview.rating >= n - 0.5
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
                  <span className="ml-1.5 text-xs text-muted-foreground">{existingReview.rating} / 10</span>
                </div>
                {existingReview.review_text && (
                  <p className="text-sm leading-relaxed text-foreground/80">{existingReview.review_text}</p>
                )}
              </div>
            </section>
          )}

          <MediaReviews
            tmdbId={mediaId}
            mediaType={mediaType === "movie" ? PrismaMediaType.MOVIE : PrismaMediaType.TV}
            currentUserId={currentUserId}
            page={currentPage}
          />
        </div>
      </main>
    </>
  )
}

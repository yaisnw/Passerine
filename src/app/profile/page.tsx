export const dynamic = "force-dynamic"

import Image from "next/image"
import { redirect } from "next/navigation"
import { UserCircle2, Bookmark, Star, Pen } from "lucide-react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Navbar from "@/components/layout/navbar"
import BackButton from "@/components/ui/back-button"
import WatchlistGrid from "@/components/profile/watchlist-grid"
import ProfileReviewsGrid from "@/components/profile/profile-reviews-grid"
import ProfileTabs from "@/components/profile/profile-tabs"
import { WatchStatus } from "@/generated/prisma/enums"

interface Props {
  searchParams: Promise<{ tab?: string; status?: string; sort?: string }>
}

export default async function ProfilePage({ searchParams }: Props) {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const { tab = "watchlist", status, sort = "added_at" } = await searchParams

  const statusFilter = Object.values(WatchStatus).includes(status as WatchStatus)
    ? (status as WatchStatus)
    : undefined

  const orderByMap = {
    title: { title: "asc" as const },
    tmdb_rating: { tmdb_rating: "desc" as const },
    added_at: { added_at: "desc" as const },
  }

  const orderBy = orderByMap[sort as keyof typeof orderByMap] ?? orderByMap.added_at


  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) redirect("/login")

  const [watchlist, totalCount, completedCount, reviewCount] = await Promise.all([
    prisma.watchlist.findMany({
      where: { user_id: user.user_id, ...(statusFilter ? { status: statusFilter } : {}) },
      orderBy,
      include: { review: { select: { rating: true, review_text: true } } },
    }),
    prisma.watchlist.count({ where: { user_id: user.user_id } }),
    prisma.watchlist.count({ where: { user_id: user.user_id, status: WatchStatus.COMPLETED } }),
    prisma.review.count({ where: { user_id: user.user_id } }),
  ])

  const reviewEntries = watchlist
    .filter((e) => e.review !== null)
    .map((e) => ({
      watchlist_id: e.watchlist_id,
      tmdb_id: e.tmdb_id,
      media_type: e.media_type,
      title: e.title,
      poster_path: e.poster_path,
      rating: e.review!.rating,
      review_text: e.review!.review_text,
    }))

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-6 ">
        <BackButton />
        {/* Profile header */}
        <div className="mb-10 flex items-center gap-5">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={user.name}
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            <UserCircle2 className="size-16 text-muted-foreground" strokeWidth={1.75} />
          )}
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-10 grid grid-cols-3 gap-4 sm:grid-cols-3 md:w-fit md:flex md:gap-6">
          <Stat label="Watchlist" value={totalCount} icon={Bookmark} />
          <Stat label="Completed" value={completedCount} icon={Star} />
          <Stat label="Reviews" value={reviewCount} icon={Pen} />
        </div>

        {/* Tabs */}
        <ProfileTabs active={tab} />

        {tab === "watchlist" && <WatchlistGrid entries={watchlist} activeStatus={status} activeSort={sort} />}
        {tab === "reviews" && <ProfileReviewsGrid entries={reviewEntries} />}
      </main>
    </>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="flex flex-col justify-center items-center gap- rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex gap-4 items-center justify-center">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="size-5  text-primary" strokeWidth={1.75} />
        </div>
        <p className="text-xl size-5 text-center font-semibold leading-none text-foreground">{value}</p>
      </div>
      <div>
        <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

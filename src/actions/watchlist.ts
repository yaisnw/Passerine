"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { MediaType, WatchStatus } from "@/generated/prisma/enums"
import { revalidatePath } from "next/cache"

export async function submitReview(watchlist_id: number, rating: number, review_text?: string) {
  const user = await getUser()

  const entry = await prisma.watchlist.findUnique({
    where: { watchlist_id, user_id: user.user_id },
    select: { status: true },
  })

  if (!entry) throw new Error("Watchlist entry not found")
  if (entry.status !== WatchStatus.COMPLETED) throw new Error("Media must be completed to review")
  if (review_text && review_text.length > 1000) throw new Error("Review must be 1000 characters or less")

  await prisma.review.upsert({
    where: { watchlist_id },
    create: { watchlist_id, user_id: user.user_id, rating, review_text },
    update: { rating, review_text },
  })

  revalidatePath("/")
}

async function getUser() {
  const session = await auth()
  if (!session?.user?.email) throw new Error("Unauthenticated")
  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) throw new Error("User not found")
  return user
}

export async function addToWatchlist(data: {
  tmdb_id: number
  media_type: MediaType
  title: string
  poster_path: string
}) {
  const user = await getUser()

  await prisma.watchlist.upsert({
    where: {
      user_id_tmdb_id_media_type: {
        user_id: user.user_id,
        tmdb_id: data.tmdb_id,
        media_type: data.media_type,
      },
    },
    create: {
      user_id: user.user_id,
      tmdb_id: data.tmdb_id,
      media_type: data.media_type,
      title: data.title,
      poster_path: data.poster_path,
      status: WatchStatus.PLAN_TO_WATCH,
    },
    update: {},
  })

  revalidatePath("/")
}

export async function removeFromWatchlist(watchlist_id: number) {
  const user = await getUser()

  await prisma.watchlist.delete({
    where: { watchlist_id, user_id: user.user_id },
  })

  revalidatePath("/")
}

export async function updateWatchStatus(watchlist_id: number, status: WatchStatus) {
  const user = await getUser()

  await prisma.watchlist.update({
    where: { watchlist_id, user_id: user.user_id },
    data: { status },
  })

  revalidatePath("/")
}

export async function toggleFavorite(watchlist_id: number) {
  const user = await getUser()

  const entry = await prisma.watchlist.findUnique({ where: { watchlist_id } })
  if (!entry || entry.user_id !== user.user_id) throw new Error("Not found")

  await prisma.watchlist.update({
    where: { watchlist_id },
    data: { favorite: !entry.favorite },
  })

  revalidatePath("/")
}

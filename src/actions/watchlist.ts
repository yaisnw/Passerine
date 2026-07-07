"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { MediaType, WatchStatus } from "@/generated/prisma/enums"
import { revalidatePath } from "next/cache"

export async function submitReview(watchlist_id: number, rating: number, review_text?: string): Promise<string | null> {
  try {
    const user = await getUser()

    const entry = await prisma.watchlist.findUnique({
      where: { watchlist_id, user_id: user.user_id },
      select: { status: true },
    })

    if (!entry) return "Watchlist entry not found"
    if (entry.status !== WatchStatus.COMPLETED) return "Media must be completed to review"
    if (review_text && review_text.length > 1000) return "Review must be 1000 characters or less"

    await prisma.review.upsert({
      where: { watchlist_id },
      create: { watchlist_id, user_id: user.user_id, rating, review_text },
      update: { rating, review_text: review_text ?? null },
    })

    revalidatePath("/", "layout")
    return null
  } catch {
    return "Something went wrong. Please try again."
  }
}

export async function deleteReview(watchlist_id: number): Promise<string | null> {
  try {
    const user = await getUser()
    const entry = await prisma.watchlist.findUnique({
      where: { watchlist_id, user_id: user.user_id },
      select: { watchlist_id: true },
    })
    if (!entry) return "Watchlist entry not found"

    await prisma.review.delete({ where: { watchlist_id } })
    revalidatePath("/", "layout")
    return null
  } catch {
    return "Failed to delete review"
  }
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
  tmdb_rating?: number
  status?: WatchStatus
}): Promise<string | null> {
  try {
    const user = await getUser()
    await prisma.watchlist.upsert({
      where: { user_id_tmdb_id_media_type: { user_id: user.user_id, tmdb_id: data.tmdb_id, media_type: data.media_type } },
      create: { user_id: user.user_id, tmdb_id: data.tmdb_id, media_type: data.media_type, title: data.title, poster_path: data.poster_path, status: data.status ?? WatchStatus.PLAN_TO_WATCH, tmdb_rating: data.tmdb_rating },
      update: { tmdb_rating: data.tmdb_rating },
    })
    revalidatePath("/", "layout")
    return null
  } catch {
    return "Failed to add to watchlist"
  }
}

export async function removeFromWatchlist(watchlist_id: number): Promise<string | null> {
  try {
    const user = await getUser()
    await prisma.watchlist.delete({ where: { watchlist_id, user_id: user.user_id } })
    revalidatePath("/", "layout")
    return null
  } catch {
    return "Failed to remove from watchlist"
  }
}

export async function updateWatchStatus(watchlist_id: number, status: WatchStatus): Promise<string | null> {
  try {
    const user = await getUser()
    await prisma.watchlist.update({ where: { watchlist_id, user_id: user.user_id }, data: { status } })
    revalidatePath("/", "layout")
    return null
  } catch {
    return "Failed to update status"
  }
}

export async function toggleFavorite(watchlist_id: number): Promise<string | null> {
  try {
    const user = await getUser()
    const entry = await prisma.watchlist.findUnique({ where: { watchlist_id } })
    if (!entry || entry.user_id !== user.user_id) return "Not found"
    await prisma.watchlist.update({ where: { watchlist_id }, data: { favorite: !entry.favorite } })
    revalidatePath("/", "layout")
    return null
  } catch {
    return "Failed to update"
  }
}

"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { MediaType, WatchStatus } from "@/generated/prisma"

export async function addToWatchlist(data: {
  tmdb_id: number
  media_type: MediaType
  title: string
  poster_path: string
}) {}

export async function removeFromWatchlist(watchlist_id: number) {}

export async function updateWatchStatus(watchlist_id: number, status: WatchStatus) {}

export async function toggleFavorite(watchlist_id: number) {}

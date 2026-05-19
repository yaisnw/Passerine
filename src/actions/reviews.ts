"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function createReview(data: {
  watchlist_id: number
  rating: number
  review_text?: string
}) {}

export async function updateReview(review_id: number, data: {
  rating?: number
  review_text?: string
}) {}

export async function deleteReview(review_id: number) {}

"use client"

import { useState } from "react"
import ProfileReviewCard from "@/components/profile/profile-review-card"
import Link from "next/link"

interface ReviewEntry {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  rating: number
  review_text: string | null
}

interface Props {
  entries: ReviewEntry[]
}

export default function ProfileReviewsGrid({ entries }: Props) {
  const [removed, setRemoved] = useState<Set<number>>(new Set())
  const items = entries.filter((e) => !removed.has(e.watchlist_id))

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Write your first by visiting the <Link href="/" className="text-primary hover:underline">
          media
        </Link>{" "}
        page and marking it as completed.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((entry) => (
        <ProfileReviewCard
          key={entry.watchlist_id}
          entry={entry}
          onDeleted={() => setRemoved((prev) => new Set(prev).add(entry.watchlist_id))}
        />
      ))}
    </div>
  )
}

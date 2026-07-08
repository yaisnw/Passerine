"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { WatchStatus } from "@/generated/prisma/enums"
import WatchlistCard from "@/components/watchlist/watchlist-card"
import StatusTabs from "@/components/ui/profile-status-tabs"
import SortDropdown from "@/components/ui/profile-sort"

interface WatchlistEntry {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  status: WatchStatus
  tmdb_rating: number | null
  favorite: boolean
  added_at: Date
}

const sortOptions = [
  { label: "Date Added", value: "added_at" },
  { label: "Title", value: "title" },
  { label: "TMDB Rating", value: "tmdb_rating" },
]

interface Props {
  entries: WatchlistEntry[]
  activeStatus?: string
  activeSort?: string
}

export default function WatchlistGrid({ entries, activeStatus, activeSort = "added_at" }: Props) {
  const [removed, setRemoved] = useState<Set<number>>(new Set())
  const [statusOverrides, setStatusOverrides] = useState<Map<number, WatchStatus>>(new Map())
  const [removeError, setRemoveError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  function undoRemove(watchlistId: number, error: string) {
    setRemoveError(error)
    setRemoved((prev) => {
      const next = new Set(prev)
      next.delete(watchlistId)
      return next
    })
  }

  const items = entries
    .filter((e) => !removed.has(e.watchlist_id))
    .map((e) => ({ ...e, status: statusOverrides.get(e.watchlist_id) ?? e.status }))

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("tab", "watchlist")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3">
        <StatusTabs active={activeStatus} onChange={(value) => setParam("status", value)} />
        <SortDropdown options={sortOptions} active={activeSort} onChange={(value) => setParam("sort", value)} />
      </div>

      {removeError && <p className="text-sm text-destructive">{removeError}</p>}

      {/* Grid */}
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing here.{" "}
          <Link href="/" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
            Browse trending media
          </Link>{" "}
          to add something.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {items.map((entry) => (
            <WatchlistCard
              key={entry.watchlist_id}
              {...entry}
              showStatus
              showRemove
              showFavorite
              onRemove={() => setRemoved((prev) => new Set(prev).add(entry.watchlist_id))}
              onError={(error) => undoRemove(entry.watchlist_id, error)}
              onStatusChange={(next) => setStatusOverrides((prev) => new Map(prev).set(entry.watchlist_id, next))}
            />
          ))}
        </div>
      )}
    </div>
  )
}

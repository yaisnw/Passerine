"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { tmdbImage } from "@/lib/tmdb"
import { WatchStatus } from "@/generated/prisma/enums"
import WatchStatusButton from "@/components/watchlist/watch-status-button"
import WatchlistRemoveButton from "@/components/watchlist/watchlist-remove-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Star } from "lucide-react"

interface WatchlistEntry {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  status: WatchStatus
  tmdb_rating: number | null
}

const statusTabs = [
  { label: "All", value: undefined },
  { label: "Plan to Watch", value: WatchStatus.PLAN_TO_WATCH },
  { label: "Watching", value: WatchStatus.WATCHING },
  { label: "Completed", value: WatchStatus.COMPLETED },
  { label: "Dropped", value: WatchStatus.DROPPED },
]

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
  const router = useRouter()
  const searchParams = useSearchParams()

  const items = entries
    .filter((e) => !removed.has(e.watchlist_id))
    .map((e) => ({ ...e, status: statusOverrides.get(e.watchlist_id) ?? e.status }))

  function handleRemove(watchlist_id: number) {
    setRemoved((prev) => new Set(prev).add(watchlist_id))
  }

  function setParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.set("tab", "watchlist")
    router.push(`?${params.toString()}`)
  }

  const activeLabel = sortOptions.find((o) => o.value === activeSort)?.label ?? "Date Added"

  return (
    <div className="flex flex-col gap-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status tabs */}
        <div className="flex flex-wrap gap-1.5">
          {statusTabs.map((tab) => (
            <Button
              key={tab.label}
              onClick={() => setParam("status", tab.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                (activeStatus ?? undefined) === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Sort dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              {activeLabel}
              <ChevronDown className="size-3.5" />
            </Button>} />
          <DropdownMenuContent align="end" className="min-w-36">
            {sortOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setParam("sort", opt.value)}
                className={cn(opt.value === activeSort && "font-medium text-primary")}
              >
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
          {items.map((entry) => {
            const href = `/media/${entry.media_type.toLowerCase()}/${entry.tmdb_id}`
            return (
              <div key={entry.watchlist_id} className="group flex flex-col gap-2">
                <Link href={href} className="relative aspect-2/3 w-full overflow-hidden rounded-xl border-2 border-background bg-muted transition-colors duration-200 hover:border-primary block">
                  {entry.poster_path ? (
                    <Image
                      src={tmdbImage(entry.poster_path, "w342")}
                      alt={entry.title}
                      fill
                      sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 160px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground text-xs">
                      No image
                    </div>
                  )}
                  {entry.tmdb_rating != null && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-background/80 px-1.5 py-0.5 backdrop-blur-sm">
                      <Star className="size-3 fill-primary text-primary" />
                      <span className="text-xs font-medium text-foreground">{entry.tmdb_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <WatchlistRemoveButton
                    watchlistId={entry.watchlist_id}
                    onRemove={() => handleRemove(entry.watchlist_id)}
                  />
                </Link>
                <Link href={href} className="truncate text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                  {entry.title}
                </Link>
                <WatchStatusButton
                  watchlist_id={entry.watchlist_id}
                  status={entry.status}
                  onStatusChange={(next) =>
                    setStatusOverrides((prev) => new Map(prev).set(entry.watchlist_id, next))
                  }
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

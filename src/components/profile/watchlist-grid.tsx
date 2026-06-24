"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { tmdbImage } from "@/lib/tmdb"
import { WatchStatus } from "@/generated/prisma/enums"
import WatchStatusButton from "@/components/watchlist/watch-status-button"
import WatchlistRemoveButton from "@/components/watchlist/watchlist-remove-button"

interface WatchlistEntry {
  watchlist_id: number
  tmdb_id: number
  media_type: string
  title: string
  poster_path: string
  status: WatchStatus
}

interface Props {
  entries: WatchlistEntry[]
}

export default function WatchlistGrid({ entries }: Props) {
  const [items, setItems] = useState(entries)

  function handleRemove(watchlist_id: number) {
    setItems((prev) => prev.filter((e) => e.watchlist_id !== watchlist_id))
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Your watchlist is empty.{" "}
        <Link href="/" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">
          Browse trending media
        </Link>{" "}
        to add something.
      </p>
    )
  }

  return (
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
                setItems((prev) => prev.map((e) => e.watchlist_id === entry.watchlist_id ? { ...e, status: next } : e))
              }
            />
          </div>
        )
      })}
    </div>
  )
}

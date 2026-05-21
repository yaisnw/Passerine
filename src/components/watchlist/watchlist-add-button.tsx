"use client"

import { useOptimistic, useTransition, useState } from "react"
import { Bookmark, BookmarkCheck, ChevronDown, Check } from "lucide-react"
import { addToWatchlist, removeFromWatchlist, updateWatchStatus } from "@/actions/watchlist"
import { MediaType, WatchStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import { statuses, statusColors } from "@/lib/watch-status"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  tmdb_id: number
  media_type: MediaType
  title: string
  poster_path: string
  watchlist_id: number | null
  status?: WatchStatus | null
  variant?: "full" | "icon"
}

export default function WatchlistAddButton({
  tmdb_id,
  media_type,
  title,
  poster_path,
  watchlist_id,
  status,
  variant = "full",
}: Props) {
  const [optimisticState, setOptimisticState] = useOptimistic<{
    added: boolean
    status: WatchStatus | null
  }>({ added: watchlist_id !== null, status: status ?? null })

  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    startTransition(async () => {
      setOptimisticState({ added: true, status: WatchStatus.PLAN_TO_WATCH })
      try {
        await addToWatchlist({ tmdb_id, media_type, title, poster_path })
      } catch {
        setError("Failed to add")
      }
    })
  }

  function handleRemove(e?: React.MouseEvent) {
    e?.preventDefault()
    e?.stopPropagation()
    setError(null)
    startTransition(async () => {
      setOptimisticState({ added: false, status: null })
      try {
        await removeFromWatchlist(watchlist_id!)
      } catch {
        setError("Failed to remove")
      }
    })
  }

  function handleStatus(next: WatchStatus) {
    if (next === optimisticState.status) return
    setError(null)
    startTransition(async () => {
      setOptimisticState({ added: true, status: next })
      try {
        await updateWatchStatus(watchlist_id!, next)
      } catch {
        setError("Failed to update")
      }
    })
  }

  // Icon variant: simple bookmark toggle for card overlays
  if (variant === "icon") {
    return (
      <Button
        onClick={optimisticState.added ? handleRemove : handleAdd}
        disabled={isPending}
        size="icon"
        variant={optimisticState.added ? "default" : "outline"}
        aria-label={optimisticState.added ? "Remove from watchlist" : "Add to watchlist"}
        className={cn(
          "size-9 transition-all duration-200 active:scale-95",
          !optimisticState.added && "bg-background/70 backdrop-blur-sm"
        )}
      >
        {optimisticState.added
          ? <BookmarkCheck className="size-5" />
          : <Bookmark className="size-5" />
        }
      </Button>
    )
  }

  const currentLabel = statuses.find((s) => s.value === optimisticState.status)?.label

  // Full split button variant for details page
  if (!optimisticState.added) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex">
          <Button
            onClick={handleAdd}
            disabled={isPending}
            size="lg"
            className="gap-2 rounded-r-none active:scale-95 "
          >
            <Bookmark className="size-4" />
            Add to watchlist
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  disabled={isPending}
                  size="lg"
                  className="rounded-l-none border-l border-primary-foreground/20 px-2.5"
                />
              }
            >
              <ChevronDown className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {statuses.map((s) => (
                <DropdownMenuItem
                  key={s.value}
                  onClick={() => {
                    startTransition(async () => {
                      setOptimisticState({ added: true, status: s.value })
                      await addToWatchlist({ tmdb_id, media_type, title, poster_path })
                    })
                  }}
                >
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex">
        <Button
          onClick={() => handleRemove()}
          disabled={isPending}
          size="lg"
          className={cn(
            "gap-2 rounded-r-none border border-r-0 active:scale-95 hover:bg-secondary hover:text-black",
            optimisticState.status ? statusColors[optimisticState.status] : ""
          )}
        >
          <Bookmark className="size-4 fill-current " />
          {currentLabel}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                disabled={isPending}
                size="lg"
                className={cn(
                  "rounded-l-none border px-2.5 hover:bg-secondary hover:text-black",
                  optimisticState.status ? statusColors[optimisticState.status] : ""
                )}
              />
            }
          >
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            {statuses.map((s) => (
              <DropdownMenuItem
                key={s.value}
                onClick={() => handleStatus(s.value)}
                className="gap-2"
              >
                <Check
                  className={cn(
                    "size-3.5",
                    s.value === optimisticState.status ? "opacity-100" : "opacity-0"
                  )}
                />
                {s.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

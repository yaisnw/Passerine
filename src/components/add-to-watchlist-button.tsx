"use client"

import { useOptimistic, useTransition } from "react"
import { Bookmark } from "lucide-react"
import { addToWatchlist, removeFromWatchlist } from "@/actions/watchlist"
import { MediaType } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

interface Props {
  tmdb_id: number
  media_type: MediaType
  title: string
  poster_path: string
  watchlist_id: number | null
  /** "icon" for card overlay, "full" for details page */
  variant?: "icon" | "full"
}

export default function AddToWatchlistButton({
  tmdb_id,
  media_type,
  title,
  poster_path,
  watchlist_id,
  variant = "full",
}: Props) {
  const [optimisticAdded, setOptimisticAdded] = useOptimistic(watchlist_id !== null)
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      if (optimisticAdded) {
        setOptimisticAdded(false)
        await removeFromWatchlist(watchlist_id!)
      } else {
        setOptimisticAdded(true)
        await addToWatchlist({ tmdb_id, media_type, title, poster_path })
      }
    })
  }

  if (variant === "icon") {
    return (
      <Button
        onClick={handleClick}
        disabled={isPending}
        aria-label={optimisticAdded ? "Remove from watchlist" : "Add to watchlist"}
        variant={optimisticAdded ? "default" : "outline"}
        size="icon"
        className={cn(
          "size-9 transition-all duration-200 active:scale-95",
          !optimisticAdded && "bg-background/70 backdrop-blur-sm"
        )}
      >
        <Bookmark className={cn("size-4", optimisticAdded && "fill-current")} />
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={optimisticAdded ? "outline" : "default"}
      size="lg"
      className={cn(
        "gap-2 transition-all duration-200 active:scale-95",
        optimisticAdded && "border-primary text-primary hover:bg-primary/10"
      )}
    >
      <Bookmark className={cn("size-4", optimisticAdded && "fill-current")} />
      {optimisticAdded ? "In watchlist" : "Add to watchlist"}
    </Button>
  )
}

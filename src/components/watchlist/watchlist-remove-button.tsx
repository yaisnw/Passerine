"use client"

import { useTransition, useState } from "react"
import { X } from "lucide-react"
import { removeFromWatchlist } from "@/actions/watchlist"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Props {
  watchlistId: number
  onRemove?: () => void
  className?: string
}

export default function WatchlistRemoveButton({ watchlistId, onRemove, className }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleRemove(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onRemove?.()
    startTransition(async () => {
      const error = await removeFromWatchlist(watchlistId)
      setError(error)
    })
  }

  return (
    <>
      <Button
        onClick={handleRemove}
        disabled={isPending}
        size="icon"
        variant="destructive"
        className={cn(
          "size-9 rounded-full drop-shadow-border drop-shadow-xs",
          className
        )}
        aria-label="Remove from watchlist"
      >
        <X className="size-5" />
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </>
  )
}

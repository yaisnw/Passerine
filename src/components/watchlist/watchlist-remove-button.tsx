"use client"

import { useTransition, useState } from "react"
import { X } from "lucide-react"
import { removeFromWatchlist } from "@/actions/watchlist"
import { Button } from "@/components/ui/button"

interface Props {
  watchlistId: number
  onRemove?: () => void
}

export default function WatchlistRemoveButton({ watchlistId, onRemove }: Props) {
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
        className="absolute top-1 right-1 rounded-full bg-black/60 hover:bg-red-500 text-white/70 backdrop-blur-sm transition-[opacity,color] disabled:pointer-events-none border border-white/30"
        aria-label="Remove from watchlist"
      >
        <X className="size-5" />
      </Button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </>
  )
}

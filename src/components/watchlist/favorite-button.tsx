"use client"

import { useOptimistic, useTransition, useState } from "react"
import { Heart } from "lucide-react"
import { toggleFavorite } from "@/actions/watchlist"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface Props {
  watchlist_id: number
  isFavorite: boolean
  onToggle?: (next: boolean) => void
  className?: string
}

export default function FavoriteButton({ watchlist_id, isFavorite, onToggle, className }: Props) {
  const [optimistic, setOptimistic] = useOptimistic(isFavorite)
  const [isPending, startTransition] = useTransition()
  const [, setError] = useState<string | null>(null)

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setError(null)
    const next = !optimistic
    startTransition(async () => {
      setOptimistic(next)
      const err = await toggleFavorite(watchlist_id)
      if (err) setError(err)
      else onToggle?.(next)
    })
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      size="icon"
      variant={optimistic ? "default" : "outline"}
      aria-label={optimistic ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "size-10 transition-all duration-200 active:scale-95 border border-foreground/20",
        !optimistic && "bg-background/70 backdrop-blur-sm",
        className
      )}
    >
      <Heart className={cn("size-5", optimistic && "fill-current")} />
    </Button>
  )
}

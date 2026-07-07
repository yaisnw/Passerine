"use client"

import { useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { deleteReview } from "@/actions/watchlist"
import { Button } from "@/components/ui/button"

interface Props {
  watchlistId: number
  onDeleted?: () => void
}

export default function DeleteReviewButton({ watchlistId, onDeleted }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const error = await deleteReview(watchlistId)
      if (error) setError(error)
      else if (onDeleted) onDeleted()
      else router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-1">
      <Button onClick={handleDelete} disabled={isPending} variant="destructive" size="lg" className="gap-2">
        <Trash2 className="size-5" strokeWidth={1.75} />
        {isPending ? "Deleting..." : "Delete review"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

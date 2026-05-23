"use client"

import { useState, useTransition } from "react"
import { usePathname } from "next/navigation"
import { Star } from "lucide-react"
import { submitReview } from "@/actions/watchlist"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Props {
  watchlistId: number
  existingRating?: number
  existingReview?: string
  mediaTitle: string
  tmdbId?: number
  mediaType?: string
}

export default function WriteReviewSheet({
  watchlistId,
  existingRating,
  existingReview,
  mediaTitle,
  tmdbId,
  mediaType,
}: Props) {
  const pathname = usePathname()
  const isMediaPage = pathname.startsWith("/media/")
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(existingRating ?? 0)
  const [hovered, setHovered] = useState(0)
  const [text, setText] = useState(existingReview ?? "")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  function handleSubmit() {
    if (rating === 0) { setError("Please select a rating"); return }
    setError(null)
    startTransition(async () => {
      try {
        await submitReview(watchlistId, rating, text || undefined)
        setOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit review")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="lg" className="gap-2" />}>
        <Star className="size-4" />
        {existingRating ? "Edit review" : "Write a review"}
      </DialogTrigger>
      <DialogContent className="flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{existingRating ? "Edit your review" : "Write a review"}</DialogTitle>
          {!isMediaPage && tmdbId && mediaType ? (
            <Link href={`/media/${mediaType.toLowerCase()}/${tmdbId}`} className="truncate text-xl font-medium text-muted-foreground hover:text-primary transition-colors">
              {mediaTitle}
            </Link>
          ) : (
            <p className="text-xl text-foreground">{mediaTitle}</p>
          )}
        </DialogHeader>

        <div className="flex flex-col gap-5 px-2 overflow-y-auto">
          {/* Star rating */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">Rating</span>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHovered(0)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  onMouseEnter={() => setHovered(n)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      n <= (hovered || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review text */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Review <span className="text-muted-foreground font-normal">(optional)</span></span>
              <span className={`text-xs ${text.length > 1000 ? "text-destructive" : "text-muted-foreground"}`}>
                {text.length}/1000
              </span>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What did you think?"
              className="min-h-32 resize-none"
              maxLength={1000}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button onClick={handleSubmit} disabled={isPending || rating === 0}>
            {isPending ? "Submitting..." : "Submit review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

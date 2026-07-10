import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  rating: number
  size?: "sm" | "md"
  showLabel?: boolean
  className?: string
}

export default function StarRating({ rating, size = "md", showLabel = false, className }: Props) {
  const starSize = size === "sm" ? "size-4" : "size-5"

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: 10 }).map((_, i) => {
        const n = i + 1
        const full = rating >= n
        const half = !full && rating >= n - 0.5
        return (
          <span key={i} className={cn("relative", starSize)}>
            <Star className={cn("absolute inset-0 text-muted-foreground", starSize)} />
            {(full || half) && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: half ? "50%" : "100%" }}>
                <Star className={cn("fill-primary text-primary", starSize)} />
              </span>
            )}
          </span>
        )
      })}
      {showLabel && <span className="ml-1.5 text-xs text-muted-foreground">{rating} / 10</span>}
    </div>
  )
}

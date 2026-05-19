"use client"

import { useOptimistic, useTransition } from "react"
import { ChevronDown, Trash2 } from "lucide-react"
import { updateWatchStatus, removeFromWatchlist } from "@/actions/watchlist"
import { WatchStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const statuses: { value: WatchStatus; label: string }[] = [
  { value: WatchStatus.PLAN_TO_WATCH, label: "Plan to watch" },
  { value: WatchStatus.WATCHING, label: "Watching" },
  { value: WatchStatus.COMPLETED, label: "Completed" },
  { value: WatchStatus.DROPPED, label: "Dropped" },
]

const statusColors: Record<WatchStatus, string> = {
  PLAN_TO_WATCH: "bg-background/70 text-black",
  WATCHING: "bg-blue-500 text-white",
  COMPLETED: "bg-green-300 text-black",
  DROPPED: "bg-destructive text-background",
}

interface Props {
  watchlist_id: number
  status: WatchStatus
  onRemove?: () => void
}

export default function WatchStatusButton({ watchlist_id, status, onRemove }: Props) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status)
  const [isPending, startTransition] = useTransition()

  function handleStatus(next: WatchStatus) {
    if (next === optimisticStatus) return
    startTransition(async () => {
      setOptimisticStatus(next)
      await updateWatchStatus(watchlist_id, next)
    })
  }

  function handleRemove() {
    onRemove?.()
    startTransition(async () => {
      await removeFromWatchlist(watchlist_id)
    })
  }

  const label = statuses.find((s) => s.value === optimisticStatus)?.label

  return (
    <div
      className="absolute bottom-2 left-0 right-0 z-10"
      onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-1 px-2 py-1.5 text-xs font-semibold backdrop-blur-sm transition-opacity hover:opacity-90 focus:outline-none",
            statusColors[optimisticStatus]
          )}
        >
          {label}
          <ChevronDown className="size-2.5 shrink-0" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-36">
          {statuses.map((s) => (
            <DropdownMenuItem
              key={s.value}
              onClick={() => handleStatus(s.value)}
              className={cn(s.value === optimisticStatus && "font-medium text-primary")}
            >
              {s.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleRemove}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="size-3.5" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

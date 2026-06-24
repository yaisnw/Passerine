"use client"

import { useOptimistic, useTransition, useState } from "react"
import { ChevronDown } from "lucide-react"
import { updateWatchStatus } from "@/actions/watchlist"
import { WatchStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import { statuses, statusColors } from "@/lib/watch-status"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  watchlist_id: number
  status: WatchStatus
  onStatusChange?: (next: WatchStatus) => void
}

export default function WatchStatusButton({ watchlist_id, status, onStatusChange }: Props) {
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(status)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleStatus(next: WatchStatus) {
    if (next === optimisticStatus) return
    setError(null)
    startTransition(async () => {
      setOptimisticStatus(next)
      const err = await updateWatchStatus(watchlist_id, next)
      if (err) {
        setError(err)
      } else {
        onStatusChange?.(next)
      }
    })
  }

  const label = statuses.find((s) => s.value === optimisticStatus)?.label

  return (
    <div className="z-10">
      {error && (
        <p className="mb-0.5 text-center text-[10px] text-destructive">{error}</p>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isPending}
          className={cn(
            "flex w-full cursor-pointer items-center justify-center gap-1 px-2 py-1.5 text-sm font-semibold backdrop-blur-sm transition-opacity hover:opacity-90 focus:outline-none",
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

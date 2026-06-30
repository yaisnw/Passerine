"use client"

import { WatchStatus } from "@/generated/prisma/enums"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const statusTabs = [
  { label: "All", value: undefined },
  { label: "Plan to Watch", value: WatchStatus.PLAN_TO_WATCH },
  { label: "Watching", value: WatchStatus.WATCHING },
  { label: "Completed", value: WatchStatus.COMPLETED },
  { label: "Dropped", value: WatchStatus.DROPPED },
]

interface Props {
  active?: string
  onChange: (value: WatchStatus | undefined) => void
}

export default function ProfileStatusTabs({ active, onChange }: Props) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:flex sm:flex-wrap">
      {statusTabs.map((tab, i) => (
        <Button
          key={tab.label}
          onClick={() => onChange(tab.value)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            i < 3 ? "col-span-2" : "col-span-3",
            (active ?? undefined) === tab.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}

import { WatchStatus } from "@/generated/prisma/enums"

export const statusColors: Record<WatchStatus, string> = {
  PLAN_TO_WATCH: "bg-primary text-white",
  WATCHING: "bg-accent/80 text-white",
  COMPLETED: "bg-green-300 text-black",
  DROPPED: "bg-destructive text-white",
}

export const statuses: { value: WatchStatus; label: string }[] = [
  { value: WatchStatus.PLAN_TO_WATCH, label: "Plan to watch" },
  { value: WatchStatus.WATCHING, label: "Watching" },
  { value: WatchStatus.COMPLETED, label: "Completed" },
  { value: WatchStatus.DROPPED, label: "Dropped" },
]

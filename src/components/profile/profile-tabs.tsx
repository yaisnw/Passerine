"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { value: "watchlist", label: "Watchlist" },
  { value: "reviews", label: "Reviews" },
]

export default function ProfileTabs({ active }: { active: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleTab(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", value)
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 border-b border-border mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleTab(tab.value)}
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px cursor-pointer",
            active === tab.value
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

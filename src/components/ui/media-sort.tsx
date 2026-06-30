"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { ChevronsUpDown, Check } from "lucide-react"
import { SORT_OPTIONS, type SortOption } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface Props {
  value: SortOption
}

export default function MediaSort({ value }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSelect(next: SortOption) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", next)
    params.delete("page")
    router.push(`${pathname}?${params.toString()}`)
  }

  const current = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0]

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by</span>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" className="gap-2" />}>
          {current.label}
          <ChevronsUpDown className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {SORT_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="gap-2"
            >
              <Check className={`size-3.5 ${opt.value === value ? "opacity-100" : "opacity-0"}`} />
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

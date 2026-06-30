"use client"

import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface SortOption {
  label: string
  value: string
}

interface Props {
  options: SortOption[]
  active: string
  onChange: (value: string) => void
}

export default function ProfileSort({ options, active, onChange }: Props) {
  const activeLabel = options.find((o) => o.value === active)?.label ?? options[0].label

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
          {activeLabel}
          <ChevronDown className="size-3.5" />
        </Button>} />
      <DropdownMenuContent className="w-auto" align="center">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(opt.value === active && "font-medium text-primary")}
          >
            {opt.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

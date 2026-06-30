"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function BackButton() {
  const router = useRouter()
  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className="inline-flex my-6 items-center gap-1.5 text-md text-accent
      cursor-pointer hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" strokeWidth={1.75} />
      Back
    </Button>
  )
}

"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex my-6 items-center gap-1.5 text-sm text-muted-foreground
      cursor-pointer hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" strokeWidth={1.75} />
      Back
    </button>
  )
}

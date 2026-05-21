"use client"

import { useState } from "react"
import Image from "next/image"
import { Expand, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  src: string
  alt: string
}

export default function BackdropLightbox({ src, alt }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size="lg"
        className="gap-2 transition-all duration-200 active:scale-95"
        aria-label="View backdrop image"
      >
        <Expand className="size-4" />
        View backdrop
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => setOpen(false)}
        >
          <Button
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
          <div className="relative w-full max-w-7xl aspect-square px-4">
            <Image
              src={src}
              alt={alt}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 1280px"
            />
          </div>
        </div>
      )}
    </>
  )
}

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
        className="mt-4 w-full transition-all duration-200 active:scale-95"
        aria-label="View backdrop image"
      >
        <Expand className="size-4" />
        View backdrop
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <Button
            className="absolute top-3 right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors sm:top-4 sm:right-4"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X className="size-5" />
          </Button>
          <div className="relative aspect-video w-full max-w-7xl">
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

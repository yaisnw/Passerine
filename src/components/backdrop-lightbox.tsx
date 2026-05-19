"use client"

import { useState } from "react"
import Image from "next/image"
import { Expand, X } from "lucide-react"
import { Button } from "./ui/button"

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
        className="flex items-center gap-1.5 rounded-md border border-border bg-card/60 px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-card"
        aria-label="View backdrop image"
      >
        <Expand className="size-3.5" />
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

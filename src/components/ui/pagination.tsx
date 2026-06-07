import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  buildHref: (page: number) => string
  windowSize?: number
}

export default function Pagination({
  currentPage,
  totalPages,
  buildHref,
  windowSize = 10,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const half = Math.floor(windowSize / 2)
  let start = Math.max(1, currentPage - half)
  const end = Math.min(totalPages, start + windowSize - 1)

  // Shift window left if we're near the end
  if (end - start + 1 < windowSize) {
    start = Math.max(1, end - windowSize + 1)
  }

  const pages: (number | "...")[] = []

  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push("...")
  }

  for (let p = start; p <= end; p++) pages.push(p)

  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("...")
    pages.push(totalPages)
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = currentPage < totalPages ? currentPage + 1 : null

  return (
    <div className="mt-10 flex items-center gap-1">
      <Link
        href={prevPage ? buildHref(prevPage) : "#"}
        aria-disabled={!prevPage}
        className={`flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors ${
          prevPage
            ? "hover:bg-muted hover:text-foreground"
            : "pointer-events-none opacity-40"
        }`}
      >
        <ChevronLeft className="size-4" />
      </Link>

      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex size-8 items-center justify-center text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p)}
            className={`flex size-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={nextPage ? buildHref(nextPage) : "#"}
        aria-disabled={!nextPage}
        className={`flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors ${
          nextPage
            ? "hover:bg-muted hover:text-foreground"
            : "pointer-events-none opacity-40"
        }`}
      >
        <ChevronRight className="size-4" />
      </Link>
    </div>
  )
}

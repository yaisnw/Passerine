"use client"

import { useState, useEffect, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Search, Loader2 } from "lucide-react"
import { tmdbImage, type SearchResult } from "@/lib/tmdb"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleQueryChange(value: string) {
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (!value.trim()) {
      setResults([])
      setOpen(false)
      return
    }

    debounceRef.current = setTimeout(() => {
      startTransition(async () => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results.slice(0, 6))
          setOpen(true)
        }
      })
    }, 350)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function handleSelect(result: SearchResult) {
    const type = result.media_type
    setQuery("")
    setOpen(false)
    router.push(`/media/${type}/${result.id}`)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-sm">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {isPending ? (
            <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground animate-spin" strokeWidth={1.75} />
          ) : (
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" strokeWidth={1.75} />
          )}
          <Input
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Search movies & TV..."
            className="pl-9 h-9 text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-full z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          {results.map((result) => {
            const title = result.title ?? result.name ?? "Unknown"
            const year = (result.release_date ?? result.first_air_date)?.slice(0, 4)
            return (
              <button
                key={`${result.media_type}-${result.id}`}
                type="button"
                onClick={() => handleSelect(result)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-left transition-colors",
                  "hover:bg-muted first:rounded-t-xl last:rounded-b-xl"
                )}
              >
                <div className="relative shrink-0 w-8 aspect-2/3 rounded overflow-hidden bg-muted">
                  {result.poster_path ? (
                    <Image
                      src={tmdbImage(result.poster_path, "w92")}
                      alt={title}
                      fill
                      className="object-cover"
                      sizes="32px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-muted-foreground">?</div>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm font-medium text-foreground">{title}</span>
                  <span className="text-xs text-muted-foreground">
                    {result.media_type === "movie" ? "Movie" : "TV"}{year ? ` · ${year}` : ""}
                  </span>
                </div>
              </button>
            )
          })}
          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.push(`/search?q=${encodeURIComponent(query.trim())}`)
              }}
              className="w-full px-3 py-2 text-sm text-primary hover:bg-muted text-left border-t border-border transition-colors"
            >
              See all results for &ldquo;{query}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}

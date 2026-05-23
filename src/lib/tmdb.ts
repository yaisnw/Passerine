import type { MovieDetails, MovieCredits, TvDetails } from "./tmdb.types"

const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"


const defaultHeaders = {
  Authorization: `Bearer ${process.env.TMDB_API_TOKEN}`,
  "Content-Type": "application/json",
}

export async function tmdbFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${TMDB_BASE_URL}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    throw new Error(`TMDB fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export function tmdbImage(path: string, size = "w500") {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export function getMovieDetails(id: number) {
  return tmdbFetch<MovieDetails>(`/movie/${id}`)
}

export function getMovieCredits(id: number) {
  return tmdbFetch<MovieCredits>(`/movie/${id}/credits`)
}

export function getTvDetails(id: number) {
  return tmdbFetch<TvDetails>(`/tv/${id}`)
}

export function getTvCredits(id: number) {
  return tmdbFetch<MovieCredits>(`/tv/${id}/credits`)
}

export interface SearchResult {
  id: number
  media_type: "movie" | "tv"
  title?: string
  name?: string
  poster_path: string | null
  release_date?: string
  first_air_date?: string
}

export interface SearchResponse {
  results: SearchResult[]
  total_results: number
  total_pages: number
  page: number
}

export async function searchMulti(query: string, page = 1): Promise<SearchResponse> {
  const encoded = encodeURIComponent(query)
  const [movies, tv] = await Promise.all([
    tmdbFetch<SearchResponse>(`/search/movie?query=${encoded}&page=${page}&include_adult=true`),
    tmdbFetch<SearchResponse>(`/search/tv?query=${encoded}&page=${page}&include_adult=true`),
  ])

  const movieResults: SearchResult[] = movies.results.map((r) => ({ ...r, media_type: "movie" as const }))
  const tvResults: SearchResult[] = tv.results.map((r) => ({ ...r, media_type: "tv" as const }))

  const interleaved: SearchResult[] = []
  const max = Math.max(movieResults.length, tvResults.length)
  for (let i = 0; i < max; i++) {
    if (tvResults[i]) interleaved.push(tvResults[i])
    if (movieResults[i]) interleaved.push(movieResults[i])
  }

  return {
    results: interleaved,
    total_results: movies.total_results + tv.total_results,
    total_pages: Math.max(movies.total_pages, tv.total_pages),
    page,
  }
}

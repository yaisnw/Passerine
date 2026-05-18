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

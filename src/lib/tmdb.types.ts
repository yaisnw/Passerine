export interface Movie {
  id: number
  title: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  release_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  media_type?: "movie"
}

export interface TvShow {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string
  first_air_date: string
  vote_average: number
  vote_count: number
  genre_ids: number[]
  media_type?: "tv"
}

export type MediaItem = Movie | TvShow

export interface TrendingResponse<T = Movie> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

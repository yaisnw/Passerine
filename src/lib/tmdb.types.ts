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

export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface MovieDetails {
  id: number
  title: string
  tagline: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number | null
  vote_average: number
  vote_count: number
  status: string
  genres: Genre[]
  production_companies: ProductionCompany[]
  budget: number
  revenue: number
  homepage: string | null
  imdb_id: string | null
  original_language: string
  popularity: number
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface MovieCredits {
  id: number
  cast: CastMember[]
}

export interface TvDetails {
  id: number
  name: string
  tagline: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  episode_run_time: number[]
  vote_average: number
  vote_count: number
  status: string
  genres: Genre[]
  production_companies: ProductionCompany[]
  homepage: string | null
  original_language: string
  popularity: number
  number_of_seasons: number
  number_of_episodes: number
}

export type MediaType = "movie" | "tv"

export type MediaDetails = MovieDetails | TvDetails


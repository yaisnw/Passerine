import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { SearchResult } from "./tmdb"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type SortOption = "popularity" | "rating" | "date_desc" | "date_asc"

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "popularity", label: "Popularity" },
  { value: "rating", label: "Rating" },
  { value: "date_desc", label: "Newest first" },
  { value: "date_asc", label: "Oldest first" },
]

export const TMDB_SORT_MAP: Record<SortOption, string> = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
  date_desc: "primary_release_date.desc",
  date_asc: "primary_release_date.asc",
}

export const TMDB_TV_SORT_MAP: Record<SortOption, string> = {
  popularity: "popularity.desc",
  rating: "vote_average.desc",
  date_desc: "first_air_date.desc",
  date_asc: "first_air_date.asc",
}

const BAYESIAN_MIN_VOTES = 500


// this returns a score that balances the average rating of an item with the number of votes it has received,
// using a Bayesian approach to prevent items with few votes from ranking too high and staying between the threshold of item rating and mean rating
function bayesianScore(itemRating: number, itemVotes: number, meanRating: number): number {
  return (itemVotes / (itemVotes + BAYESIAN_MIN_VOTES)) * itemRating +
    (BAYESIAN_MIN_VOTES / (itemVotes + BAYESIAN_MIN_VOTES)) * meanRating
}

export function sortResults(results: SearchResult[], sort: SortOption): SearchResult[] {
  if (sort === "rating") {
    const rated = results.filter((r) => (r.vote_average ?? 0) > 0 && (r.popularity ?? 0) > 0)
    const unrated = results.filter((r) => !rated.includes(r))
    const meanRating = rated.length ?
      rated.reduce((sum, r) => sum + (r.vote_average ?? 0), 0) / rated.length : 0
    return [
      ...rated.sort(
        (a, b) =>
          bayesianScore(b.vote_average ?? 0, b.popularity ?? 0, meanRating) -
          bayesianScore(a.vote_average ?? 0, a.popularity ?? 0, meanRating)
      ),
      ...unrated,
    ]
  }
  //personal note because i keep forgetting about this,
  //a-b sort is ascending, b-a is descending, and localeCompare is string comparison that returns a number based on alphabetical order
  //a-b adds the smallest number first, b-a adds the largest number first
  return [...results].sort((a, b) => {
    switch (sort) {
      case "date_desc": {
        const dateA = a.release_date ?? a.first_air_date ?? ""
        const dateB = b.release_date ?? b.first_air_date ?? ""
        return dateB.localeCompare(dateA)
      }
      case "date_asc": {
        const dateA = a.release_date ?? a.first_air_date ?? ""
        const dateB = b.release_date ?? b.first_air_date ?? ""
        return dateA.localeCompare(dateB)
      }
      case "popularity":
      default:
        return 0
    }
  })
}

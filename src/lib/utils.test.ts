import { describe, it, expect } from "vitest"
import { cn, sortResults } from "./utils"
import type { SearchResult } from "./tmdb"

// helpers
const makeResult = (overrides: Partial<SearchResult>): SearchResult => ({
  id: 1,
  media_type: "movie",
  title: "Test Movie",
  poster_path: null,
  popularity: 100,
  vote_average: 7,
  release_date: "2023-01-01",
  ...overrides,
})

describe("cn", () => {
  it("merges class names", () => {
    const result = cn("class1", "class2", { class3: true, class4: false })
    expect(result).toBe("class1 class2 class3")
  })

  it("handles conflicting tailwind classes", () => {
    const result = cn("p-2", "p-4")
    expect(result).toBe("p-4")
  })
})

describe("sortResults", () => {

  describe("popularity", () => {
    it("returns results in original order", () => {
      const results = [
        makeResult({ id: 1, popularity: 200 }),
        makeResult({ id: 2, popularity: 100 }),
        makeResult({ id: 3, popularity: 50 }),
      ]
      const sorted = sortResults(results, "popularity")
      expect(sorted.map((r) => r.id)).toEqual([1, 2, 3])
    })
  })

  describe("rating", () => {
    it("sorts by bayesian score descending", () => {
      const results = [
        makeResult({ id: 3, vote_average: 9 }),
        makeResult({ id: 1, vote_average: 8 }),
        makeResult({ id: 2, vote_average: 6 }),
      ]
      const sorted = sortResults(results, "rating")
      expect(sorted.map((r) => r.id)).toEqual([3, 1, 2])
    })

    it("puts unrated items at the end", () => {
      const results = [
        makeResult({ id: 3, vote_average: 9 }),
        makeResult({ id: 4, vote_average: 0 }),
        makeResult({ id: 1, vote_average: 8 }),
        makeResult({ id: 2, vote_average: 6 }),
      ]
      const sorted = sortResults(results, "rating")
      expect(sorted.map((r) => r.id)).toEqual([3, 1, 2, 4])
    })

    it("handles empty results", () => {
      const results: SearchResult[] = []
      const sorted = sortResults(results, "rating")
      expect(sorted).toEqual([])
    })
  })

  describe("date_desc", () => {
    it("sorts newest first", () => {
      const results = [
        makeResult({ id: 2, release_date: "2023-01-01" }),
        makeResult({ id: 1, release_date: "2022-01-01" }),
        makeResult({ id: 3, release_date: "2021-01-01" }),
      ]
      const sorted = sortResults(results, "date_desc")
      expect(sorted.map((r) => r.id)).toEqual([2, 1, 3])
    })

    it("falls back to first_air_date for TV shows", () => {
      const results = [
        makeResult({ id: 2, first_air_date: "2023-01-01", media_type: "tv" }),
        makeResult({ id: 1, first_air_date: "2022-01-01", media_type: "tv" }),
        makeResult({ id: 3, first_air_date: "2021-01-01", media_type: "tv" }),
      ]
      const sorted = sortResults(results, "date_desc")
      expect(sorted.map((r) => r.id)).toEqual([2, 1, 3])
    })
  })

  describe("date_asc", () => {
    it("sorts oldest first", () => {
      const results = [
        makeResult({ id: 3, release_date: "2023-01-01" }),
        makeResult({ id: 1, release_date: "2022-01-01" }),
        makeResult({ id: 2, release_date: "2021-01-01" }),
      ]
      const sorted = sortResults(results, "date_asc")
      expect(sorted.map((r) => r.id)).toEqual([2, 1, 3])
    })
    it("falls back to first_air_date for TV shows", () => {
      const results = [
        makeResult({ id: 3, first_air_date: "2023-01-01", media_type: "tv" }),
        makeResult({ id: 1, first_air_date: "2022-01-01", media_type: "tv" }),
        makeResult({ id: 2, first_air_date: "2021-01-01", media_type: "tv" }),
      ]
      const sorted = sortResults(results, "date_asc")
      expect(sorted.map((r) => r.id)).toEqual([2, 1, 3])
    })
  })
})  


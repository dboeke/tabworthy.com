'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Search, X, Loader2 } from 'lucide-react'

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

export interface SearchResult {
  channels: Array<{
    id: string
    name: string
    slug: string
    editorialSummary: string
    creator: { id: string; name: string; slug: string }
    platform: { id: string; name: string; displayName: string; iconUrl: string | null; baseUrl: string | null }
    tags: Array<{ id: string; name: string; slug: string; displayName: string }>
  }>
  categories: Array<{
    id: string
    name: string
    slug: string
    description: string | null
  }>
  topics: Array<{
    id: string
    name: string
    slug: string
    category: { id: string; name: string; slug: string }
  }>
  broadened: boolean
  broadenedMessage: string | null
}

interface SearchBarProps {
  onResults: (results: SearchResult | null) => void
  onQueryChange: (query: string) => void
  categoryConstraint?: string | null
}

export function SearchBar({
  onResults,
  onQueryChange,
  categoryConstraint,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchResults = useCallback(
    async (searchQuery: string, category?: string | null) => {
      if (searchQuery.length < 2) {
        onResults(null)
        return
      }

      setIsLoading(true)
      try {
        const params = new URLSearchParams({ q: searchQuery })
        if (category) params.set('category', category)

        const response = await fetch(`/api/search?${params.toString()}`)
        const data: SearchResult = await response.json()
        onResults(data)
      } catch (error) {
        console.error('Search fetch error:', error)
        onResults(null)
      } finally {
        setIsLoading(false)
      }
    },
    [onResults]
  )

  useEffect(() => {
    onQueryChange(debouncedQuery)
    fetchResults(debouncedQuery, categoryConstraint)
  }, [debouncedQuery, categoryConstraint, fetchResults, onQueryChange])

  const handleClear = () => {
    setQuery('')
    onResults(null)
    onQueryChange('')
    inputRef.current?.focus()
  }

  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search channels, categories, topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-14 rounded-xl border-2 pl-12 pr-12 text-lg shadow-sm transition-shadow focus-visible:ring-2 focus-visible:shadow-md"
      />
      {query.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}

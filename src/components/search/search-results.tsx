'use client'

import { useState, useCallback } from 'react'
import { SearchBar, type SearchResult } from './search-bar'
import { CategoryFilterPanel } from './category-filter-panel'
import { ChannelResultsPanel } from './channel-results-panel'

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  channelCount: number
  displayOrder?: number
}

interface ChannelData {
  id: string
  name: string
  slug: string
  editorialSummary: string
  creator: { id: string; name: string; slug: string }
  platform: { id: string; name: string; displayName: string; iconUrl: string | null; baseUrl: string | null }
  tags: Array<{ id: string; name: string; slug: string; displayName: string }>
}

interface SearchResultsProps {
  initialCategories: CategoryData[]
  initialNewestChannels: ChannelData[]
  initialEditorsPicksChannels: ChannelData[]
}

export function SearchResults({
  initialCategories,
  initialNewestChannels,
  initialEditorsPicksChannels,
}: SearchResultsProps) {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const isSearching = query.length >= 2

  const handleResults = useCallback((results: SearchResult | null) => {
    setSearchResults(results)
    setIsLoading(false)
  }, [])

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    if (newQuery.length >= 2) {
      setIsLoading(true)
    }
  }, [])

  const handleCategorySelect = useCallback((slug: string) => {
    setActiveCategory((prev) => (prev === slug ? null : slug))
  }, [])

  const handleCategoryClear = useCallback(() => {
    setActiveCategory(null)
  }, [])

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      {/* Hero Search Bar */}
      <div className="py-8 sm:py-12">
        <SearchBar
          onResults={handleResults}
          onQueryChange={handleQueryChange}
          categoryConstraint={activeCategory}
        />
      </div>

      {/* Split Panel Layout */}
      <div className="flex flex-col gap-8 pb-12 lg:flex-row">
        {/* Left Panel: Categories/Topics */}
        <aside className="w-full shrink-0 lg:w-72">
          <CategoryFilterPanel
            allCategories={initialCategories}
            searchCategories={searchResults?.categories}
            searchTopics={searchResults?.topics}
            isSearching={isSearching}
            activeCategory={activeCategory}
            onCategorySelect={handleCategorySelect}
            onCategoryClear={handleCategoryClear}
          />
        </aside>

        {/* Right Panel: Channels */}
        <main className="min-w-0 flex-1">
          <ChannelResultsPanel
            newestChannels={initialNewestChannels}
            editorsPicksChannels={initialEditorsPicksChannels}
            searchChannels={searchResults?.channels}
            isSearching={isSearching}
            broadened={searchResults?.broadened}
            broadenedMessage={searchResults?.broadenedMessage}
            isLoading={isLoading}
          />
        </main>
      </div>
    </div>
  )
}

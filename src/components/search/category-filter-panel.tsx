'use client'

import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string | null
  channelCount?: number
  displayOrder?: number
}

interface TopicData {
  id: string
  name: string
  slug: string
  category: { id: string; name: string; slug: string }
}

interface CategoryFilterPanelProps {
  /** All categories for default state */
  allCategories: CategoryData[]
  /** Search-matched categories */
  searchCategories?: CategoryData[]
  /** Search-matched topics */
  searchTopics?: TopicData[]
  /** Whether we are in search mode */
  isSearching: boolean
  /** Currently active category constraint */
  activeCategory: string | null
  /** Callback when a category/topic is selected as constraint */
  onCategorySelect: (slug: string) => void
  /** Callback to clear the active constraint */
  onCategoryClear: () => void
}

export function CategoryFilterPanel({
  allCategories,
  searchCategories = [],
  searchTopics = [],
  isSearching,
  activeCategory,
  onCategorySelect,
  onCategoryClear,
}: CategoryFilterPanelProps) {
  return (
    <div className="w-full">
      {/* Active filter badge */}
      {activeCategory && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtered by:</span>
          <Badge
            variant="default"
            className="cursor-pointer gap-1 pr-1.5"
            onClick={onCategoryClear}
          >
            {activeCategory}
            <X className="h-3 w-3" />
          </Badge>
        </div>
      )}

      {isSearching ? (
        /* Search state: show matching categories and topics */
        <div className="space-y-4">
          {searchCategories.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Categories
              </h3>
              <ul className="space-y-1">
                {searchCategories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      type="button"
                      onClick={() => onCategorySelect(cat.slug)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                        activeCategory === cat.slug
                          ? 'bg-accent font-medium'
                          : ''
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchTopics.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Topics
              </h3>
              <ul className="space-y-1">
                {searchTopics.map((topic) => (
                  <li key={topic.id}>
                    <button
                      type="button"
                      onClick={() => onCategorySelect(topic.category.slug)}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                        activeCategory === topic.category.slug
                          ? 'bg-accent font-medium'
                          : ''
                      }`}
                    >
                      <span>{topic.name}</span>
                      <span className="ml-1.5 text-xs text-muted-foreground">
                        in {topic.category.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchCategories.length === 0 && searchTopics.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              No matching categories or topics.
            </p>
          )}
        </div>
      ) : (
        /* Default state: show all categories */
        <div>
          <h3 className="mb-3 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Browse Categories
          </h3>
          <ul className="space-y-0.5">
            {allCategories.map((cat) => (
              <li key={cat.id}>
                <button
                  type="button"
                  onClick={() => onCategorySelect(cat.slug)}
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                    activeCategory === cat.slug
                      ? 'bg-accent font-medium'
                      : ''
                  }`}
                >
                  <span>{cat.name}</span>
                  {cat.channelCount !== undefined && cat.channelCount > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({cat.channelCount})
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

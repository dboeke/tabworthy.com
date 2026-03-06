'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Badge } from '@/components/ui/badge'

interface TagFilterBarProps {
  availableTags: Array<{
    id: string
    name: string
    slug: string
    displayName: string
  }>
  activeTags: string[]
}

export function TagFilterBar({ availableTags, activeTags }: TagFilterBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const toggleTag = useCallback(
    (tagSlug: string) => {
      const current = new Set(activeTags)

      if (current.has(tagSlug)) {
        current.delete(tagSlug)
      } else {
        current.add(tagSlug)
      }

      const params = new URLSearchParams(searchParams.toString())

      if (current.size > 0) {
        params.set('tags', Array.from(current).join(','))
      } else {
        params.delete('tags')
      }

      const query = params.toString()
      router.replace(`${pathname}${query ? `?${query}` : ''}`)
    },
    [activeTags, pathname, router, searchParams]
  )

  return (
    <div className="flex flex-wrap gap-2">
      {availableTags.map((tag) => {
        const isActive = activeTags.includes(tag.slug)
        return (
          <button
            key={tag.id}
            onClick={() => toggleTag(tag.slug)}
            type="button"
          >
            <Badge
              variant={isActive ? 'default' : 'outline'}
              className="cursor-pointer text-sm px-3 py-1"
            >
              {tag.displayName}
            </Badge>
          </button>
        )
      })}
    </div>
  )
}

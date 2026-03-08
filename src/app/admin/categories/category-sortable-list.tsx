'use client'

import Link from 'next/link'
import { SortableList } from '@/components/admin/sortable-list'
import { reorderCategories } from '@/lib/actions/taxonomy'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  topicCount: number
  channelCount: number
}

export function CategorySortableList({ categories }: { categories: Category[] }) {
  return (
    <SortableList
      items={categories}
      onReorder={(orderedIds) => reorderCategories(orderedIds)}
      renderItem={(cat) => (
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/categories/${cat.id}/edit`}
              className="font-medium hover:underline"
            >
              {cat.name}
            </Link>
            <div className="flex gap-2 mt-1">
              <span className="text-xs text-muted-foreground">/{cat.slug}</span>
              <Badge variant="secondary" className="text-xs">
                {cat.topicCount} topics
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {cat.channelCount} channels
              </Badge>
            </div>
          </div>
          <Link
            href={`/admin/categories/${cat.id}/edit`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Edit
          </Link>
        </div>
      )}
    />
  )
}

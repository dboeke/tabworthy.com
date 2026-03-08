'use client'

import Link from 'next/link'
import { SortableList } from '@/components/admin/sortable-list'
import { reorderTopics } from '@/lib/actions/taxonomy'

interface Topic {
  id: string
  name: string
  slug: string
  description: string | null
  displayOrder: number
}

export function TopicSortableList({
  categoryId,
  topics,
}: {
  categoryId: string
  topics: Topic[]
}) {
  return (
    <SortableList
      items={topics}
      onReorder={(orderedIds) => reorderTopics(categoryId, orderedIds)}
      renderItem={(topic) => (
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/admin/topics/${topic.id}/edit`}
              className="font-medium hover:underline"
            >
              {topic.name}
            </Link>
            <span className="ml-2 text-xs text-muted-foreground">/{topic.slug}</span>
          </div>
          <Link
            href={`/admin/topics/${topic.id}/edit`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Edit
          </Link>
        </div>
      )}
    />
  )
}

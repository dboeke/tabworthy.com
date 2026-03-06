import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface TopicPillsProps {
  categorySlug: string
  topics: Array<{
    name: string
    slug: string
  }>
  activeTopicSlug?: string
}

export function TopicPills({
  categorySlug,
  topics,
  activeTopicSlug,
}: TopicPillsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic) => {
        const isActive = topic.slug === activeTopicSlug
        return (
          <Link
            key={topic.slug}
            href={`/categories/${categorySlug}/${topic.slug}`}
          >
            <Badge variant={isActive ? 'default' : 'outline'} className="cursor-pointer text-sm px-3 py-1">
              {topic.name}
            </Badge>
          </Link>
        )
      })}
    </div>
  )
}

import Link from 'next/link'
import { getAdminCategories, getAdminTopicsByCategory } from '@/lib/db/queries/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TopicSortableList } from './topic-sortable-list'

export default async function AdminTopicsPage() {
  const categories = await getAdminCategories()

  // Load topics per category for sortable lists
  const categoriesWithTopics = await Promise.all(
    categories.map(async (cat) => ({
      ...cat,
      topics: await getAdminTopicsByCategory(cat.id),
    }))
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
          <p className="text-sm text-muted-foreground">
            Manage topics within categories. Drag to reorder within each category.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/topics/new">New Topic</Link>
        </Button>
      </div>

      {categoriesWithTopics.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          No categories yet. Create a category first.
        </div>
      ) : (
        <div className="space-y-8">
          {categoriesWithTopics.map((cat) => (
            <div key={cat.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{cat.name}</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/topics/new?category=${cat.id}`}>
                    Add Topic
                  </Link>
                </Button>
              </div>

              {cat.topics.length === 0 ? (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No topics in this category yet.
                </div>
              ) : (
                <TopicSortableList categoryId={cat.id} topics={cat.topics} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

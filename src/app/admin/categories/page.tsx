import Link from 'next/link'
import { getAdminCategories } from '@/lib/db/queries/admin'
import { reorderCategories } from '@/lib/actions/taxonomy'
import { Button } from '@/components/ui/button'
import { CategorySortableList } from './category-sortable-list'

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage categories and their display order. Drag to reorder.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">New Category</Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          No categories yet. Create one to get started.
        </div>
      ) : (
        <CategorySortableList categories={categories} />
      )}
    </div>
  )
}

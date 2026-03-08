import Link from 'next/link'
import { getAdminCategoriesForSelect } from '@/lib/db/queries/admin'
import { TaxonomyForm } from '@/components/admin/taxonomy-form'

export default async function NewTopicPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category: defaultCategoryId } = await searchParams
  const categories = await getAdminCategoriesForSelect()

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/topics" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to topics
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New Topic</h1>
      </div>

      <TaxonomyForm
        type="topic"
        categories={categories}
        defaultCategoryId={defaultCategoryId}
      />
    </div>
  )
}

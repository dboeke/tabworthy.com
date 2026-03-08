import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminCategoryById } from '@/lib/db/queries/admin'
import { TaxonomyForm } from '@/components/admin/taxonomy-form'

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const category = await getAdminCategoryById(id)

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit Category</h1>
      </div>

      <TaxonomyForm type="category" item={category} />
    </div>
  )
}

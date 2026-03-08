import Link from 'next/link'
import { TaxonomyForm } from '@/components/admin/taxonomy-form'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/categories" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to categories
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New Category</h1>
      </div>

      <TaxonomyForm type="category" />
    </div>
  )
}

import Link from 'next/link'
import { TaxonomyForm } from '@/components/admin/taxonomy-form'

export default function NewTagPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tags" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to tags
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">New Tag</h1>
      </div>

      <TaxonomyForm type="tag" />
    </div>
  )
}

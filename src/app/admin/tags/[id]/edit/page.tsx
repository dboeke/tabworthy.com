import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminTagById } from '@/lib/db/queries/admin'
import { TaxonomyForm } from '@/components/admin/taxonomy-form'

export default async function EditTagPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const tag = await getAdminTagById(id)

  if (!tag) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/tags" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to tags
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit Tag</h1>
      </div>

      <TaxonomyForm type="tag" item={tag} />
    </div>
  )
}

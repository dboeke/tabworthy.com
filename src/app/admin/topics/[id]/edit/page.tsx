import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAdminTopicById, getAdminCategoriesForSelect } from '@/lib/db/queries/admin'
import { TaxonomyForm } from '@/components/admin/taxonomy-form'

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [topic, categories] = await Promise.all([
    getAdminTopicById(id),
    getAdminCategoriesForSelect(),
  ])

  if (!topic) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/topics" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to topics
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Edit Topic</h1>
      </div>

      <TaxonomyForm type="topic" item={topic} categories={categories} />
    </div>
  )
}

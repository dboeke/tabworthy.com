import { notFound } from 'next/navigation'
import { getCategories, getCategoryBySlug } from '@/lib/db/queries'
import { TopicPills } from '@/components/taxonomy/topic-pills'
import { ChannelCard } from '@/components/channels/channel-card'

export const revalidate = 3600

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    return categories.map((cat) => ({ slug: cat.slug }))
  } catch {
    return []
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const hasTopics = category.topics.length > 0
  const hasDirectChannels = category.directChannels.length > 0

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {category.name}
          </h1>
          {category.description && (
            <p className="mt-3 text-lg text-muted-foreground">
              {category.description}
            </p>
          )}
        </div>

        {/* Topics */}
        {hasTopics && (
          <section className="mb-10">
            <h2 className="mb-4 text-lg font-semibold">Topics</h2>
            <TopicPills categorySlug={slug} topics={category.topics} />
          </section>
        )}

        {/* Direct Channels */}
        {hasDirectChannels && (
          <section>
            <h2 className="mb-4 text-lg font-semibold">Channels</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.directChannels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state when no topics and no channels */}
        {!hasTopics && !hasDirectChannels && (
          <p className="text-muted-foreground">
            No channels in this category yet. Check back soon.
          </p>
        )}
      </div>
    </div>
  )
}

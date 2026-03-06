import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import {
  getTopicBySlug,
  getChannelsForTopic,
  getAllTagsForTopic,
  getCategories,
  getCategoryBySlug,
} from '@/lib/db/queries'
import { TagFilterBar } from '@/components/channels/tag-filter-bar'
import { ChannelCard } from '@/components/channels/channel-card'
import { BreadcrumbNav } from '@/components/taxonomy/breadcrumb-nav'
import { BreadcrumbLd } from '@/components/seo/breadcrumb-ld'
import { CategoryLd } from '@/components/seo/category-ld'

export const revalidate = 3600
export const dynamicParams = true

interface TopicPageProps {
  params: Promise<{ slug: string; topic: string }>
  searchParams: Promise<{ tags?: string }>
}

export async function generateStaticParams() {
  try {
    const categories = await getCategories()
    const params: Array<{ slug: string; topic: string }> = []

    for (const cat of categories) {
      const category = await getCategoryBySlug(cat.slug)
      if (category) {
        for (const topic of category.topics) {
          params.push({ slug: cat.slug, topic: topic.slug })
        }
      }
    }

    return params
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: TopicPageProps): Promise<Metadata> {
  const { slug, topic: topicSlug } = await params
  const topic = await getTopicBySlug(slug, topicSlug)

  if (!topic) {
    return { title: 'Topic Not Found' }
  }

  return {
    title: `${topic.name} - ${topic.category.name}`,
    description:
      topic.description ||
      `Discover the best ${topic.name} channels in ${topic.category.name}, curated by humans.`,
  }
}

export default async function TopicPage({
  params,
  searchParams,
}: TopicPageProps) {
  const { slug, topic: topicSlug } = await params
  const { tags: tagsParam } = await searchParams

  const topic = await getTopicBySlug(slug, topicSlug)

  if (!topic) {
    notFound()
  }

  const activeTagSlugs = tagsParam
    ? tagsParam.split(',').filter(Boolean)
    : []

  const [channels, availableTags] = await Promise.all([
    getChannelsForTopic(topic.id, activeTagSlugs.length > 0 ? activeTagSlugs : undefined),
    getAllTagsForTopic(topic.id),
  ])

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: topic.category.name, href: `/categories/${slug}` },
    { label: topic.name },
  ]

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <BreadcrumbLd items={breadcrumbItems} />

      {/* Topic ItemList JSON-LD */}
      <CategoryLd
        name={topic.name}
        description={topic.description}
        categorySlug={slug}
        channels={channels.map((ch) => ({ name: ch.name, slug: ch.slug }))}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:py-12">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {topic.name}
          </h1>
          {topic.description && (
            <p className="mt-3 text-lg text-muted-foreground">
              {topic.description}
            </p>
          )}
        </div>

        {/* Tag filter bar */}
        {availableTags.length > 0 && (
          <section className="mb-8">
            <TagFilterBar
              availableTags={availableTags}
              activeTags={activeTagSlugs}
            />
          </section>
        )}

        {/* Channel grid */}
        {channels.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No channels match these filters. Try removing a tag.
          </p>
        )}
      </div>
    </>
  )
}

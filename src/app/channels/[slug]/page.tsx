import { notFound } from 'next/navigation'
import { getChannelBySlug, getAllChannelSlugs } from '@/lib/db/queries'
import { ChannelProfile } from '@/components/channels/channel-profile'
import { BreadcrumbNav } from '@/components/taxonomy/breadcrumb-nav'
import { BreadcrumbLd } from '@/components/seo/breadcrumb-ld'
import { ChannelLd } from '@/components/seo/channel-ld'
import type { Metadata } from 'next'

export const dynamicParams = true
export const revalidate = 3600

interface ChannelPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const slugs = await getAllChannelSlugs()
    return slugs.map((slug) => ({ slug }))
  } catch {
    // Database may not be available at build time
    return []
  }
}

export async function generateMetadata({
  params,
}: ChannelPageProps): Promise<Metadata> {
  const { slug } = await params
  const channel = await getChannelBySlug(slug)

  if (!channel) {
    return { title: 'Channel Not Found' }
  }

  const description = channel.editorialSummary.length > 160
    ? channel.editorialSummary.slice(0, 157) + '...'
    : channel.editorialSummary

  return {
    title: `${channel.name}`,
    description,
  }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params
  const channel = await getChannelBySlug(slug)

  if (!channel) {
    notFound()
  }

  // Build breadcrumb: if channel has a primary category, include it
  const primaryTopic = channel.channelTopics[0]
  const primaryCategory = primaryTopic
    ? primaryTopic.topic.category
    : channel.channelCategories[0]?.category

  const breadcrumbItems = primaryCategory
    ? [
        { label: 'Home', href: '/' },
        { label: primaryCategory.name, href: `/categories/${primaryCategory.slug}` },
        ...(primaryTopic
          ? [{ label: primaryTopic.topic.name, href: `/categories/${primaryCategory.slug}/${primaryTopic.topic.slug}` }]
          : []),
        { label: channel.name },
      ]
    : [
        { label: 'Home', href: '/' },
        { label: channel.name },
      ]

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <BreadcrumbLd items={breadcrumbItems} />

      {/* Channel Organization JSON-LD */}
      <ChannelLd
        name={channel.name}
        slug={channel.slug}
        description={channel.editorialSummary}
        platformUrl={channel.platformUrl}
        platformName={channel.platform.displayName}
        creator={channel.creator}
        currentChannelId={channel.id}
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <BreadcrumbNav items={breadcrumbItems} />
      </div>

      <ChannelProfile channel={channel} />
    </>
  )
}

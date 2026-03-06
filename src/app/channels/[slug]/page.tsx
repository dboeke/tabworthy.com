import { notFound } from 'next/navigation'
import { getChannelBySlug, getAllChannelSlugs } from '@/lib/db/queries'
import { ChannelProfile } from '@/components/channels/channel-profile'
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
    title: `${channel.name} | Tabworthy`,
    description,
  }
}

export default async function ChannelPage({ params }: ChannelPageProps) {
  const { slug } = await params
  const channel = await getChannelBySlug(slug)

  if (!channel) {
    notFound()
  }

  return (
    <main>
      <ChannelProfile channel={channel} />
    </main>
  )
}

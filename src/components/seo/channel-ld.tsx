import { JsonLd } from './json-ld'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tabworthy.com'

interface ChannelLdCreator {
  name: string
  channels: Array<{
    id: string
    platformUrl: string
    platform: {
      displayName: string
    }
  }>
}

interface ChannelLdProps {
  name: string
  slug: string
  description: string
  platformUrl: string
  platformName: string
  creator: ChannelLdCreator
  currentChannelId: string
}

/**
 * Organization (or Person) JSON-LD for channel profile pages.
 * Includes sameAs links to other platform URLs from the same creator.
 */
export function ChannelLd({
  name,
  slug,
  description,
  platformUrl,
  platformName,
  creator,
  currentChannelId,
}: ChannelLdProps) {
  // Collect all platform URLs from creator's other channels as sameAs
  const sameAsUrls = creator.channels
    .filter((c) => c.id !== currentChannelId)
    .map((c) => c.platformUrl)
    .filter(Boolean)

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        description,
        url: `${BASE_URL}/channels/${slug}`,
        sameAs: [platformUrl, ...sameAsUrls],
      }}
    />
  )
}

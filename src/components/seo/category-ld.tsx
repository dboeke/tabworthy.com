import { JsonLd } from './json-ld'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://tabworthy.com'

interface CategoryLdChannel {
  name: string
  slug: string
}

interface CategoryLdTopic {
  name: string
  slug: string
}

interface CategoryLdProps {
  /** Category or topic name */
  name: string
  /** Category or topic description */
  description?: string | null
  /** Category slug for building URLs */
  categorySlug: string
  /** Channels to list (for topic pages or categories without topics) */
  channels?: CategoryLdChannel[]
  /** Topics to list (for category pages with topics) */
  topics?: CategoryLdTopic[]
}

/**
 * ItemList JSON-LD for category and topic pages.
 * Lists either topics (on category page) or channels (on topic page).
 */
export function CategoryLd({
  name,
  description,
  categorySlug,
  channels,
  topics,
}: CategoryLdProps) {
  const listItems = topics
    ? topics.map((topic, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        name: topic.name,
        url: `${BASE_URL}/categories/${categorySlug}/${topic.slug}`,
      }))
    : (channels ?? []).map((channel, index) => ({
        '@type': 'ListItem' as const,
        position: index + 1,
        name: channel.name,
        url: `${BASE_URL}/channels/${channel.slug}`,
      }))

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name,
        ...(description ? { description } : {}),
        numberOfItems: listItems.length,
        itemListElement: listItems,
      }}
    />
  )
}
